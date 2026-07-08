import { useEffect, useMemo, useRef, useState } from "react";
import { playDing, playBuzz } from "@/lib/sounds";
import { pickThemeEmoji, type Phase } from "@/lib/roadmap";
import { generateQuestion, makeChoices, type Question } from "@/lib/questions";
import type { Operation } from "@/lib/store";

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export interface MiniGameProps {
  phase: Phase;
  level: 1 | 2 | 3;
  onComplete: (correct: number, total: number) => void;
}

/* ---------- VISUAL / MCQ games (count, group, share) ---------- */

interface VisualRound {
  visuals: React.ReactNode;
  prompt: string;
  answer: number;
  choices: number[];
  op: Operation;
}

function generateVisualRound(phase: Phase, level: 1 | 2 | 3): VisualRound {
  const emoji = pickThemeEmoji(phase.theme);
  if (phase.kind === "count" && phase.op === "addition") {
    const max = level === 1 ? 5 : level === 2 ? 8 : 10;
    const a = rand(1, max);
    const b = rand(1, max);
    return {
      visuals: (
        <div className="flex flex-wrap items-center justify-center gap-1 text-3xl">
          {Array.from({ length: a }).map((_, i) => (
            <span key={`a${i}`}>{emoji}</span>
          ))}
          <span className="mx-2 font-display text-4xl font-extrabold text-primary">+</span>
          {Array.from({ length: b }).map((_, i) => (
            <span key={`b${i}`}>{emoji}</span>
          ))}
        </div>
      ),
      prompt: `${a} + ${b}`,
      answer: a + b,
      choices: makeChoices(a + b),
      op: "addition",
    };
  }
  if (phase.kind === "count" && phase.op === "subtraction") {
    const max = level === 1 ? 8 : level === 2 ? 14 : 20;
    const a = rand(3, max);
    const b = rand(1, a - 1);
    return {
      visuals: (
        <div className="flex flex-wrap items-center justify-center gap-1 text-3xl">
          {Array.from({ length: a }).map((_, i) => (
            <span key={i} className={i >= a - b ? "opacity-25 line-through" : ""}>
              {emoji}
            </span>
          ))}
        </div>
      ),
      prompt: `${a} − ${b}`,
      answer: a - b,
      choices: makeChoices(a - b),
      op: "subtraction",
    };
  }
  if (phase.kind === "group") {
    const max = level === 1 ? 3 : level === 2 ? 5 : 6;
    const groups = rand(2, max);
    const per = rand(2, max);
    return {
      visuals: (
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: groups }).map((_, gi) => (
            <div key={gi} className="rounded-2xl border-4 border-border bg-card p-2 text-2xl">
              {Array.from({ length: per }).map((_, i) => (
                <span key={i}>{emoji}</span>
              ))}
            </div>
          ))}
        </div>
      ),
      prompt: `${groups} × ${per}`,
      answer: groups * per,
      choices: makeChoices(groups * per),
      op: "multiplication",
    };
  }
  // share (division)
  const per = level === 1 ? rand(2, 4) : level === 2 ? rand(2, 6) : rand(2, 8);
  const buckets = rand(2, 4);
  const total = per * buckets;
  return {
    visuals: (
      <div>
        <p className="mb-2 text-center font-display text-lg font-bold">
          {total} {emoji} shared into {buckets} baskets
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: buckets }).map((_, bi) => (
            <div key={bi} className="rounded-2xl border-4 border-border bg-card p-2 text-2xl">
              🧺
              <div>
                {Array.from({ length: per }).map((_, i) => (
                  <span key={i}>{emoji}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    prompt: `${total} ÷ ${buckets}`,
    answer: per,
    choices: makeChoices(per),
    op: "division",
  };
}

function MCQFrame({
  title,
  visuals,
  prompt,
  choices,
  answer,
  onAnswer,
}: {
  title: string;
  visuals: React.ReactNode;
  prompt: string;
  choices: number[];
  answer: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const pick = (c: number) => {
    if (picked !== null) return;
    setPicked(c);
    const ok = c === answer;
    ok ? playDing() : playBuzz();
    setTimeout(() => {
      setPicked(null);
      onAnswer(ok);
    }, 850);
  };
  return (
    <div className="animate-pop-in">
      <p className="mb-2 text-center font-display text-sm font-bold text-muted-foreground">{title}</p>
      <div className="shadow-pop mb-4 min-h-[180px] rounded-3xl border-4 border-border bg-card p-4">
        {visuals}
        <p className="mt-3 text-center font-display text-3xl font-extrabold">{prompt} = ?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {choices.map((c) => {
          let cls = "bg-card text-foreground";
          if (picked !== null) {
            if (c === answer) cls = "bg-fun-green text-primary-foreground";
            else if (c === picked) cls = "bg-fun-red text-primary-foreground";
          }
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              className={`btn-bounce shadow-pop rounded-3xl border-4 border-border py-5 font-display text-3xl font-extrabold ${cls}`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VisualGame({ phase, level, onComplete }: MiniGameProps) {
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState<VisualRound>(() => generateVisualRound(phase, level));
  const total = phase.rounds;
  const advance = (ok: boolean) => {
    const nextCorrect = correct + (ok ? 1 : 0);
    if (i + 1 >= total) {
      onComplete(nextCorrect, total);
    } else {
      setCorrect(nextCorrect);
      setI(i + 1);
      setRound(generateVisualRound(phase, level));
    }
  };
  return (
    <MCQFrame
      title={`Round ${i + 1} of ${total}`}
      visuals={round.visuals}
      prompt={round.prompt}
      choices={round.choices}
      answer={round.answer}
      onAnswer={advance}
    />
  );
}

/* ---------- Compare ---------- */

export function CompareGame({ phase, level, onComplete }: MiniGameProps) {
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [pair, setPair] = useState<[number, number]>(() => randomPair(level));
  const [picked, setPicked] = useState<string | null>(null);

  const truth = pair[0] > pair[1] ? ">" : pair[0] < pair[1] ? "<" : "=";
  const pick = (op: string) => {
    if (picked) return;
    setPicked(op);
    const ok = op === truth;
    ok ? playDing() : playBuzz();
    setTimeout(() => {
      const nextCorrect = correct + (ok ? 1 : 0);
      if (i + 1 >= phase.rounds) onComplete(nextCorrect, phase.rounds);
      else {
        setCorrect(nextCorrect);
        setI(i + 1);
        setPair(randomPair(level));
        setPicked(null);
      }
    }, 700);
  };
  return (
    <div className="animate-pop-in">
      <p className="mb-2 text-center font-display text-sm font-bold text-muted-foreground">
        Round {i + 1} of {phase.rounds}
      </p>
      <div className="shadow-pop mb-6 rounded-3xl border-4 border-border bg-card p-6">
        <div className="flex items-center justify-around">
          <span className="font-display text-6xl font-extrabold">{pair[0]}</span>
          <span className="font-display text-5xl font-extrabold text-muted-foreground">?</span>
          <span className="font-display text-6xl font-extrabold">{pair[1]}</span>
        </div>
        <p className="mt-4 text-center font-display text-base font-bold text-muted-foreground">
          Which sign fits?
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["<", "=", ">"].map((op) => {
          let cls = "bg-card";
          if (picked) {
            if (op === truth) cls = "bg-fun-green text-primary-foreground";
            else if (op === picked) cls = "bg-fun-red text-primary-foreground";
          }
          return (
            <button
              key={op}
              onClick={() => pick(op)}
              className={`btn-bounce shadow-pop rounded-3xl border-4 border-border py-6 font-display text-4xl font-extrabold ${cls}`}
            >
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function randomPair(level: 1 | 2 | 3): [number, number] {
  const max = level === 1 ? 10 : level === 2 ? 25 : 99;
  const a = rand(1, max);
  const b = Math.random() < 0.15 ? a : rand(1, max);
  return [a, b];
}

/* ---------- Sequence ---------- */

export function SequenceGame({ phase, level, onComplete }: MiniGameProps) {
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(() => makeSequence(level));

  const answer = (ok: boolean) => {
    const nextCorrect = correct + (ok ? 1 : 0);
    if (i + 1 >= phase.rounds) onComplete(nextCorrect, phase.rounds);
    else {
      setCorrect(nextCorrect);
      setI(i + 1);
      setRound(makeSequence(level));
    }
  };
  return (
    <MCQFrame
      title={`Round ${i + 1} of ${phase.rounds} · what comes next?`}
      visuals={
        <div className="flex flex-wrap items-center justify-center gap-3">
          {round.seq.map((n, k) => (
            <span
              key={k}
              className="rounded-2xl border-4 border-border bg-card px-4 py-2 font-display text-3xl font-extrabold"
            >
              {n}
            </span>
          ))}
          <span className="rounded-2xl border-4 border-dashed border-primary bg-primary/10 px-4 py-2 font-display text-3xl font-extrabold text-primary">
            ?
          </span>
        </div>
      }
      prompt="Next"
      choices={round.choices}
      answer={round.answer}
      onAnswer={answer}
    />
  );
}

function makeSequence(level: 1 | 2 | 3) {
  const step = level === 1 ? rand(1, 3) : level === 2 ? rand(1, 5) : rand(2, 10);
  const start = rand(1, 10);
  const seq = [start, start + step, start + step * 2];
  const answer = start + step * 3;
  return { seq, answer, choices: makeChoices(answer) };
}

/* ---------- Timed rapid (quick-tap & boss) ---------- */

export function TimedGame({ phase, level, onComplete }: MiniGameProps) {
  const seconds = phase.kind === "boss" ? 45 : 30;
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState<Question>(() => randomQuestion(phase, level));
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          if (!doneRef.current) {
            doneRef.current = true;
            // score out of a target: 8 correct answers = 3 stars
            const target = phase.kind === "boss" ? phase.rounds : 8;
            onComplete(Math.min(correct, target), target);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (c: number) => {
    if (timeLeft <= 0) return;
    const ok = c === q.answer;
    ok ? playDing() : playBuzz();
    setFlash(ok ? "ok" : "no");
    setTotal((t) => t + 1);
    if (ok) setCorrect((c) => c + 1);
    setTimeout(() => {
      setFlash(null);
      setQ(randomQuestion(phase, level));
    }, 200);
  };

  return (
    <div className="animate-pop-in">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">⭐ {correct}</span>
        <span
          className={`rounded-full px-4 py-1 font-display text-lg font-extrabold text-primary-foreground ${
            timeLeft <= 5 ? "bg-fun-red animate-bounce-soft" : "bg-fun-purple"
          }`}
        >
          ⏱️ {timeLeft}s
        </span>
        <span className="font-display text-sm font-bold text-muted-foreground">{total} tried</span>
      </div>
      <div
        className={`shadow-pop mb-4 rounded-3xl border-4 p-6 text-center transition-colors ${
          flash === "ok" ? "border-fun-green bg-fun-green/20" : flash === "no" ? "border-fun-red bg-fun-red/20" : "border-border bg-card"
        }`}
      >
        <p className="font-display text-5xl font-extrabold">{q.prompt} = ?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.choices.map((c) => (
          <button
            key={c}
            onClick={() => pick(c)}
            className="btn-bounce shadow-pop rounded-3xl border-4 border-border bg-card py-5 font-display text-3xl font-extrabold"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function randomQuestion(phase: Phase, level: 1 | 2 | 3): Question {
  const ops: Operation[] = phase.op ? [phase.op] : ["addition", "subtraction", "multiplication", "division"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  return generateQuestion(op, level);
}

/* ---------- Bug catch (falling numbers) ---------- */

export function CatchGame({ phase, level, onComplete }: MiniGameProps) {
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [q, setQ] = useState<Question>(() => generateQuestion(phase.op ?? "addition", level));
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  // reset animation via key
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // if unanswered treat as wrong and move on
      handle(-999);
    }, 4200);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const handle = (pickVal: number) => {
    const ok = pickVal === q.answer;
    ok ? playDing() : playBuzz();
    setFlash(ok ? "ok" : "no");
    setTimeout(() => {
      setFlash(null);
      const nextCorrect = correct + (ok ? 1 : 0);
      if (i + 1 >= phase.rounds) {
        onComplete(nextCorrect, phase.rounds);
      } else {
        setCorrect(nextCorrect);
        setI(i + 1);
        setQ(generateQuestion(phase.op ?? "addition", level));
        setTick((t) => t + 1);
      }
    }, 350);
  };

  const emojis = ["🐞", "🦋", "🐝", "🐛"];

  return (
    <div className="animate-pop-in">
      <p className="mb-2 text-center font-display text-sm font-bold text-muted-foreground">
        Round {i + 1} of {phase.rounds} · ⭐ {correct}
      </p>
      <div
        className={`shadow-pop relative mb-4 h-80 overflow-hidden rounded-3xl border-4 bg-gradient-to-b from-fun-blue/30 to-fun-green/30 ${
          flash === "ok" ? "border-fun-green" : flash === "no" ? "border-fun-red" : "border-border"
        }`}
      >
        <div className="absolute inset-x-0 top-2 text-center font-display text-3xl font-extrabold">
          {q.prompt} = ?
        </div>
        {q.choices.map((c, k) => (
          <button
            key={`${tick}-${c}-${k}`}
            onClick={() => handle(c)}
            style={{
              left: `${8 + k * 22}%`,
              animationDelay: `${k * 250}ms`,
            }}
            className="btn-bounce absolute top-16 flex h-16 w-16 items-center justify-center rounded-full border-4 border-border bg-card font-display text-2xl font-extrabold animate-fall"
          >
            <span className="absolute -top-6 text-xl">{emojis[k % emojis.length]}</span>
            {c}
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-bold text-muted-foreground">
        Tap the correct answer before it lands! 🐞
      </p>
    </div>
  );
}

/* ---------- Memory ---------- */

interface MemCard {
  id: string;
  kind: "eq" | "ans";
  pair: string;
  label: string;
}

export function MemoryGame({ phase, level, onComplete }: MiniGameProps) {
  const pairs = 4;
  const [cards, setCards] = useState<MemCard[]>(() => buildMemoryCards(pairs, level));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (matched.length === pairs * 2 && !doneRef.current) {
      doneRef.current = true;
      // Fewer attempts = better score. Target = pairs attempts.
      const efficiency = pairs / Math.max(attempts, pairs);
      const score = Math.round(efficiency * phase.rounds);
      setTimeout(() => onComplete(Math.max(1, Math.min(score, phase.rounds)), phase.rounds), 500);
    }
  }, [matched, attempts, phase.rounds, onComplete]);

  const tap = (id: string) => {
    if (flipped.includes(id) || matched.includes(id) || flipped.length >= 2) return;
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setAttempts((a) => a + 1);
      const [a, b] = next.map((x) => cards.find((c) => c.id === x)!);
      if (a.pair === b.pair && a.kind !== b.kind) {
        playDing();
        setTimeout(() => {
          setMatched((m) => [...m, a.id, b.id]);
          setFlipped([]);
        }, 500);
      } else {
        playBuzz();
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="animate-pop-in">
      <p className="mb-3 text-center font-display text-sm font-bold text-muted-foreground">
        Tries: {attempts} · Matched: {matched.length / 2}/{pairs}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c) => {
          const revealed = flipped.includes(c.id) || matched.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => tap(c.id)}
              className={`shadow-pop aspect-[3/4] rounded-2xl border-4 border-border font-display font-extrabold transition-all ${
                revealed
                  ? matched.includes(c.id)
                    ? "bg-fun-green text-primary-foreground"
                    : "bg-card text-foreground"
                  : "bg-fun-purple text-primary-foreground"
              }`}
            >
              <span className="text-sm md:text-base">{revealed ? c.label : "?"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildMemoryCards(pairs: number, level: 1 | 2 | 3): MemCard[] {
  const list: MemCard[] = [];
  const seen = new Set<number>();
  while (list.length < pairs * 2) {
    const q = generateQuestion(Math.random() < 0.5 ? "addition" : "subtraction", level);
    if (seen.has(q.answer)) continue;
    seen.add(q.answer);
    const pair = q.prompt;
    list.push({ id: `eq-${pair}`, kind: "eq", pair, label: pair });
    list.push({ id: `ans-${pair}`, kind: "ans", pair, label: String(q.answer) });
  }
  // shuffle
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/* ---------- Dispatcher ---------- */

export function MiniGameRunner({ phase, level, onComplete }: MiniGameProps) {
  const key = useMemo(() => `${phase.id}-${Date.now()}`, [phase.id]);
  const props = { phase, level, onComplete, key };
  switch (phase.kind) {
    case "count":
    case "group":
    case "share":
      return <VisualGame {...props} />;
    case "compare":
      return <CompareGame {...props} />;
    case "sequence":
      return <SequenceGame {...props} />;
    case "quick-tap":
    case "boss":
      return <TimedGame {...props} />;
    case "catch":
      return <CatchGame {...props} />;
    case "memory":
      return <MemoryGame {...props} />;
  }
}
