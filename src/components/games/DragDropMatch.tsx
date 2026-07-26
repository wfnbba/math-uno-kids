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
  { title: "Forest Gate", emoji: "🌳", bg: "from-emerald-300 to-emerald-500", tip: "Drag an equation onto its answer bucket!" },
  { title: "Crystal Cave", emoji: "💎", bg: "from-sky-300 to-indigo-400", tip: "Nice! The crystals glow when you're right." },
  { title: "Castle Gate", emoji: "🏰", bg: "from-fuchsia-300 to-purple-500", tip: "Final gate — free the treasure!" },
];

const PER_ACT = 4;

interface Item {
  id: string;
  q: Question;
  matched: boolean;
}

export function DragDropMatch({ onExit }: { level?: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("addition");
  const [phase, setPhase] = useState<Phase>("intro");
  const [act, setAct] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [correct, setCorrect] = useState(0);
  const [tries, setTries] = useState(0);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [okBucket, setOkBucket] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const bucketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { shakeClass, trigger } = useShake();

  const totalPairs = ACTS.length * PER_ACT;

  const startAct = (index: number) => {
    const init = build(op);
    setItems(init);
    setAnswers(shuffleArr(init.map((i) => i.q.answer)));
    setAct(index);
    setPhase("banner");
  };

  const restart = () => {
    setCorrect(0);
    setTries(0);
    setPhase("intro");
  };

  const startDrag = (e: React.PointerEvent, id: string) => {
    if (phase !== "play") return;
    const item = items.find((i) => i.id === id);
    if (!item || item.matched) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = boxRef.current!.getBoundingClientRect();
    setDragging({ id, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const moveDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = boxRef.current!.getBoundingClientRect();
    setDragging({ ...dragging, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    const item = items.find((i) => i.id === dragging.id);
    setDragging(null);
    if (!item) return;

    let hitIndex = -1;
    for (let i = 0; i < bucketRefs.current.length; i++) {
      const el = bucketRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        hitIndex = i;
        break;
      }
    }
    if (hitIndex < 0) return;

    setTries((t) => t + 1);
    if (answers[hitIndex] === item.q.answer) {
      const next = items.map((i) => (i.id === item.id ? { ...i, matched: true } : i));
      setItems(next);
      setCorrect((c) => c + 1);
      setOkBucket(hitIndex);
      setTimeout(() => setOkBucket(null), 500);
      playDing();
      recordAnswer(op, true);
      if (next.every((i) => i.matched)) {
        setTimeout(() => {
          if (act < ACTS.length - 1) {
            celebrate("small");
            startAct(act + 1);
          } else {
            playWin();
            setPhase("done");
          }
        }, 500);
      }
    } else {
      playBuzz();
      trigger();
      recordAnswer(op, false);
      setWrongFlash(item.id);
      setTimeout(() => setWrongFlash(null), 400);
    }
  };

  useEffect(() => {
    if (phase === "intro") return;
    // regenerate current act when operation changes mid-game
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op]);

  if (phase === "intro") {
    return (
      <div className="animate-pop-in">
        <OpPicker value={op} onChange={setOp} />
        <StoryIntro
          mascot="🦉"
          title="Treasure Match"
          subtitle="Help Ollie the owl!"
          story="Ollie found 3 magic gates. Each gate opens only when every equation lands in its matching answer bucket. Open all 3 and the treasure is yours!"
          cta="Open the first gate 🔑"
          onStart={() => startAct(0)}
          bg="bg-gradient-to-br from-fun-purple via-fun-blue to-fun-green"
        />
      </div>
    );
  }

  if (phase === "done") {
    return (
      <GameResult
        correct={correct}
        total={Math.max(tries, correct)}
        mascot="💎"
        storyEnd="All 3 gates are open! Ollie hoots with joy as the treasure chest bursts with stars. 🌟"
        onReplay={restart}
        onExit={onExit}
      />
    );
  }

  const stage = ACTS[act];
  const done = items.filter((i) => i.matched).length;

  return (
    <div className="animate-pop-in">
      <Narrator mascot="🦉" text={stage.tip} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">
          {stage.emoji} {done}/{items.length}
        </span>
        <span className="font-display text-sm font-bold text-muted-foreground">Total matched: {correct}/{totalPairs}</span>
      </div>
      <div className="mb-2">
        <ArcProgress value={act * PER_ACT + done} max={totalPairs} color="bg-fun-purple" />
      </div>
      <div
        ref={boxRef}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        className={`shadow-pop relative overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-b ${stage.bg} p-3 select-none ${shakeClass}`}
        style={{ minHeight: 460, touchAction: "none" }}
      >
        <p className="text-center font-display text-base font-extrabold text-white drop-shadow">🪣 Answer buckets</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {answers.map((a, i) => (
            <div
              key={i}
              ref={(el) => {
                bucketRefs.current[i] = el;
              }}
              className={`flex aspect-square items-center justify-center rounded-2xl border-4 border-dashed font-display text-2xl font-extrabold transition-all ${
                okBucket === i
                  ? "scale-110 border-fun-green bg-fun-green text-primary-foreground"
                  : "border-white bg-card text-fun-purple"
              }`}
            >
              {a}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-display text-base font-extrabold text-white drop-shadow">
          🎯 Drag the equations
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {items.map((it) => {
            const isDragging = dragging?.id === it.id;
            return (
              <div
                key={it.id}
                onPointerDown={(e) => startDrag(e, it.id)}
                className={`shadow-pop flex h-16 items-center justify-center rounded-2xl border-4 border-border font-display text-xl font-extrabold transition-all ${
                  it.matched
                    ? "bg-fun-green text-primary-foreground opacity-70"
                    : wrongFlash === it.id
                      ? "animate-bounce-soft bg-fun-red text-primary-foreground"
                      : "bg-card"
                } ${isDragging ? "opacity-0" : ""}`}
                style={{ touchAction: "none" }}
              >
                {it.matched ? "✅" : it.q.prompt}
              </div>
            );
          })}
        </div>
        {dragging &&
          (() => {
            const it = items.find((i) => i.id === dragging.id);
            if (!it) return null;
            return (
              <div
                className="shadow-pop pointer-events-none absolute flex h-16 w-32 items-center justify-center rounded-2xl border-4 border-border bg-fun-orange font-display text-xl font-extrabold text-primary-foreground"
                style={{ left: dragging.x - 64, top: dragging.y - 32 }}
              >
                {it.q.prompt}
              </div>
            );
          })()}
        {phase === "banner" && (
          <StageBanner act={act + 1} title={stage.title} emoji={stage.emoji} onDone={() => setPhase("play")} />
        )}
      </div>
      <p className="mt-2 text-center text-sm font-bold text-muted-foreground">
        Press and drag each equation onto the matching answer bucket!
      </p>
    </div>
  );
}

function build(op: Operation): Item[] {
  const items: Item[] = [];
  const seen = new Set<number>();
  let guard = 0;
  while (items.length < PER_ACT && guard < 60) {
    guard++;
    const q = easyQuestion(op);
    if (seen.has(q.answer)) continue;
    seen.add(q.answer);
    items.push({ id: `${q.prompt}-${items.length}-${Math.random().toString(36).slice(2, 6)}`, q, matched: false });
  }
  return items;
}

function shuffleArr<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
