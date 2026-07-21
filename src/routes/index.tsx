import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PRODUCTS, downloadProduct, type Product } from "@/lib/decks";
import { getProfile } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { InstallButton } from "@/components/InstallButton";
import { PdfViewer } from "@/components/PdfViewer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Math UNO — Printable Math Card Game for Kids" },
      {
        name: "description",
        content:
          "Math UNO: your printable math card game. Download the Complete Deck (192 cards) and the exclusive FIFA World Cup 2026 edition. View, print, cut, and play!",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  { emoji: "⬇️", title: "Download", desc: "Grab your Math UNO PDF." },
  { emoji: "🖨️", title: "Print", desc: "Print on white cardstock (200–250 gsm), A4 or Letter, 100% scale — no fit-to-page." },
  { emoji: "✂️", title: "Cut", desc: "Cut along the dashed lines with a grown-up." },
  { emoji: "📦", title: "Fold the box", desc: "Fold the box template to store your deck." },
  { emoji: "🃏", title: "Deal 7 cards", desc: "Shuffle. Every player starts with 7 cards." },
  { emoji: "🎉", title: "Play & Win", desc: "First to empty their hand shouts UNO — and wins!" },
];

function Index() {
  const [name, setName] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);

  useEffect(() => {
    const p = getProfile();
    setName(p?.name ?? null);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6 text-lg">
      <div className="sticky top-2 z-40 mb-4">
        <InstallButton />
      </div>

      {/* HERO */}
      <section className="shadow-pop mb-6 overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-br from-fun-red via-fun-yellow to-fun-green p-6 text-center animate-pop-in">
        <p className="font-display text-base font-extrabold uppercase tracking-widest text-primary-foreground/90">
          Kids Math UNO
        </p>
        <h1 className="mt-1 font-display text-5xl font-extrabold leading-tight text-primary-foreground drop-shadow-md">
          Your Math UNO Decks
        </h1>
        <p className="mt-3 font-display text-xl font-extrabold text-primary-foreground/95">
          View · Print · Cut · Play 🎉
        </p>
        {name && (
          <p className="mt-3 font-display text-lg font-bold text-primary-foreground">
            Hi, {name}! 👋 Ready to play?
          </p>
        )}
      </section>

      {/* PRODUCTS */}
      <section className="mb-6 space-y-5">
        <h2 className="text-center font-display text-3xl font-extrabold">Your Products</h2>
        <p className="text-center text-base font-bold text-muted-foreground">
          Tap <strong>View</strong> to preview inside the app, or <strong>Download</strong> to save the print-ready PDF.
        </p>

        {PRODUCTS.map((product, i) => (
          <article
            key={product.id}
            className="shadow-pop overflow-hidden rounded-3xl border-4 border-border bg-card animate-float-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`p-3 ${product.id === "fifa" ? "bg-gradient-to-br from-fun-blue via-fun-purple to-fun-red" : "bg-gradient-to-br from-fun-red via-fun-yellow to-fun-green"}`}>
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
            <div className="p-5">
              {product.id === "fifa" && (
                <span className="mb-2 inline-block rounded-full bg-fun-yellow px-3 py-1 font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
                  ⭐ Special Edition
                </span>
              )}
              <h3 className="font-display text-2xl font-extrabold leading-tight">{product.name}</h3>
              <p className="mt-1 text-base font-bold text-muted-foreground">{product.operations}</p>
              <p className="mt-1 text-sm font-bold text-muted-foreground">
                {product.cards} cards · Ages 4+ · Print-ready PDF
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setViewing(product)}
                  className="btn-bounce rounded-2xl border-4 border-border bg-fun-blue px-4 py-4 font-display text-lg font-extrabold text-primary-foreground"
                >
                  👀 View
                </button>
                <button
                  onClick={() => downloadProduct(product)}
                  className="btn-bounce rounded-2xl border-4 border-border bg-fun-green px-4 py-4 font-display text-lg font-extrabold text-primary-foreground"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* PRINT INSTRUCTIONS */}
      <section className="shadow-pop mb-8 rounded-3xl border-4 border-border bg-fun-yellow/40 p-5">
        <h2 className="mb-3 text-center font-display text-2xl font-extrabold">🖨️ How to Print</h2>
        <ul className="space-y-2 text-base font-bold text-foreground">
          <li>• Use <strong>white cardstock 200–250 gsm</strong> for durable cards.</li>
          <li>• Paper size <strong>A4 or US Letter</strong>, printed at <strong>100% scale</strong> (turn OFF “Fit to page”).</li>
          <li>• Print in <strong>color</strong>, double-sided is optional (single-sided works great).</li>
          <li>• Cut carefully along the dashed lines with scissors or a paper trimmer.</li>
          <li>• Fold the included box template to store your deck.</li>
        </ul>
      </section>

      {/* HOW TO PLAY — STEP BY STEP */}
      <section className="mb-8">
        <h2 className="mb-4 text-center font-display text-3xl font-extrabold">How To Play</h2>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="shadow-pop flex items-center gap-4 rounded-3xl border-4 border-border bg-card p-4 animate-float-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fun-yellow font-display text-2xl font-extrabold text-foreground">
                {i + 1}
              </span>
              <span className="text-4xl">{s.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-extrabold">{s.title}</span>
                <span className="text-base font-bold text-muted-foreground">{s.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* GAME RULES */}
      <section className="mb-8">
        <h2 className="mb-4 text-center font-display text-3xl font-extrabold">Game Rules</h2>
        <div className="space-y-4">
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-xl font-extrabold">🎯 The twist</h3>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              Math UNO follows the classic UNO rules — with a math twist: on your turn, <strong>match colors OR match math values</strong>.
              Solve the equation on the top card and play a card whose <em>answer</em> matches, or any card of the same color.
            </p>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-xl font-extrabold">🔄 On your turn</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base font-bold text-muted-foreground">
              <li>Read the equation on the top card.</li>
              <li>Solve it in your head.</li>
              <li>Play a card that matches the color OR the answer.</li>
              <li>No match? Draw one card.</li>
              <li>Down to one card? Shout <strong>“UNO!”</strong></li>
            </ul>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-xl font-extrabold">🏆 How to win</h3>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              First player to empty their hand wins the round!
            </p>
          </div>
          <div className="shadow-pop rounded-3xl border-4 border-border bg-card p-5">
            <h3 className="font-display text-xl font-extrabold">👥 Who can play</h3>
            <p className="mt-2 text-base font-bold text-muted-foreground">
              2 to 6 players · Ages 4+ · Friends, siblings, parents, teachers or classmates.
            </p>
          </div>
        </div>
      </section>

      {/* DIGITAL PLAY (companion, not replacement) */}
      <section className="shadow-pop mb-8 rounded-3xl border-4 border-border bg-fun-blue p-6 text-center">
        <h2 className="font-display text-2xl font-extrabold text-primary-foreground">Practice on your device</h2>
        <p className="mt-2 text-base font-bold text-primary-foreground/95">
          Bonus mini-games to warm up your math skills between rounds — a fun companion to your printed deck.
        </p>
        <a
          href="/play"
          className="btn-bounce mt-4 inline-block rounded-2xl bg-card px-6 py-3 font-display text-lg font-extrabold text-fun-blue"
        >
          🎮 Open mini-games
        </a>
      </section>

      <BottomNav />

      {viewing && <PdfViewer product={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
