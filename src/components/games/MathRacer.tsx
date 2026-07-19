import { useEffect, useRef, useState } from "react";
import { generateQuestion, type Question } from "@/lib/questions";
import { playDing, playBuzz, playWin } from "@/lib/sounds";
import { recordAnswer, type Operation } from "@/lib/store";
import { GameResult, OpPicker } from "./GameShell";

const TARGET = 8;
const H = 460;
const SPEED = 3;

interface Gate {
  y: number;
  q: Question;
  lanes: number[]; // 3 numbers, one per lane
  correctLane: 0 | 1 | 2;
  passed: boolean;
}

export function MathRacer({ level, onExit }: { level: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("multiplication");
  const [lane, setLane] = useState<0 | 1 | 2>(1);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const [, force] = useState(0);

  const gatesRef = useRef<Gate[]>([]);
  const spawnRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const laneRef = useRef(lane);
  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);
  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  const restart = () => {
    gatesRef.current = [];
    spawnRef.current = 0;
    setLane(1);
    setCorrect(0);
    setTotal(0);
    setDone(false);
    setFlash(null);
  };

  const makeGate = (): Gate => {
    const q = generateQuestion(op, level);
    const wrongs = q.choices.filter((c) => c !== q.answer).slice(0, 2);
    while (wrongs.length < 2) wrongs.push(q.answer + wrongs.length + 1);
    const lanes = [q.answer, wrongs[0], wrongs[1]];
    // shuffle
    for (let i = lanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }
    const correctLane = lanes.indexOf(q.answer) as 0 | 1 | 2;
    return { y: -80, q, lanes, correctLane, passed: false };
  };

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      spawnRef.current -= SPEED * dt;
      if (spawnRef.current <= 0) {
        gatesRef.current.push(makeGate());
        spawnRef.current = 180;
      }
      for (const g of gatesRef.current) g.y += SPEED * dt;
      for (const g of gatesRef.current) {
        if (!g.passed && g.y > H - 90) {
          g.passed = true;
          const ok = laneRef.current === g.correctLane;
          setTotal((t) => t + 1);
          if (ok) {
            setCorrect((c) => c + 1);
            playDing();
            setFlash("ok");
            recordAnswer(op, true);
          } else {
            playBuzz();
            setFlash("no");
            recordAnswer(op, false);
          }
          setTimeout(() => setFlash(null), 250);
        }
      }
      gatesRef.current = gatesRef.current.filter((g) => g.y < H + 40);
      force((n) => n + 1);
      if (!doneRef.current) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op]);

  useEffect(() => {
    if (correct >= TARGET && !done) {
      setDone(true);
      playWin();
    }
  }, [correct, done]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") setLane((l) => (Math.max(0, l - 1) as 0 | 1 | 2));
      if (e.code === "ArrowRight") setLane((l) => (Math.min(2, l + 1) as 0 | 1 | 2));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (done) {
    return <GameResult correct={correct} total={Math.max(total, correct)} onReplay={restart} onExit={onExit} />;
  }

  const active = gatesRef.current.find((g) => !g.passed) ?? gatesRef.current[0];

  return (
    <div className="animate-pop-in">
      <OpPicker value={op} onChange={(o) => { setOp(o); restart(); }} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">🏁 {correct}/{TARGET}</span>
        <span className="rounded-full bg-fun-purple px-3 py-1 font-display text-lg font-extrabold text-primary-foreground">
          {active ? `${active.q.prompt} = ?` : "Get ready!"}
        </span>
      </div>
      <div
        className="shadow-pop relative overflow-hidden rounded-3xl border-4 border-border bg-neutral-800 select-none"
        style={{ width: "100%", aspectRatio: `340/${H}`, touchAction: "none" }}
      >
        <div className="absolute inset-0" style={{ height: H }}>
          {/* road lanes */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2].map((l) => (
              <div key={l} className="flex-1 border-x-2 border-dashed border-yellow-400/60" />
            ))}
          </div>
          {/* moving road stripes */}
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(to bottom, #fde047 0 20px, transparent 20px 60px)", backgroundPositionY: (performance.now() / 8) % 60 }} />
          {/* gates */}
          {gatesRef.current.map((g, i) => (
            <div key={i} className="absolute left-0 right-0 flex" style={{ top: g.y, height: 64 }}>
              {g.lanes.map((n, li) => (
                <div
                  key={li}
                  className={`m-1 flex flex-1 items-center justify-center rounded-2xl border-4 font-display text-3xl font-extrabold ${
                    g.passed && li === g.correctLane ? "border-fun-green bg-fun-green text-primary-foreground" : "border-border bg-card text-foreground"
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
          ))}
          {/* car */}
          <div
            className="absolute bottom-4 flex items-center justify-center text-5xl transition-all duration-150"
            style={{
              left: `${(lane * 100) / 3 + 100 / 6}%`,
              transform: "translateX(-50%)",
              filter: flash === "ok" ? "drop-shadow(0 0 8px #22c55e)" : flash === "no" ? "drop-shadow(0 0 8px #ef4444)" : "none",
            }}
          >
            🏎️
          </div>
          {/* lane tap zones */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2].map((l) => (
              <button
                key={l}
                onPointerDown={() => setLane(l as 0 | 1 | 2)}
                className="flex-1"
                aria-label={`Lane ${l + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-bold text-muted-foreground">
        Tap a lane (or ← →) to steer into the correct answer!
      </p>
    </div>
  );
}
