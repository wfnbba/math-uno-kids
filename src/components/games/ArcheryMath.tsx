import { useEffect, useRef, useState } from "react";
import { generateQuestion, type Question } from "@/lib/questions";
import { playDing, playBuzz, playWin } from "@/lib/sounds";
import { recordAnswer, type Operation } from "@/lib/store";
import { GameResult, OpPicker } from "./GameShell";

const TARGET = 6;
const W = 340;
const H = 460;

interface Balloon {
  x: number;
  y: number;
  n: number;
  isCorrect: boolean;
  popped: boolean;
}

interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function ArcheryMath({ level, onExit }: { level: 1 | 2 | 3; onExit: () => void }) {
  const [op, setOp] = useState<Operation>("addition");
  const [q, setQ] = useState<Question>(() => generateQuestion(op, level));
  const [balloons, setBalloons] = useState<Balloon[]>(() => buildBalloons(q));
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(false);
  const [charging, setCharging] = useState(false);
  const [power, setPower] = useState(0);
  const [angle, setAngle] = useState(-Math.PI / 2);
  const [arrow, setArrow] = useState<Arrow | null>(null);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);

  const chargingRef = useRef(false);
  const powerRef = useRef(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const nextRound = (afterCorrect: boolean) => {
    setTimeout(() => {
      const newQ = generateQuestion(op, level);
      setQ(newQ);
      setBalloons(buildBalloons(newQ));
      setArrow(null);
      setFlash(null);
      if (afterCorrect && correctRef.current + 1 >= TARGET) {
        setDone(true);
        playWin();
      }
    }, 700);
  };

  const correctRef = useRef(0);
  useEffect(() => {
    correctRef.current = correct;
  }, [correct]);

  const restart = () => {
    const nq = generateQuestion(op, level);
    setQ(nq);
    setBalloons(buildBalloons(nq));
    setCorrect(0);
    setTotal(0);
    setDone(false);
    setArrow(null);
  };

  // charge loop
  useEffect(() => {
    if (!charging) return;
    let raf = 0;
    const step = () => {
      powerRef.current = Math.min(1, powerRef.current + 0.03);
      setPower(powerRef.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [charging]);

  // arrow flight
  useEffect(() => {
    if (!arrow) return;
    let raf = 0;
    const step = () => {
      setArrow((a) => {
        if (!a) return a;
        const nx = a.x + a.vx;
        const ny = a.y + a.vy;
        const nvy = a.vy + 0.25;
        // check hits
        for (const b of balloons) {
          if (b.popped) continue;
          const dx = nx - b.x;
          const dy = ny - b.y;
          if (dx * dx + dy * dy < 32 * 32) {
            b.popped = true;
            setBalloons([...balloons]);
            const ok = b.isCorrect;
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
            nextRound(ok);
            return null;
          }
        }
        if (nx < -20 || nx > W + 20 || ny > H + 20) {
          setTotal((t) => t + 1);
          recordAnswer(op, false);
          setFlash("no");
          nextRound(false);
          return null;
        }
        return { x: nx, y: ny, vx: a.vx, vy: nvy };
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrow?.vx]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (arrow || done) return;
    chargingRef.current = true;
    powerRef.current = 0;
    setPower(0);
    setCharging(true);
    updateAngle(e);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!chargingRef.current) return;
    updateAngle(e);
  };
  const onPointerUp = () => {
    if (!chargingRef.current) return;
    chargingRef.current = false;
    setCharging(false);
    const p = Math.max(0.25, powerRef.current);
    const speed = 6 + p * 12;
    const bx = W / 2;
    const by = H - 40;
    setArrow({ x: bx, y: by, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
    setPower(0);
    powerRef.current = 0;
  };

  const updateAngle = (e: React.PointerEvent) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = (e.clientX - rect.left) * (W / rect.width);
    const sy = (e.clientY - rect.top) * (H / rect.height);
    const bx = W / 2;
    const by = H - 40;
    let a = Math.atan2(sy - by, sx - bx);
    // clamp to upward hemisphere
    if (a > 0) a = a < Math.PI / 2 ? -0.05 : -Math.PI + 0.05;
    setAngle(a);
  };

  if (done) return <GameResult correct={correct} total={Math.max(total, correct)} onReplay={restart} onExit={onExit} />;

  return (
    <div className="animate-pop-in">
      <OpPicker value={op} onChange={(o) => { setOp(o); const nq = generateQuestion(o, level); setQ(nq); setBalloons(buildBalloons(nq)); }} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-extrabold">🎯 {correct}/{TARGET}</span>
        <span className="rounded-full bg-fun-purple px-3 py-1 font-display text-lg font-extrabold text-primary-foreground">
          {q.prompt} = ?
        </span>
      </div>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="shadow-pop relative overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-300 select-none"
        style={{ width: "100%", aspectRatio: `${W}/${H}`, touchAction: "none" }}
      >
        <div className="absolute inset-0" style={{ width: W, height: H }}>
          {balloons.map((b, i) => (
            <div
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full border-4 border-border font-display text-2xl font-extrabold text-primary-foreground transition-transform ${
                b.popped ? "scale-0 opacity-0" : b.isCorrect ? "bg-fun-green" : "bg-fun-red"
              }`}
              style={{ left: b.x, top: b.y }}
            >
              {b.n}
              <span className="absolute -bottom-2 text-xs">|</span>
            </div>
          ))}
          {/* aiming line */}
          {charging && (
            <svg className="absolute inset-0 pointer-events-none" width={W} height={H}>
              <line
                x1={W / 2}
                y1={H - 40}
                x2={W / 2 + Math.cos(angle) * 80 * (0.4 + power)}
                y2={H - 40 + Math.sin(angle) * 80 * (0.4 + power)}
                stroke="white"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
            </svg>
          )}
          {/* arrow */}
          {arrow && (
            <div
              className="absolute text-2xl"
              style={{
                left: arrow.x,
                top: arrow.y,
                transform: `translate(-50%, -50%) rotate(${Math.atan2(arrow.vy, arrow.vx)}rad)`,
              }}
            >
              ➤
            </div>
          )}
          {/* archer */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-4xl">🏹</div>
          {/* power bar */}
          {charging && (
            <div className="absolute bottom-1 left-2 right-2 h-2 rounded-full bg-black/30">
              <div className="h-full rounded-full bg-fun-yellow transition-all" style={{ width: `${power * 100}%` }} />
            </div>
          )}
          {flash && (
            <div className={`absolute inset-0 pointer-events-none ${flash === "ok" ? "bg-fun-green/20" : "bg-fun-red/20"}`} />
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-bold text-muted-foreground">
        Hold and drag to aim, release to shoot the correct answer!
      </p>
    </div>
  );
}

function buildBalloons(q: Question): Balloon[] {
  const positions = [
    { x: 60, y: 70 },
    { x: 140, y: 50 },
    { x: 220, y: 80 },
    { x: 290, y: 55 },
  ];
  const choices = [...q.choices];
  // shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices.slice(0, 4).map((n, i) => ({
    x: positions[i].x,
    y: positions[i].y,
    n,
    isCorrect: n === q.answer,
    popped: false,
  }));
}
