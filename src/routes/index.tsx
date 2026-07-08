import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DECKS, downloadAll, downloadDeck } from "@/lib/decks";
import { getProfile } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { InstallButton } from "@/components/InstallButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kids Math Uno — 192 Printable Math Cards" },
      {
        name: "description",
        content:
          "Kids Math Uno: your 192 printable math cards across 4 operations. Download, print, cut and play a fun UNO-style game today!",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  { emoji: "⬇️", title: "Download", desc: "Grab your PDF decks below." },
  { emoji: "🖨️", title: "Print", desc: "Print on cardstock for durability." },
  { emoji: "✂️", title: "Cut", desc: "Cut along the borders — ask a grown-up!" },
  { emoji: "🃏", title: "Deal 7", desc: "Every player gets 7 cards." },
  { emoji: "🧠", title: "Solve", desc: "Read the operation and find the answer." },
  { emoji: "🎉", title: "Play & Win", desc: "First to empty their hand wins!" },
];

function Index() {
  const [name, setName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      void navigate({ to: "/onboarding" });
      return;
    }
    setName(p.name);
    setChecked(true);
  }, [navigate]);

  if (!checked) return null;

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
      {/* Sticky Install Button — disappears once installed */}
      <div className="sticky top-2 z-40 mb-4">
        <InstallButton />
      </div>

      {/* HERO */}
      <section className="shadow-pop mb-6 overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-br from-fun-red via-fun-yellow to-fun-green p-6 text-center animate-pop-in">
        <p className="font-display text-sm font-extrabold uppercase tracking-widest text-primary-foreground/90">
          Kids Math UNO
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold leading-tight text-primary-foreground drop-shadow-md">
          Your 192 Math Cards
        </h1>
        <p className="mt-2 font-display text-lg font-extrabold text-primary-foreground/95">
          Download · Print · Play Today! 🎉
        </p>
        {name ? (
          <p className="mt-3 font-display text-base font-bold text-primary-foreground">Hi, {name}! 👋 Ready to play?</p>
        ) : (
          <Link
            to="/onboarding"
            className="btn-bounce mt-4 inline-block rounded-2xl bg-card px-5 py-2 font-display text-sm font-extrabold text-primary"
          >
            Set up my profile →
          </Link>
        )}
      </section>


      {/* DECK BOXES */}
      <section className="mb-4">
        <h2 className="mb-1 text-center font-display text-2xl font-extrabold">Pick Your Deck</h2>
        <p className="mb-4 text-center text-sm font-bold text-muted-foreground">
          Tap a box to download · 48 cards each · 13 pages
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DECKS.map((deck, i) => (
            <button
              key={deck.op}
              onClick={() => downloadDeck(deck)}
              className={`btn-bounce shadow-pop group flex flex-col items-center overflow-hidden rounded-3xl border-4 border-border ${deck.bg} p-2 text-center animate-float-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img
                src={deck.image}
                alt={`${deck.name} card game box`}
                loading="lazy"
                width={1024}
                height={1024}
                className="h-32 w-full rounded-2xl object-contain drop-shadow-lg transition-transform group-hover:scale-105"
              />
              <span className="mt-2 font-display text-lg font-extrabold text-primary-foreground">{deck.name}</span>
              <span className="text-xs font-bold text-primary-foreground/90">{deck.tagline}</span>
              <span className="mt-1 rounded-full bg-card/95 px-3 py-1 font-display text-xs font-extrabold text-foreground">
                ⬇️ Download PDF
              </span>
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={downloadAll}
        className="btn-bounce shadow-pop mb-8 mt-4 w-full rounded-3xl bg-fun-purple px-6 py-4 font-display text-lg font-extrabold text-primary-foreground"
      >
        ⬇️ Download All 4 Decks (192 Cards)
      </button>

      {/* PLAY ON SCREEN CTA */}
      <section className="shadow-pop mb-8 rounded-3xl bg-fun-blue p-6 text-center">
        <h2 className="font-display text-2xl font-extrabold text-primary-foreground">No printer? Play right here!</h2>
        <p className="mt-1 text-sm font-bold text-primary-foreground/90">
          Travel the Math Road — 10 fun mini-games await!
        </p>
        <Link
          to="/play"
          className="btn-bounce mt-4 inline-block rounded-2xl bg-card px-6 py-3 font-display text-lg font-extrabold text-fun-blue"
        >
          🗺️ Open Math Road
        </Link>
      </section>

      {/* HOW TO PLAY — STEP BY STEP */}
      <section className="mb-8">
        <h2 className="mb-4 text-center font-display text-2xl font-extrabold">How To Play — Step by Step</h2>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="shadow-pop flex items-center gap-4 rounded-3xl border-4 border-border bg-card p-4 animate-float-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fun-yellow font-display text-xl font-extrabold text-foreground">
                {i + 1}
              </span>
              <span className="text-3xl">{s.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-extrabold">{s.title}</span>
                <span className="text-sm font-bold text-muted-foreground">{s.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* GAME RULES */}
      <section className="mb-8">
        <h2 className="mb-4 text-center font-display text-2xl font-extrabold">Game Rules</h2>
        <div className="space-y-4">
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-lg font-extrabold">🔄 On your turn</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base font-bold text-muted-foreground">
              <li>Look at the operation on the top card.</li>
              <li>Solve it in your head.</li>
              <li>Place the card with the correct answer on top.</li>
              <li>No matching card? Draw a new one!</li>
            </ul>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-lg font-extrabold">🏆 How to win</h3>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              First player to empty their hand — or with the most correct answers when the deck runs out — wins!
            </p>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-lg font-extrabold">👥 Who can play</h3>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              2 to 6 players. Friends, siblings, parents or classmates. Anywhere with a flat table!
            </p>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
