import { COUNTRIES, type Country, type RegionId } from "./countries.ts";

/** Incremental unlocks. Same data will live in Shared.Model.Curriculum. */

export const REGION_ORDER: RegionId[] = [
  "lage-landen",
  "west-europa",
  "europa",
  "wereld",
];

export const REGION_LABEL: Record<RegionId, string> = {
  "lage-landen": "Lage Landen",
  "west-europa": "West-Europa",
  europa: "Europa",
  wereld: "Wereld",
};

export const REGION_BLURB: Record<RegionId, string> = {
  "lage-landen": "Vanuit Amsterdam de buurlanden. Hoofdsteden die je al half kent.",
  "west-europa": "Kust, eilanden, Iberisch schiereiland. Langere ritten, meer talen.",
  europa: "Van de Donau tot de fjorden. Relatieve ligging wordt het lesmateriaal.",
  wereld: "Intercontinentale vluchten. Rivieren, luchthavens, talen van de wereld.",
};

export const MASTERY_TO_UNLOCK_NEXT = 2;
export const UNLOCK_RATIO = 0.8;

export function regionIndex(id: RegionId): number {
  return REGION_ORDER.indexOf(id);
}

export function highestUnlockedRegion(mastery: Record<string, number>): RegionId {
  let unlocked: RegionId = "lage-landen";
  for (let i = 0; i < REGION_ORDER.length - 1; i++) {
    const region = REGION_ORDER[i]!;
    const members = COUNTRIES.filter((c) => c.region === region);
    const ready = members.filter(
      (c) => (mastery[c.iso] ?? 0) >= MASTERY_TO_UNLOCK_NEXT,
    ).length;
    if (members.length > 0 && ready / members.length >= UNLOCK_RATIO) {
      unlocked = REGION_ORDER[i + 1]!;
    } else {
      break;
    }
  }
  return unlocked;
}

export function playableCountries(mastery: Record<string, number>): Country[] {
  const cap = regionIndex(highestUnlockedRegion(mastery));
  return COUNTRIES.filter((c) => regionIndex(c.region) <= cap);
}

export type LearnerStage = "novice" | "apprentice" | "courier" | "atlas";

export function learnerStage(mastery: Record<string, number>): LearnerStage {
  const values = Object.values(mastery);
  const mastered = values.filter((v) => v >= 3).length;
  if (mastered >= 16) return "atlas";
  if (mastered >= 8) return "courier";
  if (mastered >= 3) return "apprentice";
  return "novice";
}

export const STAGE_LABEL: Record<LearnerStage, string> = {
  novice: "Stagiair",
  apprentice: "Koerier",
  courier: "Routekenner",
  atlas: "Atlas",
};

export const STAGE_HINT: Record<LearnerStage, string> = {
  novice: "Kaart toont landnamen en hoofdsteden.",
  apprentice: "Hoofdsteden verdwijnen. Landnamen blijven.",
  courier: "Alleen silhouet en vlagkleuren.",
  atlas: "Blanco kaart. Het adres is je enige hint.",
};
