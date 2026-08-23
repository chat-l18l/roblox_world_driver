let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.05): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export function sfxDepart(): void {
  beep(220, 0.12, "triangle", 0.04);
  beep(330, 0.18, "sine", 0.03);
}

export function sfxArrive(): void {
  beep(392, 0.1, "square", 0.03);
  beep(523, 0.16, "triangle", 0.04);
}

export function sfxOk(): void {
  beep(523, 0.12, "sine", 0.045);
  beep(784, 0.2, "sine", 0.035);
}

export function sfxBad(): void {
  beep(180, 0.2, "sawtooth", 0.04);
}
