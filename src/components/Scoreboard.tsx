import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface BoardState {
  players: Player[];
  round: number;
  target: number;
  rules: Record<string, boolean>;
  notes: string;
}

const RULE_LIST = [
  { id: "uno", label: "Must shout “UNO!” with 1 card left" },
  { id: "stacking", label: "Stacking Draw cards allowed" },
  { id: "solveAloud", label: "Solve the equation out loud" },
  { id: "timer", label: "10-second turn timer" },
  { id: "noMatchDraw", label: "No match? Draw one card" },
];

const emptyBoard = (): BoardState => ({
  players: [
    { id: "p1", name: "Player 1", score: 0 },
    { id: "p2", name: "Player 2", score: 0 },
  ],
  round: 1,
  target: 200,
  rules: { uno: true, stacking: false, solveAloud: true, timer: false, noMatchDraw: true },
  notes: "",
});

export function Scoreboard({ deckId, accent }: { deckId: string; accent: string }) {
  const key = `uno_board_${deckId}`;
  const [board, setBoard] = useState<BoardState>(emptyBoard);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setBoard({ ...emptyBoard(), ...(JSON.parse(raw) as BoardState) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(key, JSON.stringify(board));
  }, [board, key, loaded]);

  const update = (patch: Partial<BoardState>) => setBoard((b) => ({ ...b, ...patch }));
  const setPlayer = (id: string, patch: Partial<Player>) =>
    setBoard((b) => ({ ...b, players: b.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  const addPlayer = () =>
    setBoard((b) =>
      b.players.length >= 6
        ? b
        : { ...b, players: [...b.players, { id: `p${Date.now()}`, name: `Player ${b.players.length + 1}`, score: 0 }] },
    );
  const removePlayer = (id: string) =>
    setBoard((b) => (b.players.length <= 2 ? b : { ...b, players: b.players.filter((p) => p.id !== id) }));

  const bump = (id: string, delta: number) => {
    const p = board.players.find((x) => x.id === id);
    if (!p) return;
    const next = Math.max(0, p.score + delta);
    setPlayer(id, { score: next });
    if (next >= board.target) {
      try {
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      } catch {
        /* ignore */
      }
    }
  };

  const nextRound = () => update({ round: board.round + 1 });
  const resetAll = () =>
    setBoard((b) => ({ ...b, round: 1, players: b.players.map((p) => ({ ...p, score: 0 })) }));

  const leader = [...board.players].sort((a, b) => b.score - a.score)[0];
  const progress = Math.min(100, Math.round(((leader?.score ?? 0) / Math.max(1, board.target)) * 100));

  return (
    <div className="rounded-3xl border-4 border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="font-display text-lg font-extrabold">🏆 Scoreboard</h4>
        <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-display text-sm font-extrabold">
          Round
          <button onClick={() => update({ round: Math.max(1, board.round - 1) })} className="px-1">−</button>
          <span className="text-foreground">{board.round}</span>
          <button onClick={nextRound} className="px-1">+</button>
        </div>
      </div>

      {/* Race to target */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between font-display text-sm font-bold text-muted-foreground">
          <span>Race to</span>
          <input
            type="number"
            min={10}
            value={board.target}
            onChange={(e) => update({ target: Math.max(10, Number(e.target.value) || 0) })}
            className="w-24 rounded-xl border-2 border-border bg-background px-2 py-1 text-right font-display text-sm font-extrabold text-foreground"
          />
        </div>
        <div className="h-3 overflow-hidden rounded-full border-2 border-border bg-muted">
          <div className={`h-full bg-${accent} transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Players */}
      <ul className="space-y-2">
        {board.players.map((p, i) => {
          const isLeader = leader && p.id === leader.id && p.score > 0;
          return (
            <li
              key={p.id}
              className={`flex items-center gap-2 rounded-2xl border-4 p-2 ${
                isLeader ? `border-${accent} bg-${accent}/10` : "border-border bg-background"
              }`}
            >
              <span className="text-2xl">{["🦊", "🐼", "🐸", "🦉", "🐯", "🐙"][i % 6]}</span>
              <input
                value={p.name}
                onChange={(e) => setPlayer(p.id, { name: e.target.value.slice(0, 16) })}
                className="min-w-0 flex-1 rounded-xl bg-transparent px-1 font-display text-base font-extrabold text-foreground outline-none"
                aria-label="Player name"
              />
              <button
                onClick={() => bump(p.id, -1)}
                className="h-9 w-9 rounded-xl border-2 border-border font-display text-lg font-extrabold"
                aria-label={`Remove point from ${p.name}`}
              >
                −
              </button>
              <input
                type="number"
                value={p.score}
                onChange={(e) => setPlayer(p.id, { score: Math.max(0, Number(e.target.value) || 0) })}
                className="w-16 rounded-xl border-2 border-border bg-card px-1 py-1 text-center font-display text-lg font-extrabold"
                aria-label={`${p.name} score`}
              />
              <button
                onClick={() => bump(p.id, 1)}
                className={`h-9 w-9 rounded-xl border-2 border-border bg-${accent} font-display text-lg font-extrabold text-primary-foreground`}
                aria-label={`Add point to ${p.name}`}
              >
                +
              </button>
              {board.players.length > 2 && (
                <button
                  onClick={() => removePlayer(p.id)}
                  className="text-lg text-muted-foreground"
                  aria-label={`Remove ${p.name}`}
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={addPlayer}
          className="btn-bounce rounded-2xl border-4 border-border bg-background px-3 py-2 font-display text-base font-extrabold"
        >
          ➕ Add player
        </button>
        <button
          onClick={resetAll}
          className="btn-bounce rounded-2xl border-4 border-border bg-background px-3 py-2 font-display text-base font-extrabold"
        >
          🔄 Reset game
        </button>
      </div>

      {/* House rules */}
      <div className="mt-4">
        <p className="mb-2 font-display text-base font-extrabold">📋 House rules</p>
        <ul className="space-y-1">
          {RULE_LIST.map((r) => (
            <li key={r.id}>
              <label className="flex items-center gap-2 font-display text-sm font-bold text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!!board.rules[r.id]}
                  onChange={(e) => update({ rules: { ...board.rules, [r.id]: e.target.checked } })}
                  className="h-5 w-5 accent-current"
                />
                {r.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <textarea
        value={board.notes}
        onChange={(e) => update({ notes: e.target.value.slice(0, 400) })}
        placeholder="Notes: custom rules, penalties, family traditions…"
        rows={2}
        className="mt-3 w-full rounded-2xl border-4 border-border bg-background p-3 font-display text-sm font-bold outline-none"
      />
    </div>
  );
}
