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
          UNO Method
        </p>
        <h1 className="mt-1 font-display text-4xl font-extrabold leading-tight text-primary-foreground drop-shadow-md">
          Welcome to UNO Method
        </h1>
        <p className="mt-3 font-display text-xl font-extrabold text-primary-foreground/95">
          New stuff every week 🎁
        </p>
        {name && (
          <p className="mt-3 font-display text-lg font-bold text-primary-foreground">
            Hi, {name}! 👋 Ready to play?
          </p>
        )}
      </section>

      {/* PRODUCTS */}
      <section className="mb-6 space-y-5">
        <h2 className="text-center font-display text-3xl font-extrabold">Your Math UNO Decks</h2>
        <div className="flex flex-col items-center">
          <p className="rounded-full border-4 border-border bg-fun-yellow px-4 py-2 text-center font-display text-base font-extrabold text-foreground">
            👇 Download your decks right here
          </p>
          <span className="animate-bounce-soft text-4xl leading-none">⬇️</span>
        </div>


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

      {/* INSTRUCTIONS LIVE IN YOUR PURCHASES */}
      <section className="shadow-pop mb-8 rounded-3xl border-4 border-border bg-fun-yellow/40 p-5 text-center">
        <h2 className="font-display text-2xl font-extrabold">🖨️ Printing & rules</h2>
        <p className="mt-2 text-base font-bold text-foreground">
          Every product has its own PDFs, print guide, rules and live scoreboard inside Your Purchases.
        </p>
        <a
          href="/purchases"
          className="btn-bounce mt-4 inline-block rounded-2xl border-4 border-border bg-card px-6 py-3 font-display text-lg font-extrabold"
        >
          🎁 Open Your Purchases
        </a>
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
