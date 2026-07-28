import completeAsset from "@/assets/math-uno-complete.pdf.asset.json";
import fifaAsset from "@/assets/math-uno-fifa-2026-v3.pdf.asset.json";
import bmgAsset from "@/assets/basketball-money-game.pdf.asset.json";
import deckCover from "@/assets/deck-cover.jpg.asset.json";
import deckSample from "@/assets/deck-sample.jpg.asset.json";
import fifaCover from "@/assets/fifa-cover.jpg.asset.json";
import fifaSample from "@/assets/fifa-sample.jpg.asset.json";
import bmgCover from "@/assets/bmg-cover.jpg.asset.json";
import bmgSample from "@/assets/bmg-sample.jpg.asset.json";

export type ProductId = "complete" | "fifa" | "basketball";

export interface Product {
  id: ProductId;
  name: string;
  tagline: string;
  cards: number;
  operations: string;
  url: string;
  filename: string;
  cover: string;
  sample: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "complete",
    name: "Math UNO — Complete Deck",
    tagline: "192 cards · All 4 operations in one deck",
    cards: 192,
    operations: "Addition · Subtraction · Multiplication · Division",
    url: completeAsset.url,
    filename: "math-uno-complete-deck.pdf",
    cover: deckCover.url,
    sample: deckSample.url,
  },
  {
    id: "fifa",
    name: "Math UNO — FIFA World Cup 2026",
    tagline: "96 cards · Premium exclusive edition",
    cards: 96,
    operations: "Addition + Subtraction · World Cup 2026 theme",
    url: fifaAsset.url,
    filename: "math-uno-fifa-world-cup-2026.pdf",
    cover: fifaCover.url,
    sample: fifaSample.url,
  },
  {
    id: "basketball",
    name: "Basketball Money Game",
    tagline: "39 printable pages · Manage. Invest. Win.",
    cards: 260,
    operations: "Budgeting · Percentages · Profit & Loss · Decision making",
    url: bmgAsset.url,
    filename: "basketball-money-game.pdf",
    cover: bmgCover.url,
    sample: bmgSample.url,
  },
];

export function downloadProduct(product: Product) {
  const a = document.createElement("a");
  a.href = product.url;
  a.download = product.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
