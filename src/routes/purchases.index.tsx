import { createFileRoute, Link } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/decks";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/purchases/")({
  head: () => ({
    meta: [
      { title: "Your Purchases — UNO Method" },
      {
        name: "description",
        content:
          "All your UNO Method products in one place: Math UNO decks, the World Cup 2026 edition and the Paper Dolls Craft Kit. Open a card to view, print and download.",
      },
      { property: "og:title", content: "Your Purchases — UNO Method" },
      {
        property: "og:description",
        content: "Open each product card to view the PDF, print instructions and downloads.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Purchases,
});

function Purchases() {
  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6 md:max-w-3xl">
      <header className="shadow-pop mb-6 rounded-3xl border-4 border-border bg-gradient-to-br from-fun-purple via-fun-blue to-fun-green p-5 text-center animate-pop-in">
        <p className="font-display text-sm font-extrabold uppercase tracking-widest text-primary-foreground/90">
          UNO Method
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-primary-foreground drop-shadow-md sm:text-4xl">
          Your Purchases 🎁
        </h1>
        <p className="mt-2 font-display text-base font-bold text-primary-foreground/95">
          Tap a product to open your PDFs, print guide and rules.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {PRODUCTS.map((product, i) => (
          <Link
            key={product.id}
            to="/purchases/$productId"
            params={{ productId: product.id }}
            className="btn-bounce shadow-pop group block overflow-hidden rounded-3xl border-4 border-border bg-card animate-float-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="relative">
              <img
                src={product.card}
                alt={`${product.name} cover`}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover"
              />
              <span
                className={`absolute left-2 top-2 rounded-full ${product.accent} px-2 py-1 font-display text-[11px] font-extrabold uppercase tracking-wide text-primary-foreground`}
              >
                {product.badge}
              </span>
            </div>
            <div className="p-3">
              <h2 className="font-display text-base font-extrabold leading-tight">{product.shortName}</h2>
              <p className="mt-1 text-xs font-bold leading-snug text-muted-foreground">{product.tagline}</p>
              <p className="mt-2 font-display text-sm font-extrabold text-primary">Open ▶</p>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
