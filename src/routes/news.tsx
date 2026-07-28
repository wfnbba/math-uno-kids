import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PRODUCTS, downloadProduct, type Product, type ProductId } from "@/lib/decks";
import { BottomNav } from "@/components/BottomNav";
import { PdfViewer } from "@/components/PdfViewer";
import { Scoreboard } from "@/components/Scoreboard";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Your Purchases — UNO Method" },
      {
        name: "description",
        content:
          "Open your UNO Method purchases: Math UNO, Math UNO FIFA World Cup 2026 and the Basketball Money Game — print guides, rules and live scoreboards.",
      },
      { property: "og:title", content: "Your Purchases — UNO Method" },
      {
        property: "og:description",
        content: "All your printable games in one place, with printing tips, rules and editable scoreboards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Purchases,
});

interface DeckCopy {
  accent: string;
  badge: string;
  hero: string;
  print: string[];
  play: string[];
}

const COPY: Record<ProductId, DeckCopy> = {
  complete: {
    accent: "fun-green",
    badge: "🃏 Core Deck",
    hero: "192 cards · all four operations",
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
    hero: "96 cards · World Cup 2026 theme",
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
  basketball: {
    accent: "fun-orange",
    badge: "🏀 New This Week",
    hero: "39 pages · Manage. Invest. Win.",
    print: [
      "White cardstock 200–250 gsm for cards, money and tokens.",
      "Print at 100% scale — turn OFF “Fit to page” and “Shrink oversized pages”.",
      "A4 or US Letter both work. Print in color, single-sided.",
      "Card pages hold 9 cards each — cut along the dashed guides.",
      "Optional: print the Card Back page as many times as you need and glue it behind each card.",
      "Print the Budget Sheet page 6 times (or slide one into a plastic sleeve and use a dry-erase pen).",
      "Print the box template on 250 gsm, fold the dashed lines and tape the tabs.",
    ],
    play: [
      "2–4 general managers, ages 6–14. Each one starts with $100 Million.",
      "Setup: shuffle the 4 decks, deal 8 Player cards, 4 Staff and 4 Investments to the market.",
      "MARKET PHASE — buy players, staff and investments from the market and pay the Bank.",
      "INCOME PHASE — Ticket Sales = $20M + $1M per Team Rating point above 60, then add your investments.",
      "EVENT PHASE — draw 1 Event card and do what it says (good news, bad news or a math challenge).",
      "EXPENSE PHASE — pay player salaries, staff salaries, $5M arena costs and marketing.",
      "PROFIT PHASE — Total Income − Total Expenses = Profit. Write it on your Budget Sheet.",
      "CHAMPIONSHIP PHASE — add Championship Points; the highest total wins the season and 1 Ring token.",
      "After the last season: $5M cash = 1 point, each Ring = +10, each Investment = +3, Team Rating 75+ = +8.",
      "Highest final score is the Champion Owner — fill in the certificate!",
    ],
  },
};

function Purchases() {
  const [openId, setOpenId] = useState<ProductId | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const open = PRODUCTS.find((p) => p.id === openId) ?? null;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-6">
      <header className="shadow-pop mb-6 rounded-3xl border-4 border-border bg-gradient-to-br from-fun-purple via-fun-blue to-fun-green p-6 text-center animate-pop-in">
        <p className="font-display text-base font-extrabold uppercase tracking-widest text-primary-foreground/90">
          UNO Method
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold text-primary-foreground drop-shadow-md">
          Your Purchases 🎁
        </h1>
        <p className="mt-2 font-display text-lg font-bold text-primary-foreground/95">
          Tap a game to open it — new drops every single week.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {PRODUCTS.map((product) => {
          const copy = COPY[product.id];
          return (
            <button
              key={product.id}
              onClick={() => setOpenId(product.id)}
              className="shadow-pop group relative overflow-hidden rounded-3xl border-4 border-border bg-card text-left transition-transform duration-200 hover:-translate-y-1 active:scale-95 animate-float-up"
            >
              <img
                src={product.cover}
                alt={`${product.name} cover`}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className={`absolute left-2 top-2 rounded-full bg-${copy.accent} px-3 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-primary-foreground`}
              >
                {copy.badge}
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-3 pt-10">
                <h2 className="font-display text-base font-extrabold leading-tight text-white">{product.name}</h2>
                <p className="mt-0.5 text-xs font-bold text-white/80">{copy.hero}</p>
                <span className="mt-2 inline-block rounded-full bg-white/95 px-3 py-1 font-display text-xs font-extrabold text-foreground">
                  ▶ Open
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-[55] overflow-y-auto bg-black/70 backdrop-blur-sm animate-pop-in">
          <div className="mx-auto min-h-full max-w-3xl px-3 py-6">
            <div className="shadow-pop overflow-hidden rounded-3xl border-4 border-border bg-card">
              <div className={`relative bg-${COPY[open.id].accent} p-3`}>
                <button
                  onClick={() => setOpenId(null)}
                  aria-label="Close"
                  className="btn-bounce absolute right-3 top-3 z-10 rounded-2xl bg-fun-red px-3 py-2 font-display text-sm font-extrabold text-primary-foreground"
                >
                  ✕
                </button>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-card/95 p-2">
                  <img
                    src={open.cover}
                    alt={`${open.name} cover`}
                    className="aspect-[3/4] w-full rounded-xl object-cover shadow-md"
                  />
                  <img
                    src={open.sample}
                    alt={`${open.name} sample pages`}
                    className="aspect-[3/4] w-full rounded-xl object-cover shadow-md"
                  />
                </div>
              </div>

              <div className="p-4">
                <h2 className="font-display text-2xl font-extrabold leading-tight">{open.name}</h2>
                <p className="mt-1 text-sm font-bold text-muted-foreground">{open.operations}</p>
                <p className="text-sm font-bold text-muted-foreground">{open.tagline}</p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewing(open)}
                    className="btn-bounce rounded-2xl border-4 border-border bg-fun-blue px-2 py-3 font-display text-base font-extrabold text-primary-foreground"
                  >
                    👀 View
                  </button>
                  <button
                    onClick={() => downloadProduct(open)}
                    className="btn-bounce rounded-2xl border-4 border-border bg-fun-green px-2 py-3 font-display text-base font-extrabold text-primary-foreground"
                  >
                    ⬇️ Get it
                  </button>
                </div>

                <Section title="🖨️ How to print" items={COPY[open.id].print} />
                <Section title="🎮 How to play" items={COPY[open.id].play} defaultOpen />

                <div className="mt-3">
                  <Scoreboard deckId={open.id} accent={COPY[open.id].accent} />
                </div>

                <button
                  onClick={() => setOpenId(null)}
                  className="btn-bounce mt-4 w-full rounded-2xl border-4 border-border bg-card px-4 py-3 font-display text-base font-extrabold"
                >
                  ← Back to my games
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
