import { useEffect, useRef, useState } from "react";
import { generateQuestion, type Question } from "@/lib/questions";
import { playDing, playBuzz, playWin } from "@/lib/sounds";
import { recordAnswer, type Operation } from "@/lib/store";
import { GameResult, OpPicker } from "./GameShell";

interface Item {
  id: string;
  q: Question;
  matched: boolean;
}

export function DragDropMatch({ level, onExit }: { level: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("addition");
  const initial = useRef(build("addition", level)).current;
  const [items, setItems] = useState<Item[]>(initial);
  const [answers, setAnswers] = useState<number[]>(() => shuffleArr(initial.map((i) => i.q.answer)));
  const [rounds, setRounds] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const bucketRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const initial = build(op, level);
    setItems(initial);
    setAnswers(shuffleArr(initial.map((i) => i.q.answer)));
  }, [op, level]);

  const restart = () => {
    const init = build(op, level);
    setItems(init);
    setAnswers(shuffleArr(init.map((i) => i.q.answer)));
    setRounds(0);
    setCorrect(0);
    setWrong(0);
    setDone(false);
  };

  const startDrag = (e: React.PointerEvent, id: string) => {
    if (done) return;
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
    if (!item) {
      setDragging(null);
      return;
    }
    // hit test buckets
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
    if (hitIndex >= 0) {
      const bucketVal = answers[hitIndex];
      if (bucketVal === item.q.answer) {
        item.matched = true;
        setItems([...items]);
        setCorrect((c) => c + 1);
        setRounds((r) => r + 1);
        playDing();
        recordAnswer(op, true);
        // check win
        if (items.every((i) => i.matched)) {
          setTimeout(() => {
            setDone(true);
            playWin();
          }, 400);
        }
      } else {
        setWrong((w) => w + 1);
        setRounds((r) => r + 1);
        playBuzz();
        recordAnswer(op, false);
        setWrongFlash(item.id);
        setTimeout(() => setWrongFlash(null), 400);
      }
    }
    setDragging(null);
  };

  if (done) {
    const total = correct + wrong;
    return <GameResult correct={correct} total={Math.max(total, correct)} onReplay={restart} onExit={onExit} />;
  }

  return (
    <div className="animate-pop-in">
      <OpPicker value={op} onChange={setOp} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">✅ {correct}/{items.length}</span>
        <span className="font-display text-sm font-bold text-muted-foreground">Tries: {rounds}</span>
      </div>
      <div
        ref={boxRef}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        className="shadow-pop relative overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-b from-fun-yellow/40 to-fun-pink/30 p-3 select-none"
        style={{ minHeight: 460, touchAction: "none" }}
      >
        {/* buckets */}
        <p className="text-center font-display text-sm font-bold text-muted-foreground">🪣 Drop into the correct answer</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {answers.map((a, i) => (
            <div
              key={i}
              ref={(el) => { bucketRefs.current[i] = el; }}
              className="flex aspect-square items-center justify-center rounded-2xl border-4 border-dashed border-fun-purple bg-card font-display text-2xl font-extrabold text-fun-purple"
            >
              {a}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-display text-sm font-bold text-muted-foreground">🎯 Drag the equations</p>
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
                    ? "bg-fun-red text-primary-foreground animate-bounce-soft"
                    : "bg-card"
                } ${isDragging ? "opacity-0" : ""}`}
                style={{ touchAction: "none" }}
              >
                {it.q.prompt}
              </div>
            );
          })}
        </div>
        {dragging && (() => {
          const it = items.find((i) => i.id === dragging.id);
          if (!it) return null;
          return (
            <div
              className="pointer-events-none absolute flex h-16 w-32 items-center justify-center rounded-2xl border-4 border-border bg-fun-orange font-display text-xl font-extrabold text-primary-foreground shadow-pop"
              style={{ left: dragging.x - 64, top: dragging.y - 32 }}
            >
              {it.q.prompt}
            </div>
          );
        })()}
      </div>
      <p className="mt-2 text-center text-xs font-bold text-muted-foreground">
        Press and drag each equation onto the matching answer bucket!
      </p>
    </div>
  );
}

function build(op: Operation, level: 1 | 2 | 3): Item[] {
  const items: Item[] = [];
  const seen = new Set<number>();
  let guard = 0;
  while (items.length < 4 && guard < 40) {
    guard++;
    const q = generateQuestion(op, level);
    if (seen.has(q.answer)) continue;
    seen.add(q.answer);
    items.push({ id: `${q.prompt}-${items.length}`, q, matched: false });
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

