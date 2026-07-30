import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct, downloadUrl, type Product } from "@/lib/decks";
import { BottomNav } from "@/components/BottomNav";
import { PdfViewer } from "@/components/PdfViewer";
import { Scoreboard } from "@/components/Scoreboard";

export const Route = createFileRoute("/purchases/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Your Purchases` : "Product — Your Purchases";
    const description = p
      ? `${p.tagline}. View the PDF online, print at home and follow the step-by-step guide.`
      : "View, print and download your UNO Method product.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [viewing, setViewing] = useState<{ url: string; name: string; filename: string } | null>(null);

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-4 md:max-w-2xl">
      <Link
        to="/purchases"
        className="btn-bounce mb-4 inline-block rounded-2xl border-4 border-border bg-card px-4 py-2 font-display text-base font-extrabold"
      >
        ← Your Purchases
      </Link>

      <header
        className={`shadow-pop mb-5 overflow-hidden rounded-3xl border-4 border-border bg-gradient-to-br ${product.gradient} p-3 animate-pop-in`}
      >
        <img
          src={product.card}
          alt={`${product.name} cover`}
          width={1024}
          height={1024}
          className="aspect-square w-full rounded-2xl object-cover shadow-lg"
        />
        <div className="px-2 pb-1 pt-3 text-center">
          <span className="inline-block rounded-full bg-card px-3 py-1 font-display text-xs font-extrabold uppercase tracking-wider">
            {product.badge}
          </span>
          <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight text-primary-foreground drop-shadow">
            {product.name}
          </h1>
          <p className="mt-1 font-display text-base font-bold text-primary-foreground/95">{product.operations}</p>
        </div>
      </header>

      <section className="mb-5 space-y-3">
        <h2 className="font-display text-2xl font-extrabold">📥 Your files</h2>
        {product.files.map((file) => (
          <article key={file.filename} className="shadow-pop rounded-3xl border-4 border-border bg-card p-4">
            <h3 className="font-display text-lg font-extrabold leading-tight">{file.label}</h3>
            <p className="mt-1 text-sm font-bold text-muted-foreground">{file.description}</p>
            <p className="text-sm font-bold text-muted-foreground">{file.pages} pages · PDF</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => setViewing({ url: file.url, name: file.label, filename: file.filename })}
                className="btn-bounce min-h-14 rounded-2xl border-4 border-border bg-fun-blue px-2 py-3 font-display text-lg font-extrabold text-primary-foreground"
              >
                👀 View
              </button>
              <button
                onClick={() => downloadUrl(file.url, file.filename)}
                className="btn-bounce min-h-14 rounded-2xl border-4 border-border bg-fun-green px-2 py-3 font-display text-lg font-extrabold text-primary-foreground"
              >
                ⬇️ Download
              </button>
            </div>
          </article>
        ))}
      </section>

      <Steps title="🖨️ How to print" items={product.print} defaultOpen />
      <Steps title={product.hasScoreboard ? "🎮 How to play" : "✂️ How to cut & play"} items={product.play} />

      {product.hasScoreboard && (
        <div className="mt-4">
          <Scoreboard deckId={product.id} accent={product.accent.replace("bg-", "")} />
        </div>
      )}

      <BottomNav />
      {viewing && (
        <PdfViewer
          product={{ ...(product as Product), name: viewing.name, url: viewing.url, filename: viewing.filename }}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

function Steps({ title, items, defaultOpen }: { title: string; items: string[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="mt-3 overflow-hidden rounded-3xl border-4 border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between bg-muted px-4 py-3 font-display text-lg font-extrabold"
      >
        {title}
        <span className="text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ol className="space-y-2 bg-card px-4 py-3 text-base font-bold text-muted-foreground">
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
