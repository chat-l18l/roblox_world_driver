import { createSession, type Session } from "./session.ts";

const KEY = "wereldpost.save.v1";
const SAVE_VERSION = 1;

export type SaveBlob = {
  version: number;
  mastery: Record<string, number>;
  score: number;
  streak: number;
  deliveries: number;
  seed: number;
  fromIso: string;
};

export function toSave(s: Session): SaveBlob {
  return {
    version: SAVE_VERSION,
    mastery: s.mastery,
    score: s.score,
    streak: s.streak,
    deliveries: s.deliveries,
    seed: s.seed,
    fromIso: s.fromIso,
  };
}

export function applySave(s: Session, blob: SaveBlob): Session {
  return {
    ...s,
    mastery: blob.mastery ?? {},
    score: blob.score ?? 0,
    streak: blob.streak ?? 0,
    deliveries: blob.deliveries ?? 0,
    seed: blob.seed ?? s.seed,
    fromIso: blob.fromIso ?? s.fromIso,
  };
}

export function migrate(raw: unknown): SaveBlob | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<SaveBlob>;
  if (r.version !== 1) return null;
  return {
    version: 1,
    mastery: r.mastery ?? {},
    score: r.score ?? 0,
    streak: r.streak ?? 0,
    deliveries: r.deliveries ?? 0,
    seed: r.seed ?? 1,
    fromIso: r.fromIso ?? "NL",
  };
}

export function loadSave(): SaveBlob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistSave(s: Session): void {
  if (typeof window === "undefined") return;
  try {
    const prev = window.localStorage.getItem(KEY);
    if (prev) window.localStorage.setItem(`${KEY}.bak`, prev);
    window.localStorage.setItem(KEY, JSON.stringify(toSave(s)));
  } catch {
    /* private mode / quota */
  }
}

export function bootSession(): Session {
  const s = createSession(1);
  const blob = loadSave();
  return blob ? applySave(s, blob) : s;
}
