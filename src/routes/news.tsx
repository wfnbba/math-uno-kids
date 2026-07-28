import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PRODUCTS, downloadProduct, type Product } from "@/lib/decks";
import { BottomNav } from "@/components/BottomNav";
import { PdfViewer } from "@/components/PdfViewer";
import { Scoreboard } from "@/components/Scoreboard";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Decks — UNO Method" },
      {
        name: "description",
        content:
          "Weekly news from UNO Method: your Math UNO deck and the FIFA World Cup 2026 edition, with printing tips, rules and a live scoreboard.",
      },
      { property: "og:title", content: "News & Decks — UNO Method" },
      {
        property: "og:description",
        content: "New drops every week: decks, printing guides, rules and scoreboards for your Math UNO games.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: News,
});

interface DeckCopy {
  accent: string;
  badge: string;
  print: string[];
  play: string[];
}

const COPY: Record<Product["id"], DeckCopy> = {
  complete: {
    accent: "fun-green",
    badge: "🃏 Core Deck",
    print: [
      "White cardstock 200–250 gsm for durable cards.",
      "A4 or US Letter at 100% scale — turn OFF “Fit to page”.",
      "Print in color, single-sided works great.",
      "Cut along the dashed lines with a grown-up.",
      "Fold the included box template to store the deck.",
    ],
    play: [
      "2–6 players, ages 4+. Shuffle and deal 7 cards each.",
      "Flip one card to start the discard pile.",
      "On your turn: match the COLOR or match the MATH VALUE.",
      "Example: “1+1” can be played on “2” or on “0+2”.",
      "No match? Draw one card and pass.",
      "One card left? Shout “UNO!”",
      "First player to empty their hand wins the round.",
    ],
  },
  fifa: {
    accent: "fun-blue",
    badge: "⭐ Premium Edition",
    print: [
      "White cardstock 250 gsm gives the premium feel.",
      "A4 or US Letter at 100% scale — no scaling, no fit-to-page.",
      "Print in high quality / photo mode for the team colors.",
      "Cut along the dashed lines, round the corners if you like.",
      "Fold the World Cup box template to store the deck.",
    ],
    play: [
      "2–6 players, ages 4+. Deal 7 cards to each player.",
      "Addition + Subtraction only — perfect for younger kids.",
      "Match the COLOR or match the MATH VALUE of the top card.",
      "Team cards act as wilds: call out the next color.",
      "No match? Draw one card and pass.",
      "One card left? Shout “UNO!” — forget and draw 2.",
      "Round winner scores the points left in every other hand.",
    ],
  },
};

function News() {
  const [viewing, setViewing] = useState<Product | null>(null);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-6">
      <header className="shadow-pop mb-6 rounded-3xl border-4 border-border bg-gradient-to-br from-fun-purple via-fun-blue to-fun-green p-6 text-center animate-pop-in">
        <p className="font-display text-base font-extrabold uppercase tracking-widest text-primary-foreground/90">
          UNO Method
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold text-primary-foreground drop-shadow-md">
          News 🎁
        </h1>
        <p className="mt-2 font-display text-lg font-bold text-primary-foreground/95">
          New drops every single week — decks, rules and game tools.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {PRODUCTS.map((product) => {
          const copy = COPY[product.id];
          return (
            <article
              key={product.id}
              className="shadow-pop flex flex-col overflow-hidden rounded-3xl border-4 border-border bg-card animate-float-up"
            >
              <div className={`bg-${copy.accent} p-3`}>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-card/95 p-2">
                  <img
                    src={product.cover}
                    alt={`${product.name} cover`}
                    loading="lazy"
                    className="aspect-[3/4] w-full rounded-xl object-cover shadow-md"
                  />
                  <img
                    src={product.sample}
                    alt={`${product.name} sample cards`}
                    loading="lazy"
                    className="aspect-[3/4] w-full rounded-xl object-cover shadow-md"
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <span className={`mb-2 inline-block w-fit rounded-full bg-${copy.accent} px-3 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-primary-foreground`}>
                  {copy.badge}
                </span>
                <h2 className="font-display text-xl font-extrabold leading-tight">{product.name}</h2>
                <p className="mt-1 text-sm font-bold text-muted-foreground">{product.operations}</p>
                <p className="text-sm font-bold text-muted-foreground">{product.cards} cards · Print-ready PDF</p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewing(product)}
                    className="btn-bounce rounded-2xl border-4 border-border bg-fun-blue px-2 py-3 font-display text-base font-extrabold text-primary-foreground"
                  >
                    👀 View
                  </button>
                  <button
                    onClick={() => downloadProduct(product)}
                    className="btn-bounce rounded-2xl border-4 border-border bg-fun-green px-2 py-3 font-display text-base font-extrabold text-primary-foreground"
                  >
                    ⬇️ Get it
                  </button>
                </div>

                <Section title="🖨️ How to print" items={copy.print} />
                <Section title="🎮 How to play" items={copy.play} defaultOpen />

                <div className="mt-3">
                  <Scoreboard deckId={product.id} accent={copy.accent} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <BottomNav />
      {viewing && <PdfViewer product={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function Section({ title, items, defaultOpen }: { title: string; items: string[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border-4 border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-muted px-3 py-2 font-display text-base font-extrabold"
      >
        {title}
        <span className="text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ol className="space-y-1 bg-card px-4 py-3 text-sm font-bold text-muted-foreground">
          {items.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-display text-foreground">{i + 1}.</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
