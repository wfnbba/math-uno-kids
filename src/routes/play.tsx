import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { PHASES, type Phase } from "@/lib/roadmap";
import { getRoadmap, saveRoadmapStars, awardBadge, recordAnswer, type RoadmapProgress } from "@/lib/store";
import { playWin } from "@/lib/sounds";
import { BottomNav } from "@/components/BottomNav";
import { useRequireProfile } from "@/hooks/use-require-profile";
import { MiniGameRunner } from "@/components/MiniGames";
import { ProfileRedirectFallback } from "@/components/ProfileRedirectFallback";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Math Road — Kids Math Uno" },
      { name: "description", content: "Travel the Math Road: 10 fun mini-games with fruits, animals, and challenges!" },
    ],
  }),
  component: Play,
});

type Phase_ = "roadmap" | "playing" | "done";

function computeStars(correct: number, total: number): number {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.65) return 2;
  if (pct >= 0.35) return 1;
  return 0;
}

function Play() {
  const { profile, ready, needsProfile } = useRequireProfile();
  const [rm, setRm] = useState<RoadmapProgress>({ currentPhase: 1, stars: {} });
  const [screen, setScreen] = useState<Phase_>("roadmap");
  const [phase, setPhase] = useState<Phase | null>(null);
  const [result, setResult] = useState<{ stars: number; correct: number; total: number } | null>(null);

  useEffect(() => {
    setRm(getRoadmap());
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center font-display text-2xl font-extrabold">
        Loading... 🦊
      </div>
    );
  }

  if (needsProfile || !profile) return <ProfileRedirectFallback />;

  const openPhase = (p: Phase) => {
    if (p.id > rm.currentPhase) return;
    setPhase(p);
    setResult(null);
    setScreen("playing");
  };

  const handleComplete = (correct: number, total: number) => {
    if (!phase) return;
    const stars = computeStars(correct, total);
    // record answers so parent dashboard reflects
    if (phase.op) {
      for (let k = 0; k < correct; k++) recordAnswer(phase.op, true);
      for (let k = 0; k < total - correct; k++) recordAnswer(phase.op, false);
    }
    const next = saveRoadmapStars(phase.id, stars);
    setRm(next);
    setResult({ stars, correct, total });
    setScreen("done");
    if (stars >= 1) {
      playWin();
      void confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      awardBadge("explorer");
      if (phase.id === PHASES.length && stars >= 2) awardBadge("boss-slayer");
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
      {screen === "roadmap" && (
        <RoadmapView profile={profile.name} rm={rm} onOpen={openPhase} />
      )}

      {screen === "playing" && phase && (
        <div>
          <button
            onClick={() => setScreen("roadmap")}
            className="mb-3 font-display text-sm font-bold text-muted-foreground underline"
          >
            ← Back to Map
          </button>
          <div className={`shadow-pop mb-4 rounded-3xl bg-${phase.color} p-4 text-center`}>
            <span className="text-3xl">{phase.emoji}</span>
            <h2 className="font-display text-xl font-extrabold text-primary-foreground">
              Phase {phase.id}: {phase.name}
            </h2>
            <p className="text-sm font-bold text-primary-foreground/90">{phase.desc}</p>
          </div>
          <MiniGameRunner phase={phase} level={profile.level} onComplete={handleComplete} />
        </div>
      )}

      {screen === "done" && phase && result && (
        <div className="text-center animate-pop-in">
          <span className="text-7xl">{result.stars > 0 ? "🏆" : "😅"}</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold">
            {result.stars > 0 ? "Phase Complete!" : "So close! Try again!"}
          </h2>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-5xl ${s <= result.stars ? "" : "opacity-25 grayscale"}`}>
                ⭐
              </span>
            ))}
          </div>
          <p className="mt-3 font-display text-xl font-extrabold text-primary">
            {result.correct} / {result.total} correct
          </p>
          <div className="mt-8 space-y-3">
            <button
              onClick={() => openPhase(phase)}
              className="btn-bounce shadow-pop w-full rounded-3xl bg-primary px-6 py-4 font-display text-lg font-extrabold text-primary-foreground"
            >
              Play Again 🔁
            </button>
            {result.stars > 0 && phase.id < PHASES.length && (
              <button
                onClick={() => {
                  const nxt = PHASES[phase.id]; // 1-based -> index = id
                  if (nxt) openPhase(nxt);
                }}
                className="btn-bounce shadow-pop w-full rounded-3xl bg-fun-green px-6 py-4 font-display text-lg font-extrabold text-primary-foreground"
              >
                Next Phase ➡️
              </button>
            )}
            <button
              onClick={() => setScreen("roadmap")}
              className="btn-bounce shadow-pop w-full rounded-3xl border-4 border-border bg-card px-6 py-4 font-display text-lg font-extrabold"
            >
              🗺️ Back to Map
            </button>
            <Link to="/progress" className="block pt-2 text-center font-display text-sm font-bold text-fun-purple underline">
              See my progress ⭐
            </Link>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function RoadmapView({
  profile,
  rm,
  onOpen,
}: {
  profile: string;
  rm: RoadmapProgress;
  onOpen: (p: Phase) => void;
}) {
  const totalStars = useMemo(() => Object.values(rm.stars).reduce((s, n) => s + n, 0), [rm.stars]);
  return (
    <div>
      <div className="mb-4 text-center">
        <h1 className="font-display text-3xl font-extrabold text-primary">🗺️ Math Road</h1>
        <p className="font-display text-sm font-bold text-muted-foreground">
          {profile}, you have {totalStars} ⭐ · Reach the Boss at Phase 10!
        </p>
      </div>

      <div className="relative">
        {/* dashed path */}
        <div className="pointer-events-none absolute inset-y-4 left-1/2 -z-0 w-1 -translate-x-1/2 rounded-full border-4 border-dashed border-border/70" />
        <ol className="relative space-y-4">
          {PHASES.map((p, idx) => {
            const unlocked = p.id <= rm.currentPhase;
            const stars = rm.stars[p.id] ?? 0;
            const side = idx % 2 === 0 ? "left" : "right";
            return (
              <li key={p.id} className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
                <button
                  disabled={!unlocked}
                  onClick={() => onOpen(p)}
                  className={`btn-bounce shadow-pop relative w-[85%] rounded-3xl border-4 p-4 text-left transition-all ${
                    unlocked
                      ? `border-border bg-${p.color} text-primary-foreground animate-float-up`
                      : "border-border bg-muted text-muted-foreground opacity-60"
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card text-3xl">
                      {unlocked ? p.emoji : "🔒"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs font-extrabold uppercase opacity-80">Phase {p.id}</p>
                      <p className="font-display text-lg font-extrabold leading-tight">{p.name}</p>
                      <p className="text-xs font-bold opacity-90">{p.desc}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={`text-lg ${s <= stars ? "" : "opacity-30 grayscale"}`}>
                        ⭐
                      </span>
                    ))}
                    {p.id === rm.currentPhase && unlocked && (
                      <span className="ml-auto rounded-full bg-card px-2 py-0.5 font-display text-[10px] font-extrabold text-foreground">
                        NEXT ▶
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
