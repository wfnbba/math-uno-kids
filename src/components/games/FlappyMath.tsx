import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/questions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { playDing, playBuzz, playWin } from "@/lib/sounds";
import { recordAnswer, type Operation } from "@/lib/store";
import { GameResult, OpPicker, StoryIntro, StageBanner, Narrator, ArcProgress, useShake, celebrate, easyQuestion, GameStage } from "./GameShell";

interface Gate {
  id: number;
  x: number;
  topAnswer: number;
  botAnswer: number;
  correctSide: "top" | "bot";
  passed: boolean;
  q: Question;
}

interface Pop {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const W = 340;
const H = 420;
const BIRD_X = 70;
const GRAVITY = 0.42;
const FLAP = -7;
const GATE_GAP = 170;
const GATE_W = 74;
const SPEED = 2.2;
const PER_ACT = 4;

const ACTS = [
  { title: "Cloud Kingdom", emoji: "☁️", bg: "linear-gradient(to bottom, #87ceeb, #b4e6ff, #d1f0d1)", clouds: "☁️" },
  { title: "Sunset Peaks", emoji: "🌅", bg: "linear-gradient(to bottom, #ff9a76, #ffc99b, #ffe0b3)", clouds: "🎈" },
  { title: "Star Galaxy", emoji: "🌌", bg: "linear-gradient(to bottom, #1a1a4f, #4b3f8a, #a06cd5)", clouds: "⭐" },
];

type Phase = "intro" | "banner" | "playing" | "result";

export function FlappyMath({ level: _level, onExit }: { level: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("addition");
  const [phase, setPhase] = useState<Phase>("intro");
  const [act, setAct] = useState(0); // 0..2
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [actScore, setActScore] = useState(0);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const [streak, setStreak] = useState(0);
  const [, force] = useState(0);
  const { shakeClass, trigger: shake } = useShake();

  const yRef = useRef(H / 2);
  const vyRef = useRef(0);
  const gatesRef = useRef<Gate[]>([]);
  const spawnRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const gateIdRef = useRef(0);
  const popIdRef = useRef(0);
  const actRef = useRef(0);
  const actScoreRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => { actRef.current = act; }, [act]);
  useEffect(() => { actScoreRef.current = actScore; }, [actScore]);

  const resetPhysics = () => {
    yRef.current = H / 2;
    vyRef.current = 0;
    gatesRef.current = [];
    spawnRef.current = 0;
  };

  const startAct = (a: number) => {
    setAct(a);
    setActScore(0);
    resetPhysics();
    setPhase("banner");
  };

  const startAll = () => {
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    startAct(0);
  };

  const startPlaying = () => {
    setPhase("playing");
    runningRef.current = true;
  };

  const makeGate = (x: number): Gate => {
    const q = easyQuestion(op);
    const wrong = q.choices.find((c: number) => c !== q.answer) ?? q.answer + 1;
    const correctOnTop = Math.random() < 0.5;
    return {
      id: gateIdRef.current++,
      x,
      topAnswer: correctOnTop ? q.answer : wrong,
      botAnswer: correctOnTop ? wrong : q.answer,
      correctSide: correctOnTop ? "top" : "bot",
      passed: false,
      q,
    };
  };

  useEffect(() => {
    if (phase !== "playing") return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      vyRef.current += GRAVITY * dt;
      yRef.current += vyRef.current * dt;

      spawnRef.current -= SPEED * dt;
      if (spawnRef.current <= 0 && gatesRef.current.filter((g) => !g.passed).length < PER_ACT) {
        gatesRef.current.push(makeGate(W + 20));
        spawnRef.current = 210;
      }
      for (const g of gatesRef.current) g.x -= SPEED * dt;

      for (const g of gatesRef.current) {
        if (!g.passed && g.x + GATE_W < BIRD_X) {
          g.passed = true;
          const bird = yRef.current;
          const inTop = bird < H / 2 - 10;
          const chosen = inTop ? "top" : "bot";
          const ok = chosen === g.correctSide;
          setTotal((t) => t + 1);
          if (ok) {
            setCorrect((c) => c + 1);
            setActScore((s) => s + 1);
            setStreak((s) => s + 1);
            playDing();
            setFlash("ok");
            recordAnswer(op, true);
            const px = BIRD_X + 20;
            const py = yRef.current;
            popIdRef.current++;
            const id = popIdRef.current;
            setPops((p) => [...p, { id, x: px, y: py, emoji: ["⭐", "✨", "💎", "🌟"][id % 4] }]);
            setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 800);
          } else {
            playBuzz();
            setFlash("no");
            setStreak(0);
            recordAnswer(op, false);
            shake();
          }
          setTimeout(() => setFlash(null), 250);

          // end of act check
          if (actScoreRef.current + (ok ? 1 : 0) >= PER_ACT || (!ok && actScoreRef.current + 1 >= PER_ACT)) {
            // trigger act transition after brief pause
            runningRef.current = false;
            setTimeout(() => {
              if (actRef.current >= 2) {
                setPhase("result");
                playWin();
                celebrate("big");
              } else {
                startAct(actRef.current + 1);
              }
            }, 700);
          }
        }
      }
      gatesRef.current = gatesRef.current.filter((g) => g.x > -GATE_W - 20);

      // bounds - keep bird alive, just bounce
      if (yRef.current < 0) { yRef.current = 0; vyRef.current = 2; }
      if (yRef.current > H - 30) { yRef.current = H - 30; vyRef.current = -2; }

      force((n) => n + 1);
      if (runningRef.current) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, op]);

  const flap = () => {
    if (phase !== "playing") return;
    vyRef.current = FLAP;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); flap(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const restart = () => { setOp(op); setPhase("intro"); };

  if (phase === "intro") {
    return (
      <div>
        <OpPicker value={op} onChange={setOp} />
        <StoryIntro
          mascot="🐤"
          title="Sky Quest"
          subtitle="A journey across 3 magical skies"
          story="Chico the chick lost his golden crown in the clouds! Fly through the right answers to collect stars and get it back. Ready to soar?"
          cta="🚀 Start Adventure"
          onStart={startAll}
          bg="bg-gradient-to-br from-sky-400 via-cyan-300 to-emerald-300"
        />
      </div>
    );
  }
  if (phase === "result") {
    const endings = ["Chico found his crown! You're a Sky Champion!", "Well flown! Chico is proud of you!", "The stars will always remember your flight!"];
    return <GameResult mascot="👑" storyEnd={endings[Math.floor(Math.random() * endings.length)]} correct={correct} total={total} onReplay={restart} onExit={onExit} />;
  }

  const actInfo = ACTS[act];
  const activeQ = gatesRef.current.find((g) => !g.passed);

  return (
    <div className="animate-pop-in">
      <Narrator mascot="🐤" text={activeQ ? `Fly to ${activeQ.q.prompt}!` : "Get ready to fly!"} />
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-fun-purple px-3 py-1 font-display text-sm font-extrabold text-primary-foreground">
          Act {act + 1}/3 · {actInfo.title}
        </span>
        <span className="font-display text-lg font-extrabold">
          ⭐ {actScore}/{PER_ACT} {streak >= 2 && <span className="ml-1 rounded bg-fun-yellow px-1 text-xs">🔥{streak}</span>}
        </span>
      </div>
      <div className="mb-2">
        <ArcProgress value={correct} max={PER_ACT * 3} />
      </div>
      <GameStage
        w={W}
        h={H}
        onPointerDown={flap}
        className={`shadow-pop rounded-3xl border-4 border-border ${shakeClass}`}
        style={{ background: actInfo.bg }}
      >
        <div className="absolute inset-0">

          {/* parallax decorations */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute text-3xl opacity-70"
              style={{
                left: `${(i * 90 - (performance.now() / 40) % 400)}px`,
                top: 20 + i * 30,
              }}
            >
              {actInfo.clouds}
            </div>
          ))}
          {/* gates */}
          {gatesRef.current.map((g) => (
            <div key={g.id}>
              <div
                className="absolute flex items-end justify-center rounded-b-2xl border-4 border-border bg-fun-green font-display text-2xl font-extrabold text-primary-foreground"
                style={{ left: g.x, top: 0, width: GATE_W, height: H / 2 - GATE_GAP / 2 }}
              >
                <span className="mb-1">{g.topAnswer}</span>
              </div>
              <div
                className="absolute flex items-start justify-center rounded-t-2xl border-4 border-border bg-fun-orange font-display text-2xl font-extrabold text-primary-foreground"
                style={{ left: g.x, top: H / 2 + GATE_GAP / 2, width: GATE_W, height: H / 2 - GATE_GAP / 2 }}
              >
                <span className="mt-1">{g.botAnswer}</span>
              </div>
              {/* prompt above the gate */}
              <div
                className="absolute -translate-x-1/2 rounded-xl border-2 border-border bg-white/95 px-2 py-1 font-display text-sm font-extrabold shadow"
                style={{ left: g.x + GATE_W / 2, top: H / 2 - 12 }}
              >
                {g.q.prompt}
              </div>
            </div>
          ))}
          {/* pops */}
          {pops.map((p) => (
            <div
              key={p.id}
              className="pointer-events-none absolute text-3xl"
              style={{ left: p.x, top: p.y, animation: "burstFly 800ms ease-out forwards" }}
            >
              {p.emoji}
            </div>
          ))}
          {/* bird */}
          <div
            className="absolute flex h-11 w-11 items-center justify-center rounded-full text-3xl transition-transform"
            style={{
              left: BIRD_X,
              top: yRef.current,
              transform: `rotate(${Math.max(-30, Math.min(60, vyRef.current * 6))}deg)`,
              filter: flash === "ok" ? "drop-shadow(0 0 12px #22c55e)" : flash === "no" ? "drop-shadow(0 0 12px #ef4444)" : "drop-shadow(0 0 4px #000)",
            }}
          >
            🐤
          </div>
        </div>
        {phase === "banner" && (
          <StageBanner act={act + 1} title={actInfo.title} emoji={actInfo.emoji} onDone={startPlaying} />
        )}
      </GameStage>

      <p className="mt-2 text-center text-xs font-bold text-muted-foreground">
        Tap the screen (or press Space) to flap. Fly through the correct answer!
      </p>
    </div>
  );
}
