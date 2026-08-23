import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countryByIso } from "../model/countries.ts";
import { haversineKm } from "./geo.ts";
import { makeQuiz } from "./quiz.ts";
import { mulberry32 } from "./rng.ts";
import {
  ARRIVE_RADIUS_KM,
  createSession,
  reduceSession,
  tickSession,
} from "./session.ts";
import { createVehicle, stepVehicle } from "./vehicle.ts";

describe("session FSM", () => {
  it("boot → hub → brief → transit", () => {
    let s = createSession(7);
    assert.equal(s.state, "boot");
    s = reduceSession(s, { type: "ready" });
    assert.equal(s.state, "hub");
    s = reduceSession(s, { type: "accept" });
    assert.equal(s.state, "brief");
    assert.ok(s.mission);
    assert.notEqual(s.mission.destIso, s.mission.fromIso);
    s = reduceSession(s, { type: "accept" });
    assert.equal(s.state, "transit");
  });

  it("ignores illegal events", () => {
    const s = createSession(1);
    const next = reduceSession(s, { type: "arrive" });
    assert.equal(next.state, "boot");
    assert.equal(next.mission, null);
  });

  it("pause restores previous state", () => {
    let s = createSession(3);
    s = reduceSession(s, { type: "ready" });
    s = reduceSession(s, { type: "accept" });
    s = reduceSession(s, { type: "pause" });
    assert.equal(s.state, "paused");
    s = reduceSession(s, { type: "resume" });
    assert.equal(s.state, "brief");
  });

  it("correct quiz increases mastery and score", () => {
    let s = createSession(11);
    s = reduceSession(s, { type: "ready" });
    s = reduceSession(s, { type: "accept" });
    s = reduceSession(s, { type: "accept" });
    s = reduceSession(s, { type: "arrive" });
    assert.equal(s.state, "quiz");
    assert.ok(s.quiz);
    const dest = s.quiz.destIso;
    s = reduceSession(s, { type: "answer", choice: s.quiz.answer });
    assert.equal(s.state, "debrief");
    assert.equal(s.lastAnswer, "correct");
    assert.equal(s.mastery[dest], 1);
    assert.ok(s.score >= 100);
    assert.equal(s.fromIso, dest);
  });

  it("wrong then correct stays in quiz then debriefs", () => {
    let s = createSession(11);
    s = reduceSession(s, { type: "ready" });
    s = reduceSession(s, { type: "accept" });
    s = reduceSession(s, { type: "accept" });
    s = reduceSession(s, { type: "arrive" });
    const wrong = s.quiz!.options.find((o) => o !== s.quiz!.answer)!;
    s = reduceSession(s, { type: "answer", choice: wrong });
    assert.equal(s.state, "quiz");
    assert.equal(s.tries, 1);
    s = reduceSession(s, { type: "answer", choice: s.quiz!.answer });
    assert.equal(s.state, "debrief");
    assert.equal(s.lastAnswer, "correct");
  });
});

describe("vehicle", () => {
  it("A (steer +1) decreases heading while moving north", () => {
    let v = createVehicle(52.37, 4.9, "van");
    v = { ...v, speed: 20_000, heading: 0 };
    const after = stepVehicle(v, { throttle: 1, steer: 1 }, 0.5);
    assert.ok(after.heading < 0, `heading ${after.heading} should be < 0 (left)`);
  });

  it("D (steer -1) increases heading while moving north", () => {
    let v = createVehicle(52.37, 4.9, "van");
    v = { ...v, speed: 20_000, heading: 0 };
    const after = stepVehicle(v, { throttle: 1, steer: -1 }, 0.5);
    assert.ok(after.heading > 0, `heading ${after.heading} should be > 0 (right)`);
  });

  it("throttle north increases latitude", () => {
    const v = createVehicle(52.37, 4.9, "van");
    const after = stepVehicle(v, { throttle: 1, steer: 0 }, 1);
    assert.ok(after.lat > v.lat);
  });
});

describe("quiz", () => {
  it("is deterministic for a seed", () => {
    const dest = countryByIso("FR");
    const a = makeQuiz(dest, [dest, countryByIso("DE"), countryByIso("BE")], 0, mulberry32(42));
    const b = makeQuiz(dest, [dest, countryByIso("DE"), countryByIso("BE")], 0, mulberry32(42));
    assert.deepEqual(a, b);
    assert.ok(a.options.includes(a.answer));
    assert.equal(a.options.length, 3);
  });
});

describe("arrival radius", () => {
  it("Amsterdam–Brussel is outside hub radius", () => {
    const a = countryByIso("NL");
    const b = countryByIso("BE");
    assert.ok(haversineKm(a.lat, a.lon, b.lat, b.lon) > ARRIVE_RADIUS_KM);
  });

  it("tickSession arrives when driven onto the capital", () => {
    let s = createSession(4);
    s = reduceSession(s, { type: "ready" });
    s = reduceSession(s, { type: "accept" });
    s = reduceSession(s, { type: "accept" });
    const dest = countryByIso(s.mission!.destIso);
    s = {
      ...s,
      vehicle: { ...s.vehicle, lat: dest.lat, lon: dest.lon, speed: 0 },
    };
    s = tickSession(s, { throttle: 0, steer: 0 }, 0.016);
    assert.equal(s.state, "quiz");
  });
});
