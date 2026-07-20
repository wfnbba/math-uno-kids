import { useEffect, useRef, useState } from "react";
import type { Operation } from "@/lib/store";
import { OP_META, OPERATIONS } from "@/lib/store";
import { generateQuestion, type Question } from "@/lib/questions";
import confetti from "canvas-confetti";

// -------------------- Math helpers (kid-friendly, always simple) --------------------

/** Always-easy question generator for ages 6-12. Ignores hard level. */
export function easyQuestion(op: Operation): Question {
  // Force level 1 style but with even smaller ranges for premium feel
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  let a = 0, b = 0, answer = 0, symbol = "+";
  if (op === "addition") {
    a = rand(1, 9); b = rand(1, 9); answer = a + b; symbol = "+";
  } else if (op === "subtraction") {
    a = rand(2, 10); b = rand(1, a); answer = a - b; symbol = "−";
  } else if (op === "multiplication") {
    a = rand(2, 5); b = rand(2, 5); answer = a * b; symbol = "×";
  } else {
    b = rand(2, 5); answer = rand(1, 5); a = b * answer; symbol = "÷";
  }
  // Small tight choices (±1..±3)
  const set = new Set<number>([answer]);
  const deltas = [1, 2, 3, 1, 2];
  let i = 0;
  while (set.size < 4 && i < 20) {
    const d = deltas[i % deltas.length];
    const c = i % 2 === 0 ? answer + d + Math.floor(i / 2) : answer - d;
    if (c >= 0) set.add(c);
    i++;
  }
  while (set.size < 4) set.add(answer + set.size);
  const choices = [...set];
  for (let k = choices.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [choices[k], choices[j]] = [choices[j], choices[k]];
  }
  return { prompt: `${a} ${symbol} ${b}`, answer, choices, op };
}

export { generateQuestion };

// -------------------- OpPicker --------------------

export function OpPicker({ value, onChange }: { value: Operation; onChange: (o: Operation) => void }) {
  return (
    <div className="mb-3 grid grid-cols-4 gap-2">
      {OPERATIONS.map((op) => (
        <button
          key={op}
          onClick={() => onChange(op)}
          className={`shadow-pop rounded-2xl border-4 border-border py-2 font-display text-lg font-extrabold transition-transform ${
            value === op ? `bg-${OP_META[op].color} text-primary-foreground scale-105` : "bg-card"
          }`}
        >
          {OP_META[op].symbol}
        </button>
      ))}
    </div>
  );
}

// -------------------- Confetti / celebrate --------------------

export function celebrate(intensity: "small" | "big" = "small") {
  const count = intensity === "big" ? 180 : 60;
  const spread = intensity === "big" ? 100 : 70;
  try {
    confetti({
      particleCount: count,
      spread,
      origin: { y: 0.6 },
      colors: ["#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1", "#ff9ff3", "#a29bfe"],
      scalar: 1.1,
    });
  } catch {
    /* ignore */
  }
}

// -------------------- Story Intro --------------------

export function StoryIntro({
  mascot,
  title,
  subtitle,
  story,
  cta,
  onStart,
  bg,
}: {
  mascot: string;
  title: string;
  subtitle: string;
  story: string;
  cta: string;
  onStart: () => void;
  bg: string; // tailwind gradient
}) {
  return (
    <div className={`animate-pop-in shadow-pop relative overflow-hidden rounded-3xl border-4 border-border ${bg} p-5 text-center`}>
      {/* floating decorative emojis */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {["✨", "⭐", "💫", "🌟", "✨", "⭐"].map((e, i) => (
          <span
            key={i}
            className="absolute animate-bounce-soft text-2xl opacity-80"
            style={{
              left: `${(i * 17 + 5) % 90}%`,
              top: `${(i * 23 + 10) % 80}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          >
            {e}
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="animate-bounce-soft text-8xl">{mascot}</div>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-white drop-shadow-lg">{title}</h2>
        <p className="font-display text-lg font-bold text-white/90 drop-shadow">{subtitle}</p>
        <div className="mx-auto mt-4 max-w-xs rounded-2xl border-4 border-border bg-card/95 p-3">
          <p className="font-display text-sm font-bold leading-relaxed text-foreground">
            {story}
          </p>
        </div>
        <button
          onClick={onStart}
          className="btn-bounce shadow-pop mt-5 rounded-full border-4 border-border bg-fun-yellow px-8 py-4 font-display text-xl font-extrabold text-foreground"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

// -------------------- Stage Banner --------------------

export function StageBanner({ act, title, emoji, onDone }: { act: number; title: string; emoji: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-pop-in shadow-pop rounded-3xl border-4 border-border bg-gradient-to-br from-fun-yellow via-fun-orange to-fun-pink px-8 py-6 text-center">
        <p className="font-display text-sm font-extrabold uppercase tracking-widest text-white/90">Act {act}</p>
        <div className="my-1 text-5xl animate-bounce-soft">{emoji}</div>
        <h3 className="font-display text-2xl font-extrabold text-white drop-shadow">{title}</h3>
      </div>
    </div>
  );
}

// -------------------- Narrator bubble --------------------

export function Narrator({ mascot, text }: { mascot: string; text: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 rounded-2xl border-4 border-border bg-card p-2 shadow-pop">
      <span className="animate-bounce-soft text-3xl">{mascot}</span>
      <p className="flex-1 font-display text-sm font-extrabold text-foreground">{text}</p>
    </div>
  );
}

// -------------------- Progress Bar --------------------

export function ArcProgress({ value, max, color = "bg-fun-green" }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-3 w-full overflow-hidden rounded-full border-2 border-border bg-card">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// -------------------- Floating Emoji burst --------------------

export function EmojiBurst({ x, y, emoji }: { x: number; y: number; emoji: string }) {
  return (
    <div
      className="pointer-events-none absolute text-3xl"
      style={{
        left: x,
        top: y,
        animation: "burstFly 800ms ease-out forwards",
      }}
    >
      {emoji}
    </div>
  );
}

// -------------------- Screen shake hook --------------------

export function useShake() {
  const [shake, setShake] = useState(false);
  const trigger = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };
  return { shakeClass: shake ? "animate-shake" : "", trigger };
}

// -------------------- Game Result (enhanced with confetti) --------------------

export function GameResult({
  correct,
  total,
  onReplay,
  onExit,
  mascot = "🎉",
  storyEnd,
}: {
  correct: number;
  total: number;
  onReplay: () => void;
  onExit: () => void;
  mascot?: string;
  storyEnd?: string;
}) {
  const pct = total === 0 ? 0 : correct / total;
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (stars >= 2) {
      celebrate("big");
      setTimeout(() => celebrate("big"), 400);
      setTimeout(() => celebrate("small"), 800);
    } else if (stars === 1) {
      celebrate("small");
    }
  }, [stars]);

  return (
    <div className="animate-pop-in text-center">
      <span className="inline-block animate-bounce-soft text-8xl">{stars > 0 ? mascot : "😅"}</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold">
        {stars === 3 ? "LEGENDARY!" : stars === 2 ? "Amazing!" : stars === 1 ? "Good try!" : "Try again!"}
      </h2>
      <div className="mt-3 flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`inline-block text-6xl transition-all ${s <= stars ? "animate-bounce-soft" : "opacity-25 grayscale"}`}
            style={{ animationDelay: `${s * 0.15}s` }}
          >
            ⭐
          </span>
        ))}
      </div>
      <p className="mt-3 font-display text-xl font-extrabold text-primary">
        {correct} / {total} correct
      </p>
      {storyEnd && (
        <p className="mx-auto mt-3 max-w-xs rounded-2xl border-4 border-border bg-card px-4 py-3 font-display text-sm font-bold text-foreground">
          {storyEnd}
        </p>
      )}
      <div className="mt-6 space-y-3">
        <button
          onClick={onReplay}
          className="btn-bounce shadow-pop w-full rounded-3xl bg-primary px-6 py-4 font-display text-lg font-extrabold text-primary-foreground"
        >
          Play Again 🔁
        </button>
        <button
          onClick={onExit}
          className="btn-bounce shadow-pop w-full rounded-3xl border-4 border-border bg-card px-6 py-4 font-display text-lg font-extrabold"
        >
          🎮 Games Menu
        </button>
      </div>
    </div>
  );
}

export function useGameState() {
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const reset = () => {
    setCorrect(0);
    setTotal(0);
    setDone(false);
  };
  return { correct, total, done, setCorrect, setTotal, setDone, reset };
}
