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

type Phase = "intro" | "banner" | "play" | "done";

const ACTS = [
  { title: "Meadow Range", emoji: "🌼", bg: "from-sky-300 to-emerald-300", drift: 0.25, tip: "Tap the balloon with the right answer!" },
  { title: "Windy Cliffs", emoji: "🍃", bg: "from-amber-200 to-sky-400", drift: 0.55, tip: "The balloons drift — aim carefully!" },
  { title: "Star Tower", emoji: "🌙", bg: "from-indigo-500 to-purple-700", drift: 0.85, tip: "Final round! Pop the last balloons!" },
];

const SHOTS_PER_ACT = 4;
const W = 340;
const H = 460;

interface Balloon {
  id: number;
  value: number;
  x: number;
  y: number;
  vx: number;
  color: string;
  popped?: boolean;
  wrong?: boolean;
}

const COLORS = ["bg-fun-red", "bg-fun-blue", "bg-fun-green", "bg-fun-purple"];

export function ArcheryMath({ onExit }: { level?: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("addition");
  const [phase, setPhase] = useState<Phase>("intro");
  const [act, setAct] = useState(0);
  const [shot, setShot] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [q, setQ] = useState<Question | null>(null);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [arrow, setArrow] = useState<{ x: number; y: number } | null>(null);
  const [locked, setLocked] = useState(false);
  const rafRef = useRef<number | null>(null);
  const { shakeClass, trigger } = useShake();

  const totalShots = ACTS.length * SHOTS_PER_ACT;

  const nextRound = (actIndex: number) => {
    const question = easyQuestion(op);
    const opts = [...question.choices].slice(0, 4);
    const bs: Balloon[] = opts.map((v, i) => ({
      id: Date.now() + i,
      value: v,
      x: 40 + (i % 4) * 75,
      y: 70 + (i % 2) * 90,
      vx: (i % 2 === 0 ? 1 : -1) * ACTS[actIndex].drift,
      color: COLORS[i % COLORS.length],
    }));
    setQ(question);
    setBalloons(bs);
    setArrow(null);
    setLocked(false);
  };

  const startAct = (index: number) => {
    setAct(index);
    setShot(0);
    nextRound(index);
    setPhase("banner");
  };

  const restart = () => {
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setPhase("intro");
  };

  // drift animation
  useEffect(() => {
    if (phase !== "play") return;
    const loop = () => {
      setBalloons((bs) =>
        bs.map((b) => {
          let x = b.x + b.vx;
          let vx = b.vx;
          if (x < 24 || x > W - 64) vx = -vx;
          x = Math.max(24, Math.min(W - 64, x));
          return { ...b, x, vx };
        }),
      );
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  const shoot = (b: Balloon) => {
    if (locked || phase !== "play" || !q) return;
    setLocked(true);
    setArrow({ x: b.x + 20, y: b.y + 20 });
    const ok = b.value === q.answer;
    setTimeout(() => {
      setTotal((t) => t + 1);
      if (ok) {
        setCorrect((c) => c + 1);
        setStreak((s) => s + 1);
        playDing();
        recordAnswer(op, true);
        setBalloons((bs) => bs.map((x) => (x.id === b.id ? { ...x, popped: true } : x)));
      } else {
        setStreak(0);
        playBuzz();
        trigger();
        recordAnswer(op, false);
        setBalloons((bs) => bs.map((x) => (x.id === b.id ? { ...x, wrong: true } : x)));
      }
      setTimeout(() => {
        const nextShot = shot + 1;
        setShot(nextShot);
        if (nextShot >= SHOTS_PER_ACT) {
          if (act < ACTS.length - 1) {
            celebrate("small");
            startAct(act + 1);
          } else {
            playWin();
            setPhase("done");
          }
        } else {
          nextRound(act);
        }
      }, 650);
    }, 260);
  };

  if (phase === "intro") {
    return (
      <div className="animate-pop-in">
        <OpPicker value={op} onChange={setOp} />
        <StoryIntro
          mascot="🏹"
          title="Balloon Archer"
          subtitle="Robin the rabbit needs you!"
          story="Naughty balloons stole Robin's carrots! Solve each little math puzzle and pop the balloon holding the correct answer. Clear 3 ranges to win them all back!"
          cta="Take aim 🎯"
          onStart={() => startAct(0)}
          bg="bg-gradient-to-br from-fun-green via-fun-blue to-fun-purple"
        />
      </div>
    );
  }

  if (phase === "done") {
    return (
      <GameResult
        correct={correct}
        total={Math.max(total, correct)}
        mascot="🥕"
        storyEnd="Every balloon popped! Robin hops home with a giant basket of carrots. Thank you, archer! 🐰"
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  const stage = ACTS[act];

  return (
    <div className="animate-pop-in">
      <Narrator mascot="🐰" text={stage.tip} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">🎯 {correct}/{totalShots}</span>
        {streak >= 2 && (
          <span className="animate-bounce-soft rounded-full bg-fun-orange px-3 py-1 font-display text-sm font-extrabold text-primary-foreground">
            🔥 {streak}
          </span>
        )}
        <span className="rounded-full bg-fun-purple px-3 py-1 font-display text-lg font-extrabold text-primary-foreground">
          {q ? `${q.prompt} = ?` : "Ready!"}
        </span>
      </div>
      <div className="mb-2">
        <ArcProgress value={act * SHOTS_PER_ACT + shot} max={totalShots} color="bg-fun-green" />
      </div>
      <GameStage
        w={W}
        h={H}
        className={`shadow-pop rounded-3xl border-4 border-border bg-gradient-to-b ${stage.bg} ${shakeClass}`}
      >
        <div className="absolute inset-0">

          {/* clouds */}
          {["☁️", "☁️", "🌤️"].map((c, i) => (
            <span key={i} className="absolute animate-bounce-soft text-3xl opacity-80" style={{ left: 20 + i * 110, top: 16 + (i % 2) * 24 }}>
              {c}
            </span>
          ))}
          {/* balloons */}
          {balloons.map((b) => (
            <button
              key={b.id}
              onPointerDown={() => shoot(b)}
              className={`absolute flex h-14 w-14 items-center justify-center rounded-full border-4 border-border font-display text-2xl font-extrabold text-primary-foreground transition-all duration-300 ${b.color} ${
                b.popped ? "scale-0 opacity-0" : b.wrong ? "animate-shake opacity-60 grayscale" : "animate-bounce-soft"
              }`}
              style={{ left: b.x, top: b.y }}
              aria-label={`Balloon ${b.value}`}
            >
              {b.value}
            </button>
          ))}
          {/* arrow */}
          {arrow && (
            <span
              className="pointer-events-none absolute text-3xl transition-all duration-200"
              style={{ left: arrow.x, top: arrow.y }}
            >
              🏹
            </span>
          )}
          {/* archer */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-6xl">🐰</div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-emerald-600/70" />
          {phase === "banner" && (
            <StageBanner act={act + 1} title={stage.title} emoji={stage.emoji} onDone={() => setPhase("play")} />
          )}
        </div>
      </GameStage>

      <p className="mt-2 text-center text-sm font-bold text-muted-foreground">
        Tap the balloon that shows the correct answer!
      </p>
    </div>
  );
}
