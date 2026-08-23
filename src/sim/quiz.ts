import type { Country } from "../model/countries.ts";
import { pickIndex, pickN } from "./rng.ts";

export type QuizKind = "capital" | "language" | "river" | "airport" | "countryOf";

export type Quiz = {
  kind: QuizKind;
  prompt: string;
  answer: string;
  options: string[];
  destIso: string;
};

const KINDS_BY_MASTERY: QuizKind[][] = [
  ["capital", "countryOf"],
  ["capital", "language", "countryOf"],
  ["language", "river", "airport"],
  ["river", "airport", "countryOf"],
];

export function makeQuiz(
  dest: Country,
  pool: Country[],
  mastery: number,
  rng: () => number,
): Quiz {
  const band = Math.max(0, Math.min(3, Math.floor(mastery)));
  const kinds = KINDS_BY_MASTERY[band]!;
  const kind = kinds[pickIndex(rng, kinds.length)]!;
  return build(kind, dest, pool, rng);
}

function build(kind: QuizKind, dest: Country, pool: Country[], rng: () => number): Quiz {
  const others = pool.filter((c) => c.iso !== dest.iso);
  switch (kind) {
    case "capital":
      return choice(
        kind,
        dest,
        `Wat is de hoofdstad van ${dest.nameNl}?`,
        dest.capital,
        others.map((c) => c.capital),
        rng,
      );
    case "language":
      return choice(
        kind,
        dest,
        `Welke taal spreekt men in ${dest.nameNl}?`,
        dest.language,
        others.map((c) => c.language),
        rng,
      );
    case "river":
      return choice(
        kind,
        dest,
        `Welke rivier is belangrijk in ${dest.nameNl}?`,
        dest.river,
        others.map((c) => c.river),
        rng,
      );
    case "airport":
      return choice(
        kind,
        dest,
        `Wat is de belangrijkste luchthavencode van ${dest.capital}?`,
        dest.airport,
        others.map((c) => c.airport),
        rng,
      );
    case "countryOf":
      return choice(
        kind,
        dest,
        `In welk land ligt ${dest.capital}?`,
        dest.nameNl,
        others.map((c) => c.nameNl),
        rng,
      );
  }
}

function choice(
  kind: QuizKind,
  dest: Country,
  prompt: string,
  answer: string,
  distractors: string[],
  rng: () => number,
): Quiz {
  const unique = [...new Set(distractors.filter((d) => d !== answer))];
  const wrong = pickN(rng, unique, 2);
  const options = pickN(rng, [answer, ...wrong], wrong.length + 1);
  return { kind, prompt, answer, options, destIso: dest.iso };
}
