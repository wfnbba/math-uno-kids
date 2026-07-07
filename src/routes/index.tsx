import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import mascot from "@/assets/mascot.png";
import { DECKS, downloadAll, downloadDeck } from "@/lib/decks";
import { getProfile } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { InstallButton } from "@/components/InstallButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kids Math Uno" },
      {
        name: "description",
        content: "Uno Math Adventures offers interactive math card games for kids, with printable decks and digital play modes.",
      },
    ],
  }),
  component: Index,
});

const PREP_STEPS = [
  { emoji: "🖨️", lines: ["Print on", "cardstock"] },
  { emoji: "✂️", lines: ["Cut along", "borders"] },
  { emoji: "🎉", lines: ["Play &", "learn!"] },
];

const DECK_CONTENTS = [
  { label: "Question Cards", value: "20 (5 pages)" },
  { label: "Answer Cards", value: "20 (5 pages)" },
  { label: "Power Cards", value: "8 (2 pages)" },
  { label: "Card Backs", value: "Included on each page" },
  { label: "Box Template", value: "1 page" },
];

function Index() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getProfile()?.name ?? null);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
          KIDSMATH CARDS
        </h1>
        {name ? (
          <p className="mt-1 font-display text-lg font-bold">Hi, {name}! 👋</p>
        ) : (
          <Link to="/onboarding" className="mt-1 inline-block font-display text-sm font-bold text-fun-purple underline">
            Set up your profile →
          </Link>
        )}
      </header>

      {/* Hero */}
      <section className="shadow-pop mb-6 rounded-3xl border-4 border-border bg-card p-6 text-center animate-float-up">
        <img
          src={mascot}
          alt="KidsMath fox mascot holding number cards"
          width={768}
          height={768}
          className="mx-auto mb-3 h-36 w-36 animate-bounce-soft"
        />
        <h2 className="font-display text-2xl font-extrabold">Your Card Decks</h2>
        <p className="mt-1 text-base font-bold text-muted-foreground">
          192 cards across 4 operations. Download, print & play!
        </p>
      </section>

      <div className="mb-6">
        <InstallButton />
      </div>

      {/* Decks */}
      <section className="mb-4 space-y-4">
        {DECKS.map((deck, i) => (
          <div
            key={deck.op}
            className="shadow-pop flex items-center gap-4 rounded-3xl border-4 border-border bg-card p-4 animate-float-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${deck.bg}`}>
              <span className="font-display text-4xl font-extrabold text-primary-foreground">{deck.symbol}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl font-extrabold">{deck.name}</h3>
              <p className="text-sm font-bold text-muted-foreground">48 cards · 13 pages</p>
            </div>
            <button
              onClick={() => downloadDeck(deck)}
              className="btn-bounce shadow-pop shrink-0 rounded-2xl bg-primary px-4 py-3 font-display text-sm font-extrabold text-primary-foreground"
            >
              Download
              <br />
              PDF
            </button>
          </div>
        ))}
      </section>

      <button
        onClick={downloadAll}
        className="btn-bounce shadow-pop mb-8 w-full rounded-3xl bg-fun-blue px-6 py-4 font-display text-lg font-extrabold text-primary-foreground"
      >
        ⬇️ Download All 4 Decks (192 Cards)
      </button>

      {/* How to Prepare */}
      <section className="mb-8">
        <h2 className="mb-4 text-center font-display text-2xl font-extrabold">How to Prepare</h2>
        <div className="grid grid-cols-3 gap-3">
          {PREP_STEPS.map((step) => (
            <div key={step.emoji} className="shadow-pop rounded-3xl border-4 border-border bg-card p-4 text-center">
              <span className="text-3xl">{step.emoji}</span>
              <p className="mt-2 font-display text-sm font-extrabold leading-tight">
                {step.lines[0]}
                <br />
                {step.lines[1]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Play */}
      <section className="mb-8">
        <h2 className="mb-4 text-center font-display text-2xl font-extrabold">How to Play</h2>
        <div className="space-y-4">
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-lg font-extrabold">📦 Setup</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base font-bold text-muted-foreground">
              <li>Each player receives 7 cards.</li>
              <li>Turn the first card of the deck to start the discard pile.</li>
            </ul>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-lg font-extrabold">🔄 On your turn</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base font-bold text-muted-foreground">
              <li>Observe the operation on the stack card.</li>
              <li>Solve the operation.</li>
              <li>Place the card with the correct answer on the stack.</li>
              <li>If you don't have the answer, draw a card.</li>
            </ul>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-lg font-extrabold">🏆 Winning</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base font-bold text-muted-foreground">
              <li>Continue until a player runs out of cards or all cards in the deck are gone.</li>
              <li>The winner is the one who runs out of cards or has the most correct answers at the end.</li>
            </ul>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-lg font-extrabold">🎮 Game Modes</h3>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              <span className="text-foreground">With whom:</span> Friends, siblings, parents, or school
              colleagues. Can be played by 2 to 6 players.
            </p>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              <span className="text-foreground">Where:</span> At home, in the classroom, or anywhere with a flat
              table. Can also be used as an individual educational activity.
            </p>
          </div>
        </div>
      </section>

      {/* What's in each deck */}
      <section className="mb-8">
        <h2 className="mb-4 text-center font-display text-2xl font-extrabold">What's in Each Deck</h2>
        <div className="shadow-pop overflow-hidden rounded-3xl border-4 border-border bg-card">
          {DECK_CONTENTS.map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b-2 border-border px-5 py-3 last:border-b-0">
              <span className="font-display text-base font-extrabold">{row.label}</span>
              <span className="text-sm font-bold text-muted-foreground">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-fun-yellow/40 px-5 py-3">
            <span className="font-display text-base font-extrabold">Total per deck</span>
            <span className="font-display text-sm font-extrabold">48 cards · 13 pages</span>
          </div>
        </div>
      </section>

      {/* Digital play CTA */}
      <section className="shadow-pop mb-6 rounded-3xl bg-fun-purple p-6 text-center">
        <h2 className="font-display text-xl font-extrabold text-primary-foreground">No printer? No problem!</h2>
        <p className="mt-1 text-sm font-bold text-primary-foreground/90">
          Play right here on the screen with digital cards.
        </p>
        <Link
          to="/play"
          className="btn-bounce mt-4 inline-block rounded-2xl bg-card px-6 py-3 font-display text-lg font-extrabold text-fun-purple"
        >
          🎮 Play on Screen
        </Link>
      </section>

      <BottomNav />
    </div>
  );
}
