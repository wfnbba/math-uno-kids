import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/questions";
import { playDing, playBuzz, playWin } from "@/lib/sounds";
import { recordAnswer, type Operation } from "@/lib/store";
import {
  GameResult,
  OpPicker,
  StoryIntro,
  StageBanner,
  Narrator,
  ArcProgress,
  easyQuestion,
  celebrate,
  useShake,
} from "./GameShell";

const H = 460;
const GATES_PER_ACT = 4;

const ACTS = [
  { title: "Sunny Speedway", emoji: "🌻", road: "from-emerald-700 to-emerald-900", speed: 2.0, tip: "Steer into the RIGHT answer!" },
  { title: "Desert Dash", emoji: "🏜️", road: "from-amber-700 to-amber-900", speed: 2.6, tip: "A little faster now — you got this!" },
  { title: "Rainbow Finish", emoji: "🌈", road: "from-indigo-700 to-purple-900", speed: 3.0, tip: "Last stretch to the trophy!" },
];

interface Gate {
  y: number;
  q: Question;
  lanes: number[];
  correctLane: 0 | 1 | 2;
  passed: boolean;
  hit?: boolean;
}

type Phase = "intro" | "banner" | "race" | "done";

export function MathRacer({ onExit }: { level?: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("addition");
  const [phase, setPhase] = useState<Phase>("intro");
  const [act, setAct] = useState(0);
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const [pop, setPop] = useState<{ id: number; text: string } | null>(null);
  const [, force] = useState(0);
  const { shakeClass, trigger } = useShake();

  const gatesRef = useRef<Gate[]>([]);
  const spawnRef = useRef(0);
  const spawnedRef = useRef(0);
  const clearedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const laneRef = useRef(lane);
  const actRef = useRef(0);
  const opRef = useRef(op);
  useEffect(() => { laneRef.current = lane; }, [lane]);
  useEffect(() => { actRef.current = act; }, [act]);
  useEffect(() => { opRef.current = op; }, [op]);

  const totalGates = ACTS.length * GATES_PER_ACT;

  const makeGate = (): Gate => {
    const q = easyQuestion(opRef.current);
    const wrongs = q.choices.filter((c) => c !== q.answer).slice(0, 2);
    while (wrongs.length < 2) wrongs.push(q.answer + wrongs.length + 1);
    const lanes = [q.answer, wrongs[0], wrongs[1]];
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }
    return { y: -80, q, lanes, correctLane: lanes.indexOf(q.answer) as 0 | 1 | 2, passed: false };
  };

  const startAct = (index: number) => {
    gatesRef.current = [];
    spawnRef.current = 0;
    spawnedRef.current = 0;
    clearedRef.current = 0;
    setAct(index);
    setLane(1);
    setPhase("banner");
  };

  const restart = () => {
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setPhase("intro");
  };

  // game loop
  useEffect(() => {
    if (phase !== "race") {
      runningRef.current = false;
      return;
    }
    runningRef.current = true;
    let last = performance.now();
    const loop = (now: number) => {
      if (!runningRef.current) return;
      const speed = ACTS[actRef.current].speed;
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      spawnRef.current -= speed * dt;
      if (spawnRef.current <= 0 && spawnedRef.current < GATES_PER_ACT) {
        gatesRef.current.push(makeGate());
        spawnedRef.current++;
        spawnRef.current = 200;
      }
      for (const g of gatesRef.current) {
        g.y += speed * dt;
        if (!g.passed && g.y > H - 100) {
          g.passed = true;
          const ok = laneRef.current === g.correctLane;
          g.hit = ok;
          clearedRef.current++;
          setTotal((t) => t + 1);
          if (ok) {
            setCorrect((c) => c + 1);
            setStreak((s) => s + 1);
            playDing();
            setFlash("ok");
            setPop({ id: Date.now(), text: "+1 ⭐" });
            recordAnswer(opRef.current, true);
          } else {
            setStreak(0);
            playBuzz();
            setFlash("no");
            trigger();
            recordAnswer(opRef.current, false);
          }
          setTimeout(() => setFlash(null), 260);
        }
      }
      gatesRef.current = gatesRef.current.filter((g) => g.y < H + 40);
      force((n) => n + 1);

      if (clearedRef.current >= GATES_PER_ACT && gatesRef.current.length === 0) {
        runningRef.current = false;
        if (actRef.current < ACTS.length - 1) {
          celebrate("small");
          startAct(actRef.current + 1);
        } else {
          playWin();
          setPhase("done");
        }
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") setLane((l) => Math.max(0, l - 1) as 0 | 1 | 2);
      if (e.code === "ArrowRight") setLane((l) => Math.min(2, l + 1) as 0 | 1 | 2);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (phase === "intro") {
    return (
      <div className="animate-pop-in">
        <OpPicker value={op} onChange={setOp} />
        <StoryIntro
          mascot="🏎️"
          title="Turbo Trip"
          subtitle="Help Zoom the race car!"
          story="Zoom must cross 3 magic roads to reach the Golden Trophy. Every gate has a little math puzzle — drive into the correct answer and Zoom zooms ahead!"
          cta="Start Engine 🚦"
          onStart={() => startAct(0)}
          bg="bg-gradient-to-br from-fun-red via-fun-orange to-fun-yellow"
        />
      </div>
    );
  }

  if (phase === "done") {
    return (
      <GameResult
        correct={correct}
        total={Math.max(total, correct)}
        mascot="🏆"
        storyEnd="Zoom crossed the finish line and lifted the Golden Trophy! The crowd goes wild! 🎉"
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  const active = gatesRef.current.find((g) => !g.passed) ?? gatesRef.current[0];
  const stage = ACTS[act];
  const cleared = act * GATES_PER_ACT + clearedRef.current;

  return (
    <div className="animate-pop-in">
      <Narrator mascot="🏎️" text={stage.tip} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">🏁 {correct}/{totalGates}</span>
        {streak >= 2 && (
          <span className="animate-bounce-soft rounded-full bg-fun-orange px-3 py-1 font-display text-sm font-extrabold text-primary-foreground">
            🔥 {streak} streak
          </span>
        )}
        <span className="rounded-full bg-fun-purple px-3 py-1 font-display text-lg font-extrabold text-primary-foreground">
          {active ? `${active.q.prompt} = ?` : "Ready!"}
        </span>
      </div>
      <div className="mb-2">
        <ArcProgress value={cleared} max={totalGates} color="bg-fun-orange" />
      </div>
      <div
        className={`shadow-pop relative overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-b ${stage.road} select-none ${shakeClass}`}
        style={{ width: "100%", aspectRatio: `340/${H}`, touchAction: "none" }}
      >
        <div className="absolute inset-0" style={{ height: H }}>
          <div className="absolute inset-0 flex">
            {[0, 1, 2].map((l) => (
              <div key={l} className="flex-1 border-x-2 border-dashed border-yellow-300/60" />
            ))}
          </div>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, #fde047 0 20px, transparent 20px 60px)",
              backgroundPositionY: (performance.now() / 8) % 60,
            }}
          />
          {gatesRef.current.map((g, i) => (
            <div key={i} className="absolute left-0 right-0 flex" style={{ top: g.y, height: 64 }}>
              {g.lanes.map((n, li) => (
                <div
                  key={li}
                  className={`m-1 flex flex-1 items-center justify-center rounded-2xl border-4 font-display text-3xl font-extrabold transition-colors ${
                    g.passed && li === g.correctLane
                      ? "border-fun-green bg-fun-green text-primary-foreground"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
          ))}
          <div
            className="absolute bottom-4 flex items-center justify-center text-5xl transition-all duration-150"
            style={{
              left: `${(lane * 100) / 3 + 100 / 6}%`,
              transform: "translateX(-50%)",
              filter:
                flash === "ok" ? "drop-shadow(0 0 10px #22c55e)" : flash === "no" ? "drop-shadow(0 0 10px #ef4444)" : "none",
            }}
          >
            🏎️
          </div>
          {pop && (
            <div
              key={pop.id}
              className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 font-display text-2xl font-extrabold text-yellow-300"
              style={{ animation: "burstFly 800ms ease-out forwards" }}
            >
              {pop.text}
            </div>
          )}
          <div className="absolute inset-0 flex">
            {[0, 1, 2].map((l) => (
              <button key={l} onPointerDown={() => setLane(l as 0 | 1 | 2)} className="flex-1" aria-label={`Lane ${l + 1}`} />
            ))}
          </div>
          {phase === "banner" && (
            <StageBanner act={act + 1} title={stage.title} emoji={stage.emoji} onDone={() => setPhase("race")} />
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-sm font-bold text-muted-foreground">
        Tap a lane (or use ← →) to drive into the correct answer!
      </p>
    </div>
  );
}
