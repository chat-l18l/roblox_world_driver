import type { DriveInput } from "@/sim/vehicle.ts";

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "Escape",
  "KeyP",
]);

export type InputState = {
  keys: Set<string>;
  touch: { throttle: number; steer: number } | null;
  qaSteer: number | null;
  pauseQueued: boolean;
};

export function createInput(): InputState {
  return { keys: new Set(), touch: null, qaSteer: null, pauseQueued: false };
}

export function attachInput(target: HTMLElement, input: InputState): () => void {
  const onDown = (e: KeyboardEvent) => {
    if (GAME_CODES.has(e.code)) e.preventDefault();
    input.keys.add(e.code);
    if (e.code === "Escape" || e.code === "KeyP") input.pauseQueued = true;
  };
  const onUp = (e: KeyboardEvent) => {
    input.keys.delete(e.code);
  };
  const clear = () => input.keys.clear();

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });

  const pointers = new Map<number, { x: number; y: number }>();
  let origin: { x: number; y: number } | null = null;

  const readStick = () => {
    if (!origin || pointers.size === 0) {
      input.touch = null;
      return;
    }
    const last = [...pointers.values()].at(-1)!;
    const dx = (last.x - origin.x) / 56;
    const dy = (last.y - origin.y) / 56;
    const m = Math.hypot(dx, dy);
    if (m < 0.15) {
      input.touch = { throttle: 0, steer: 0 };
      return;
    }
    const scale = ((Math.min(1, m) - 0.15) / 0.85) / m;
    const x = dx * scale;
    const y = dy * scale;
    input.touch = { throttle: clamp(-y, -1, 1), steer: clamp(-x, -1, 1) };
  };

  const onPtrDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = e.target as HTMLElement | null;
    if (el?.closest("button, a, input, textarea, [role='button']")) return;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x > rect.width * 0.62) return;
    target.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x, y });
    if (!origin) origin = { x, y };
    readStick();
  };
  const onPtrMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    const rect = target.getBoundingClientRect();
    pointers.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top });
    readStick();
  };
  const onPtrUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      origin = null;
      input.touch = null;
    } else readStick();
  };

  target.addEventListener("pointerdown", onPtrDown);
  target.addEventListener("pointermove", onPtrMove);
  target.addEventListener("pointerup", onPtrUp);
  target.addEventListener("pointercancel", onPtrUp);

  return () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", clear);
    target.removeEventListener("pointerdown", onPtrDown);
    target.removeEventListener("pointermove", onPtrMove);
    target.removeEventListener("pointerup", onPtrUp);
    target.removeEventListener("pointercancel", onPtrUp);
  };
}

export function sampleDrive(input: InputState): DriveInput {
  let throttle = 0;
  let steer = 0;
  const k = input.keys;
  if (k.has("KeyW") || k.has("ArrowUp")) throttle += 1;
  if (k.has("KeyS") || k.has("ArrowDown")) throttle -= 1;
  if (k.has("KeyA") || k.has("ArrowLeft")) steer += 1;
  if (k.has("KeyD") || k.has("ArrowRight")) steer -= 1;

  const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : [];
  if (pads) {
    for (const pad of pads) {
      if (!pad || pad.mapping !== "standard") continue;
      const ax = pad.axes[0] ?? 0;
      const ay = pad.axes[1] ?? 0;
      const m = Math.hypot(ax, ay);
      if (m > 0.15) {
        const scale = ((Math.min(1, m) - 0.15) / 0.85) / m;
        steer += -ax * scale;
        throttle += -ay * scale;
      }
      if (pad.buttons[7]?.value) throttle += pad.buttons[7].value;
      if (pad.buttons[6]?.value) throttle -= pad.buttons[6].value;
    }
  }

  if (input.touch) {
    throttle += input.touch.throttle;
    steer += input.touch.steer;
  }
  if (input.qaSteer !== null) steer = input.qaSteer;

  return { throttle: clamp(throttle, -1, 1), steer: clamp(steer, -1, 1) };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
