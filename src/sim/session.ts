import { COUNTRIES, HUB_ISO, countryByIso, type Country } from "../model/countries.ts";
import {
  highestUnlockedRegion,
  learnerStage,
  playableCountries,
  regionIndex,
  type LearnerStage,
} from "../model/curriculum.ts";
import { haversineKm } from "./geo.ts";
import { mulberry32, pickIndex } from "./rng.ts";
import { makeQuiz, type Quiz } from "./quiz.ts";
import {
  chooseCraft,
  createVehicle,
  stepVehicle,
  type DriveInput,
  type Vehicle,
} from "./vehicle.ts";

export type SessionState =
  | "boot"
  | "hub"
  | "brief"
  | "transit"
  | "quiz"
  | "debrief"
  | "paused";

export type SessionEvent =
  | { type: "ready" }
  | { type: "accept" }
  | { type: "arrive" }
  | { type: "answer"; choice: string }
  | { type: "continue" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "abandon" };

export type Mission = {
  fromIso: string;
  destIso: string;
  startedAt: number;
  distanceKm: number;
};

export type Session = {
  state: SessionState;
  resumeState: SessionState | null;
  vehicle: Vehicle;
  mission: Mission | null;
  quiz: Quiz | null;
  lastAnswer: "correct" | "wrong" | null;
  tries: number;
  mastery: Record<string, number>;
  score: number;
  streak: number;
  deliveries: number;
  seed: number;
  missionTime: number;
  fromIso: string;
  notice: string;
};

export const ARRIVE_RADIUS_KM = 90;
export const MAX_QUIZ_TRIES = 2;

export const SESSION_TRANSITIONS: {
  from: SessionState | SessionState[];
  event: SessionEvent["type"];
  to: SessionState;
}[] = [
  { from: "boot", event: "ready", to: "hub" },
  { from: "hub", event: "accept", to: "brief" },
  { from: "brief", event: "accept", to: "transit" },
  { from: "transit", event: "arrive", to: "quiz" },
  { from: "transit", event: "abandon", to: "hub" },
  { from: "quiz", event: "answer", to: "debrief" },
  { from: "quiz", event: "answer", to: "quiz" },
  { from: "debrief", event: "continue", to: "hub" },
  { from: ["hub", "brief", "transit", "quiz", "debrief"], event: "pause", to: "paused" },
  { from: "paused", event: "resume", to: "hub" },
];

export function createSession(seed = 1): Session {
  const hub = countryByIso(HUB_ISO);
  return {
    state: "boot",
    resumeState: null,
    vehicle: createVehicle(hub.lat, hub.lon, "van"),
    mission: null,
    quiz: null,
    lastAnswer: null,
    tries: 0,
    mastery: {},
    score: 0,
    streak: 0,
    deliveries: 0,
    seed,
    missionTime: 0,
    fromIso: HUB_ISO,
    notice: "Depot Amsterdam. Wacht op dispatch.",
  };
}

export function stageOf(s: Session): LearnerStage {
  return learnerStage(s.mastery);
}

export function destCountry(s: Session): Country | null {
  return s.mission ? countryByIso(s.mission.destIso) : null;
}

export function reduceSession(s: Session, e: SessionEvent): Session {
  if (e.type === "pause" && s.state !== "paused" && s.state !== "boot") {
    return { ...s, resumeState: s.state, state: "paused", notice: "Pauze." };
  }
  if (e.type === "resume" && s.state === "paused") {
    return {
      ...s,
      state: s.resumeState ?? "hub",
      resumeState: null,
      notice: "Verder.",
    };
  }

  switch (s.state) {
    case "boot":
      if (e.type === "ready") {
        return dispatch({ ...s, state: "hub", notice: "Klaar voor de eerste rit." });
      }
      return s;
    case "hub":
      if (e.type === "accept") return toBrief(s);
      return s;
    case "brief":
      if (e.type === "accept" && s.mission) {
        return {
          ...s,
          state: "transit",
          missionTime: 0,
          notice: `Onderweg naar ${countryByIso(s.mission.destIso).capital}.`,
        };
      }
      return s;
    case "transit":
      if (e.type === "abandon") {
        return {
          ...s,
          state: "hub",
          mission: null,
          quiz: null,
          streak: 0,
          notice: "Rit geannuleerd.",
        };
      }
      if (e.type === "arrive" && s.mission) return toQuiz(s);
      return s;
    case "quiz":
      if (e.type === "answer") return grade(s, e.choice);
      return s;
    case "debrief":
      if (e.type === "continue") return dispatch({ ...s, state: "hub" });
      return s;
    default:
      return s;
  }
}

export function tickSession(s: Session, input: DriveInput, dt: number): Session {
  if (s.state !== "transit" || !s.mission) return s;
  const vehicle = stepVehicle(s.vehicle, input, dt);
  const dest = countryByIso(s.mission.destIso);
  const next: Session = {
    ...s,
    vehicle,
    missionTime: s.missionTime + dt,
  };
  const d = haversineKm(vehicle.lat, vehicle.lon, dest.lat, dest.lon);
  if (d <= ARRIVE_RADIUS_KM) {
    return reduceSession(
      { ...next, vehicle: { ...vehicle, speed: 0 } },
      { type: "arrive" },
    );
  }
  return next;
}

function toBrief(s: Session): Session {
  const dest = pickDestination(s);
  const from = countryByIso(s.fromIso);
  const distanceKm = haversineKm(from.lat, from.lon, dest.lat, dest.lon);
  const craft = chooseCraft(distanceKm);
  return {
    ...s,
    state: "brief",
    lastAnswer: null,
    tries: 0,
    quiz: null,
    vehicle: {
      ...s.vehicle,
      lat: from.lat,
      lon: from.lon,
      speed: 0,
      heading: s.vehicle.heading,
      craft,
    },
    mission: {
      fromIso: from.iso,
      destIso: dest.iso,
      startedAt: s.deliveries,
      distanceKm,
    },
    notice: `Pakket naar ${dest.capital}, ${dest.nameNl}.`,
  };
}

function toQuiz(s: Session): Session {
  if (!s.mission) return s;
  const dest = countryByIso(s.mission.destIso);
  const rng = mulberry32(s.seed + s.deliveries * 97 + dest.isoNumeric);
  const quiz = makeQuiz(
    dest,
    playableCountries(s.mastery),
    s.mastery[dest.iso] ?? 0,
    rng,
  );
  return {
    ...s,
    state: "quiz",
    vehicle: { ...s.vehicle, speed: 0, lat: dest.lat, lon: dest.lon },
    quiz,
    tries: 0,
    lastAnswer: null,
    notice: `Aangekomen in ${dest.capital}. Kennischeck.`,
  };
}

function grade(s: Session, choice: string): Session {
  if (!s.quiz || !s.mission) return s;
  const destIso = s.mission.destIso;
  const correct = choice === s.quiz.answer;
  if (!correct) {
    const tries = s.tries + 1;
    if (tries < MAX_QUIZ_TRIES) {
      return {
        ...s,
        tries,
        lastAnswer: "wrong",
        streak: 0,
        notice: "Nog een poging.",
      };
    }
    return {
      ...s,
      state: "debrief",
      tries,
      lastAnswer: "wrong",
      streak: 0,
      fromIso: destIso,
      mission: s.mission,
      notice: `Fout. Het was ${s.quiz.answer}. Pakket is wel afgegeven.`,
    };
  }

  const prev = s.mastery[destIso] ?? 0;
  const mastery = { ...s.mastery, [destIso]: Math.min(3, prev + 1) };
  const timeBonus = Math.max(0, Math.round(40 - s.missionTime));
  const score = s.score + 100 + timeBonus + s.streak * 10;
  return {
    ...s,
    state: "debrief",
    lastAnswer: "correct",
    mastery,
    score,
    streak: s.streak + 1,
    deliveries: s.deliveries + 1,
    fromIso: destIso,
    notice: `Bezorgd. +${100 + timeBonus} punten.`,
  };
}

function dispatch(s: Session): Session {
  const dest = pickDestination(s);
  return {
    ...s,
    notice: `Volgende: ${dest.capital}.`,
  };
}

export function pickDestination(s: Session): Country {
  const playable = playableCountries(s.mastery).filter((c) => c.iso !== s.fromIso);
  const pool = playable.length ? playable : COUNTRIES.filter((c) => c.iso !== s.fromIso);
  const weak = pool.filter((c) => (s.mastery[c.iso] ?? 0) < 3);
  const use = weak.length ? weak : pool;
  const rng = mulberry32(s.seed + s.deliveries * 13 + s.fromIso.charCodeAt(0));
  return use[pickIndex(rng, use.length)]!;
}

export function unlockedLabel(s: Session): string {
  return highestUnlockedRegion(s.mastery);
}

export function progressInRegion(s: Session): { have: number; total: number } {
  const region = highestUnlockedRegion(s.mastery);
  const members = COUNTRIES.filter((c) => c.region === region);
  const have = members.filter((c) => (s.mastery[c.iso] ?? 0) >= 2).length;
  return { have, total: members.length };
}

export function currentUnlockCap(s: Session): number {
  return regionIndex(highestUnlockedRegion(s.mastery));
}
