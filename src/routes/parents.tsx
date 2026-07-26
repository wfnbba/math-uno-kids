import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  OPERATIONS,
  OP_META,
  getStats,
  getDayLog,
  getStreak,
  getBadges,
  getProfile,
  type Stats,
  type DayLog,
  type Operation,
  type Profile,
} from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { ProfileSetup } from "@/components/ProfileSetup";
import { CancelSubscription } from "@/components/CancelSubscription";

export const Route = createFileRoute("/parents")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — KidsMath Cards" },
      { name: "description", content: "See your child's weekly math accuracy, strengths and areas to practice." },
    ],
  }),
  component: Parents,
});

function lastNDaysKeys(n: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
    d.setDate(d.getDate() - 1);
  }
  return keys;
}

function Parents() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState<DayLog>({});
  const [streak, setStreak] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [editing, setEditing] = useState(false);

  const refresh = () => {
    setProfile(getProfile());
    setStats(getStats());
    setDays(getDayLog());
    setStreak(getStreak());
    setBadgeCount(getBadges().length);
    setChecked(true);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!checked) {
    return <div className="flex min-h-screen items-center justify-center font-display text-2xl font-extrabold">Loading...</div>;
  }

  if (!profile || editing) {
    return (
      <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
        <h1 className="mb-4 text-center font-display text-3xl font-extrabold text-primary">
          {profile ? "Edit Profile ✏️" : "Set Up Kid Profile 🦊"}
        </h1>
        <p className="mb-4 text-center text-base font-bold text-muted-foreground">
          {profile
            ? "Update your child's name, level and favorite theme."
            : "Create a profile so the app can save progress and personalize stories."}
        </p>
        <ProfileSetup
          showWelcome={!profile}
          doneLabel="Back to dashboard →"
          onDone={() => {
            setEditing(false);
            refresh();
          }}
        />
        <BottomNav />
      </div>
    );
  }

  if (!stats) {
    return <div className="flex min-h-screen items-center justify-center font-display text-2xl font-extrabold">Loading...</div>;
  }


  // Weekly per-op aggregation
  const weekKeys = lastNDaysKeys(7);
  const weekly: Record<Operation, { total: number; correct: number }> = {
    addition: { total: 0, correct: 0 },
    subtraction: { total: 0, correct: 0 },
    multiplication: { total: 0, correct: 0 },
    division: { total: 0, correct: 0 },
  };
  let weekTotal = 0;
  for (const key of weekKeys) {
    const entry = days[key];
    if (!entry) continue;
    weekTotal += entry.total;
    for (const op of OPERATIONS) {
      const e = entry.byOp[op];
      if (e) {
        weekly[op].total += e.total;
        weekly[op].correct += e.correct;
      }
    }
  }

  const withData = OPERATIONS.filter((op) => weekly[op].total >= 3);
  const acc = (op: Operation) => Math.round((weekly[op].correct / Math.max(1, weekly[op].total)) * 100);
  let insight = `${profile.name} hasn't practiced much this week yet. A quick round a day builds the habit!`;
  if (withData.length > 0) {
    const sorted = [...withData].sort((a, b) => acc(b) - acc(a));
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    if (best === worst) {
      insight = `${profile.name} got ${acc(best)}% right in ${OP_META[best].label.toLowerCase()} this week. Try mixing in another operation!`;
    } else {
      insight = `${profile.name} got ${acc(best)}% right in ${OP_META[best].label.toLowerCase()} this week, but could use more practice with ${OP_META[worst].label.toLowerCase()} (${acc(worst)}%).`;
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-primary">Parent Dashboard 📊</h1>
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
          Kid: <span className="font-extrabold text-foreground">{profile.name}</span>
        </span>
        <button
          onClick={() => setEditing(true)}
          className="btn-bounce rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary"
        >
          ✏️ Edit profile
        </button>
      </div>


      {/* Insight */}
      <div className="shadow-pop mb-6 rounded-3xl border-4 border-fun-blue bg-card p-5 animate-pop-in">
        <p className="font-display text-sm font-extrabold uppercase tracking-wide text-fun-blue">This Week</p>
        <p className="mt-1 text-base font-bold leading-relaxed">{insight}</p>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-extrabold">{weekTotal}</p>
          <p className="text-xs font-bold text-muted-foreground">Answers this week</p>
        </div>
        <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-extrabold">{streak} 🔥</p>
          <p className="text-xs font-bold text-muted-foreground">Day streak</p>
        </div>
        <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-extrabold">{badgeCount} 🏅</p>
          <p className="text-xs font-bold text-muted-foreground">Badges earned</p>
        </div>
      </div>

      {/* Weekly accuracy by operation */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-xl font-extrabold">Weekly Accuracy</h2>
        <div className="space-y-3">
          {OPERATIONS.map((op) => {
            const w = weekly[op];
            const pct = w.total > 0 ? Math.round((w.correct / w.total) * 100) : 0;
            return (
              <div key={op} className="shadow-pop rounded-3xl border-4 border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-base font-extrabold">
                    {OP_META[op].symbol} {OP_META[op].label}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">
                    {w.total > 0 ? `${pct}% · ${w.correct}/${w.total}` : "No practice yet"}
                  </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full bg-${OP_META[op].color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* All-time */}
      <section>
        <h2 className="mb-4 font-display text-xl font-extrabold">All Time</h2>
        <div className="shadow-pop overflow-hidden rounded-3xl border-4 border-border bg-card">
          {OPERATIONS.map((op) => {
            const s = stats[op];
            const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            return (
              <div key={op} className="flex items-center justify-between border-b-2 border-border px-5 py-3 last:border-b-0">
                <span className="font-display text-base font-extrabold">{OP_META[op].label}</span>
                <span className="text-sm font-bold text-muted-foreground">
                  {s.total > 0 ? `${pct}% (${s.correct}/${s.total})` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-8">
        <CancelSubscription />
      </div>

      <BottomNav />
    </div>
  );
}
