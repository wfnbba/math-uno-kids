import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  OPERATIONS,
  OP_META,
  getStats,
  getStreak,
  getBadges,
  BADGE_DEFS,
  type Stats,
} from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { useRequireProfile } from "@/hooks/use-require-profile";
import { ProfileRedirectFallback } from "@/components/ProfileRedirectFallback";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — KidsMath Cards" },
      { name: "description", content: "Track streaks, badges and mastery for each math operation." },
    ],
  }),
  component: Progress,
});

const MASTERY_GOAL = 50;

function Progress() {
  const { profile, ready, needsProfile } = useRequireProfile();
  const [stats, setStats] = useState<Stats | null>(null);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    setStats(getStats());
    setStreak(getStreak());
    setBadges(getBadges());
  }, []);

  if (needsProfile || !profile) return <ProfileRedirectFallback />;

  if (!ready || !stats) {
    return <div className="flex min-h-screen items-center justify-center font-display text-2xl font-extrabold">Loading... 🦊</div>;
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
      <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-primary">
        {profile.name}'s Progress ⭐
      </h1>

      {/* Streak */}
      <div className="shadow-pop mb-6 rounded-3xl bg-fun-orange p-6 text-center animate-pop-in">
        <span className="text-5xl">🔥</span>
        <p className="mt-2 font-display text-3xl font-extrabold text-primary-foreground">
          {streak} day{streak === 1 ? "" : "s"} streak!
        </p>
        <p className="text-sm font-bold text-primary-foreground/90">
          {streak === 0 ? "Play today to start your streak!" : "Keep playing every day!"}
        </p>
      </div>

      {/* Mastery bars */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold">Mastery</h2>
        <div className="space-y-4">
          {OPERATIONS.map((op) => {
            const s = stats[op];
            const pct = Math.min(100, Math.round((s.correct / MASTERY_GOAL) * 100));
            return (
              <div key={op} className="shadow-pop rounded-3xl border-4 border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-lg font-extrabold">
                    {OP_META[op].symbol} {OP_META[op].label}
                  </span>
                  <span className="font-display text-sm font-extrabold text-muted-foreground">
                    {s.correct}/{MASTERY_GOAL}
                  </span>
                </div>
                <div className="h-5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full bg-${OP_META[op].color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct >= 100 && <p className="mt-1 text-sm font-extrabold text-fun-green">Mastered! 🎉</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="mb-4 font-display text-2xl font-extrabold">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFS.map((badge) => {
            const earned = badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`shadow-pop rounded-3xl border-4 border-border p-3 text-center ${
                  earned ? "bg-fun-yellow/50" : "bg-card opacity-40 grayscale"
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <p className="mt-1 font-display text-xs font-extrabold leading-tight">{badge.name}</p>
              </div>
            );
          })}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
