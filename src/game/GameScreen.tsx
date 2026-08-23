import { useEffect, useRef, useState, type ReactNode } from "react";
import { countryByIso } from "@/model/countries.ts";
import {
  REGION_LABEL,
  STAGE_HINT,
  STAGE_LABEL,
  highestUnlockedRegion,
} from "@/model/curriculum.ts";
import {
  destCountry,
  progressInRegion,
  reduceSession,
  stageOf,
  tickSession,
  type Session,
} from "@/sim/session.ts";
import { bootSession, persistSave } from "@/sim/save.ts";
import { sfxArrive, sfxBad, sfxDepart, sfxOk, unlockAudio } from "./audio.ts";
import { attachInput, createInput, sampleDrive, type InputState } from "./input.ts";
import {
  addTrauma,
  createCam,
  renderWorld,
  routeInfo,
  stepCam,
  type Cam,
} from "./renderMap.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FlagBars } from "@/components/FlagBars.tsx";
import { cn } from "@/lib/utils.ts";

type Snapshot = {
  state: Session["state"];
  score: number;
  streak: number;
  deliveries: number;
  notice: string;
  missionTime: number;
  craft: Session["vehicle"]["craft"];
  destIso: string | null;
  fromIso: string;
  quiz: Session["quiz"];
  lastAnswer: Session["lastAnswer"];
  tries: number;
  stage: ReturnType<typeof stageOf>;
  region: string;
  progress: { have: number; total: number };
  km: number | null;
  bearing: number | null;
  speed: number;
};

function snap(s: Session): Snapshot {
  const route = routeInfo(s);
  const dest = destCountry(s);
  return {
    state: s.state,
    score: s.score,
    streak: s.streak,
    deliveries: s.deliveries,
    notice: s.notice,
    missionTime: s.missionTime,
    craft: s.vehicle.craft,
    destIso: dest?.iso ?? null,
    fromIso: s.fromIso,
    quiz: s.quiz,
    lastAnswer: s.lastAnswer,
    tries: s.tries,
    stage: stageOf(s),
    region: REGION_LABEL[highestUnlockedRegion(s.mastery)],
    progress: progressInRegion(s),
    km: route?.km ?? null,
    bearing: route?.bearing ?? null,
    speed: s.vehicle.speed,
  };
}

export function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<Session>(bootSession());
  const camRef = useRef<Cam>(createCam(sessionRef.current));
  const inputRef = useRef<InputState>(createInput());
  const [ui, setUi] = useState<Snapshot>(() => snap(sessionRef.current));
  const [started, setStarted] = useState(false);
  const [stick, setStick] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const detach = attachInput(wrap, inputRef.current);
    const mq = window.matchMedia("(pointer: coarse)");
    setStick(mq.matches);

    const probe = {
      getYaw: () => sessionRef.current.vehicle.heading,
      getSpeed: () => sessionRef.current.vehicle.speed,
      setSteer: (v: number) => {
        inputRef.current.qaSteer = v;
      },
      setKeys: (codes: string[]) => {
        inputRef.current.keys = new Set(codes);
      },
    };
    window.__controlsTest = probe;

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let prevState = sessionRef.current.state;
    let frames = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += dt;
      const step = 1 / 60;
      while (acc >= step) {
        let s = sessionRef.current;
        if (inputRef.current.pauseQueued) {
          inputRef.current.pauseQueued = false;
          s = reduceSession(s, s.state === "paused" ? { type: "resume" } : { type: "pause" });
        }
        if (s.state === "transit") {
          s = tickSession(s, sampleDrive(inputRef.current), step);
        }
        sessionRef.current = s;
        camRef.current = stepCam(
          camRef.current,
          s,
          step,
          wrap.clientWidth || 800,
          wrap.clientHeight || 600,
        );
        acc -= step;
      }

      const s = sessionRef.current;
      if (s.state !== prevState) {
        if (s.state === "transit") sfxDepart();
        if (s.state === "quiz") {
          sfxArrive();
          camRef.current = addTrauma(camRef.current, 0.45);
        }
        if (s.state === "debrief") {
          if (s.lastAnswer === "correct") sfxOk();
          else sfxBad();
          persistSave(s);
          camRef.current = addTrauma(camRef.current, 0.25);
        }
        prevState = s.state;
        setUi(snap(s));
      }
      frames += 1;
      if (frames % 8 === 0) setUi(snap(s));

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderWorld(ctx, s, camRef.current, w, h, now / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      detach();
      if (window.__controlsTest === probe) delete window.__controlsTest;
    };
  }, []);

  const send = (e: Parameters<typeof reduceSession>[1]) => {
    sessionRef.current = reduceSession(sessionRef.current, e);
    setUi(snap(sessionRef.current));
    if (sessionRef.current.state === "debrief" || sessionRef.current.state === "hub") {
      persistSave(sessionRef.current);
    }
  };

  const start = () => {
    unlockAudio();
    let s = sessionRef.current;
    if (s.state === "boot") s = reduceSession(s, { type: "ready" });
    if (s.state === "hub") s = reduceSession(s, { type: "accept" });
    sessionRef.current = s;
    camRef.current = createCam(s);
    setStarted(true);
    setUi(snap(s));
  };

  const nextPackage = () => {
    let s = sessionRef.current;
    s = reduceSession(s, { type: "continue" });
    s = reduceSession(s, { type: "accept" });
    sessionRef.current = s;
    setUi(snap(s));
  };

  const dest = ui.destIso ? countryByIso(ui.destIso) : null;

  return (
    <div
      ref={wrapRef}
      className="relative h-[calc(100dvh-3.5rem-3.25rem)] min-h-[28rem] overflow-hidden bg-water sm:h-[calc(100dvh-3.5rem)]"
      style={{ touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto rounded-[var(--radius-md)] border border-border bg-bg/90 px-3 py-2">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">status</p>
          <p className="font-mono text-sm tabular-nums text-fg">{ui.state}</p>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1 rounded-[var(--radius-md)] border border-border bg-bg/90 px-3 py-2">
          <p className="font-mono text-lg tabular-nums leading-none">{ui.score}</p>
          <p className="text-[11px] text-muted">
            {ui.deliveries} ritten · reeks {ui.streak}
          </p>
          {ui.state === "transit" && (
            <button
              type="button"
              className="mt-1 text-[11px] text-muted underline-offset-2 hover:underline"
              onClick={() => send({ type: "pause" })}
            >
              Pauze
            </button>
          )}
        </div>
      </div>

      {ui.state === "transit" && dest && (
        <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center px-3">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-bg/92 px-4 py-2">
            <FlagBars country={dest} className="h-5 w-8" />
            <div>
              <p className="text-sm font-medium leading-tight">
                {dest.capital}
                <span className="text-muted"> · {dest.nameNl}</span>
              </p>
              <p className="font-mono text-[11px] tabular-nums text-muted">
                {ui.km !== null ? `${Math.round(ui.km)} km` : ""}
                {ui.bearing !== null ? ` · koers ${Math.round(ui.bearing)}°` : ""}
                {` · ${ui.craft === "plane" ? "vlucht" : "rit"}`}
                {` · ${Math.max(0, Math.round(ui.missionTime))}s`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
        <p className="max-w-[14rem] text-[11px] text-fg/80 sm:max-w-xs">
          {STAGE_LABEL[ui.stage]} · {STAGE_HINT[ui.stage]}
        </p>
        {stick && ui.state === "transit" && (
          <div className="pointer-events-none mb-2 ml-1 size-28 rounded-full border border-fg/25 bg-bg/30" />
        )}
        <Badge variant="outline" className="pointer-events-auto">
          {ui.progress.have}/{ui.progress.total} in deze schil
        </Badge>
      </div>

      {!started && (
        <Overlay>
          <p className="font-display text-3xl tracking-tight sm:text-4xl">Wereldpost</p>
          <p className="mt-3 max-w-md text-sm text-muted">
            Je bent koerier. Elke rit leert je een land, hoofdstad, taal, rivier en
            luchthaven. WASD sturen: A is links, D is rechts.
          </p>
          <Button className="mt-5 w-full sm:w-auto" onClick={start} size="lg">
            Start de eerste rit
          </Button>
        </Overlay>
      )}

      {started && ui.state === "brief" && dest && (
        <Overlay>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">dispatch</p>
          <div className="mt-3 flex items-center gap-3">
            <FlagBars country={dest} className="h-8 w-12" />
            <div>
              <p className="font-display text-3xl tracking-tight">{dest.capital}</p>
              <p className="text-muted">{dest.nameNl}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Fact k="Taal" v={dest.language} />
            <Fact k="Rivier" v={dest.river} />
            <Fact k="Luchthaven" v={dest.airport} />
            <Fact k="Afstand" v={ui.km ? `${Math.round(ui.km)} km` : "—"} />
          </dl>
          <p className="mt-4 text-sm text-muted">
            {ui.craft === "plane"
              ? "Lange afstand: je vliegt. W is gas, A/D koers."
              : "W gas, S rem, A links, D rechts. Rijd naar de stempel op de kaart."}
          </p>
          <Button
            className="mt-6"
            onClick={() => send({ type: "accept" })}
            variant="stamp"
          >
            Vertrek
          </Button>
        </Overlay>
      )}

      {ui.state === "quiz" && ui.quiz && dest && (
        <Overlay>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">kennischeck</p>
          <p className="mt-2 font-display text-2xl tracking-tight">{ui.quiz.prompt}</p>
          <div className="mt-5 grid gap-2">
            {ui.quiz.options.map((opt) => (
              <Button
                key={opt}
                variant="outline"
                className="h-auto min-h-11 justify-start whitespace-normal py-2 text-left"
                onClick={() => send({ type: "answer", choice: opt })}
              >
                {opt}
              </Button>
            ))}
          </div>
          {ui.lastAnswer === "wrong" && (
            <p className="mt-3 text-sm text-stamp">Nog een poging.</p>
          )}
        </Overlay>
      )}

      {ui.state === "debrief" && dest && (
        <Overlay>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {ui.lastAnswer === "correct" ? "bezorgd" : "afgegeven"}
          </p>
          <p className="mt-2 font-display text-3xl tracking-tight">
            {ui.lastAnswer === "correct" ? "Goed onthouden." : "Bijna."}
          </p>
          <p className="mt-2 text-sm text-muted">{ui.notice}</p>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              {dest.nameNl} — hoofdstad {dest.capital}
            </li>
            <li>Taal: {dest.language}</li>
            <li>Rivier: {dest.river}</li>
            <li>Luchthaven: {dest.airport}</li>
          </ul>
          <Button className="mt-6" onClick={nextPackage}>
            Volgend pakket
          </Button>
        </Overlay>
      )}

      {ui.state === "paused" && (
        <Overlay>
          <p className="font-display text-3xl tracking-tight">Pauze</p>
          <Button className="mt-6" onClick={() => send({ type: "resume" })}>
            Verder rijden
          </Button>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center overflow-y-auto bg-fg/25 p-4 pb-20 pointer-events-auto sm:items-center sm:pb-4">
      <div
        className={cn(
          "my-4 w-full max-w-md rounded-[calc(var(--radius-md)+16px)] border border-border bg-bg p-5 shadow-sm sm:my-0 sm:p-8",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-subtle">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}
