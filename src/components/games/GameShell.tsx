import { useState } from "react";
import type { Operation } from "@/lib/store";
import { OP_META, OPERATIONS } from "@/lib/store";

export function OpPicker({ value, onChange }: { value: Operation; onChange: (o: Operation) => void }) {
  return (
    <div className="mb-3 grid grid-cols-4 gap-2">
      {OPERATIONS.map((op) => (
        <button
          key={op}
          onClick={() => onChange(op)}
          className={`shadow-pop rounded-2xl border-4 border-border py-2 font-display text-lg font-extrabold ${
            value === op ? `bg-${OP_META[op].color} text-primary-foreground` : "bg-card"
          }`}
        >
          {OP_META[op].symbol}
        </button>
      ))}
    </div>
  );
}

export function GameResult({
  correct,
  total,
  onReplay,
  onExit,
}: {
  correct: number;
  total: number;
  onReplay: () => void;
  onExit: () => void;
}) {
  const pct = total === 0 ? 0 : correct / total;
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;
  return (
    <div className="animate-pop-in text-center">
      <span className="text-7xl">{stars > 0 ? "🏆" : "😅"}</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold">
        {stars > 0 ? "Nice job!" : "Try again!"}
      </h2>
      <div className="mt-3 flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <span key={s} className={`text-5xl ${s <= stars ? "" : "opacity-25 grayscale"}`}>
            ⭐
          </span>
        ))}
      </div>
      <p className="mt-3 font-display text-xl font-extrabold text-primary">
        {correct} / {total} correct
      </p>
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
