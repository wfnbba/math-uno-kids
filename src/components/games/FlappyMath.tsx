import { useEffect, useRef, useState } from "react";
import { generateQuestion, type Question } from "@/lib/questions";
import { playDing, playBuzz, playWin } from "@/lib/sounds";
import { recordAnswer, type Operation } from "@/lib/store";
import { GameResult, OpPicker } from "./GameShell";

interface Gate {
  x: number;
  topAnswer: number;
  botAnswer: number;
  correctSide: "top" | "bot";
  passed: boolean;
  q: Question;
}

const W = 340;
const H = 420;
const BIRD_X = 70;
const GRAVITY = 0.45;
const FLAP = -7;
const GATE_GAP = 150;
const GATE_W = 70;
const SPEED = 2.2;
const TARGET = 10;

export function FlappyMath({ level, onExit }: { level: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("addition");
  const [started, setStarted] = useState(false);
  const [dead, setDead] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const [, force] = useState(0);

  const yRef = useRef(H / 2);
  const vyRef = useRef(0);
  const gatesRef = useRef<Gate[]>([]);
  const spawnRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const restart = () => {
    yRef.current = H / 2;
    vyRef.current = 0;
    gatesRef.current = [];
    spawnRef.current = 0;
    setStarted(false);
    setDead(false);
    setCorrect(0);
    setTotal(0);
    setFlash(null);
  };

  const makeGate = (x: number): Gate => {
    const q = generateQuestion(op, level);
    const wrong = q.choices.find((c) => c !== q.answer) ?? q.answer + 1;
    const correctOnTop = Math.random() < 0.5;
    return {
      x,
      topAnswer: correctOnTop ? q.answer : wrong,
      botAnswer: correctOnTop ? wrong : q.answer,
      correctSide: correctOnTop ? "top" : "bot",
      passed: false,
      q,
    };
  };

  useEffect(() => {
    if (!started || dead) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      vyRef.current += GRAVITY * dt;
      yRef.current += vyRef.current * dt;

      // spawn gates
      spawnRef.current -= SPEED * dt;
      if (spawnRef.current <= 0) {
        gatesRef.current.push(makeGate(W + 20));
        spawnRef.current = 190;
      }
      // move
      for (const g of gatesRef.current) g.x -= SPEED * dt;
      // collide / pass
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
            playDing();
            setFlash("ok");
            recordAnswer(op, true);
          } else {
            playBuzz();
            setFlash("no");
            recordAnswer(op, false);
            setDead(true);
          }
          setTimeout(() => setFlash(null), 250);
        }
      }
      gatesRef.current = gatesRef.current.filter((g) => g.x > -GATE_W - 20);

      if (yRef.current < 0 || yRef.current > H - 20) {
        setDead(true);
      }
      if (correctRef.current >= TARGET) {
        setDead(true);
      }
      force((n) => n + 1);
      if (!deadRef.current) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, dead]);

  // refs to avoid stale closure in loop
  const deadRef = useRef(false);
  const correctRef = useRef(0);
  useEffect(() => {
    deadRef.current = dead;
  }, [dead]);
  useEffect(() => {
    correctRef.current = correct;
    if (correct >= TARGET) {
      playWin();
    }
  }, [correct]);

  const flap = () => {
    if (dead) return;
    if (!started) setStarted(true);
    vyRef.current = FLAP;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dead, started]);

  if (dead && total > 0) {
    return <GameResult correct={correct} total={Math.max(total, correct)} onReplay={restart} onExit={onExit} />;
  }

  const activeQ = gatesRef.current.find((g) => !g.passed) ?? gatesRef.current[0];

  return (
    <div className="animate-pop-in">
      <OpPicker value={op} onChange={setOp} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">⭐ {correct}/{TARGET}</span>
        <span className="rounded-full bg-fun-purple px-3 py-1 font-display text-sm font-extrabold text-primary-foreground">
          {activeQ ? `${activeQ.q.prompt} = ?` : "Tap to start!"}
        </span>
      </div>
      <div
        onPointerDown={flap}
        className="shadow-pop relative overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-b from-sky-300 to-emerald-200 select-none"
        style={{ width: "100%", aspectRatio: `${W}/${H}`, touchAction: "none" }}
      >
        <div className="absolute inset-0" style={{ width: W, height: H, transform: "scale(1)", transformOrigin: "top left" }}>
          {/* clouds */}
          <div className="absolute left-6 top-6 text-3xl opacity-70">☁️</div>
          <div className="absolute right-8 top-16 text-2xl opacity-70">☁️</div>
          {/* gates */}
          {gatesRef.current.map((g, i) => (
            <div key={i}>
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
            </div>
          ))}
          {/* bird */}
          <div
            className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-fun-yellow text-2xl transition-transform"
            style={{
              left: BIRD_X,
              top: yRef.current,
              transform: `rotate(${Math.max(-30, Math.min(60, vyRef.current * 6))}deg)`,
              boxShadow: flash === "ok" ? "0 0 0 4px #22c55e" : flash === "no" ? "0 0 0 4px #ef4444" : "0 0 0 4px #000",
            }}
          >
            🐤
          </div>
          {!started && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 font-display text-2xl font-extrabold text-white">
              Tap to fly! 👆
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-bold text-muted-foreground">
        Tap the screen (or press Space) to flap. Fly through the correct answer!
      </p>
    </div>
  );
}
