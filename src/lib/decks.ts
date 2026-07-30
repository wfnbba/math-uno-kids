import completeAsset from "@/assets/math-uno-complete.pdf.asset.json";
import fifaAsset from "@/assets/math-uno-fifa-2026-v3.pdf.asset.json";
import dollsBundle from "@/assets/paper-dolls-complete-bundle.pdf.asset.json";
import dollsRumi from "@/assets/paper-dolls-rumi.pdf.asset.json";
import dollsExtra from "@/assets/paper-dolls-extra-set.pdf.asset.json";
import dollsDark from "@/assets/paper-dolls-dark-skin-brown-hair.pdf.asset.json";
import dollsPhone from "@/assets/paper-dolls-iphone-craft.pdf.asset.json";
import deckSample from "@/assets/deck-sample.jpg.asset.json";
import fifaSample from "@/assets/fifa-sample.jpg.asset.json";
import cardMathUno from "@/assets/card-math-uno.jpg";
import cardFifa from "@/assets/card-fifa.jpg";
import cardPaperDolls from "@/assets/card-paper-dolls.jpg";

export type ProductId = "complete" | "fifa" | "paper-dolls";

export interface ProductFile {
  label: string;
  description: string;
  pages: number;
  url: string;
  filename: string;
}

export interface Product {
  id: ProductId;
  name: string;
  shortName: string;
  tagline: string;
  badge: string;
  accent: string; // tailwind bg-* token
  gradient: string;
  cards: number;
  operations: string;
  /** Main PDF (used by View / Download buttons) */
  url: string;
  filename: string;
  card: string;
  cover: string;
  sample: string;
  files: ProductFile[];
  print: string[];
  play: string[];
  hasScoreboard: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "complete",
    name: "Math UNO — Complete Deck",
    shortName: "Math UNO",
    tagline: "192 cards · All 4 operations in one deck",
    badge: "🃏 Core Deck",
    accent: "bg-fun-green",
    gradient: "from-fun-red via-fun-yellow to-fun-green",
    cards: 192,
    operations: "Addition · Subtraction · Multiplication · Division",
    url: completeAsset.url,
    filename: "math-uno-complete-deck.pdf",
    card: cardMathUno,
    cover: cardMathUno,
    sample: deckSample.url,
    files: [
      {
        label: "Complete Deck — 192 cards",
        description: "All four operations, card backs and the storage box template.",
        pages: 96,
        url: completeAsset.url,
        filename: "math-uno-complete-deck.pdf",
      },
    ],
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
    hasScoreboard: true,
  },
  {
    id: "fifa",
    name: "Math UNO — FIFA World Cup 2026",
    shortName: "World Cup 2026",
    tagline: "96 cards · Premium exclusive edition",
    badge: "⭐ Premium Edition",
    accent: "bg-fun-blue",
    gradient: "from-fun-blue via-fun-purple to-fun-red",
    cards: 96,
    operations: "Addition + Subtraction · World Cup 2026 theme",
    url: fifaAsset.url,
    filename: "math-uno-fifa-world-cup-2026.pdf",
    card: cardFifa,
    cover: cardFifa,
    sample: fifaSample.url,
    files: [
      {
        label: "World Cup 2026 Deck — 96 cards",
        description: "Addition + subtraction cards, team wilds and the themed box template.",
        pages: 48,
        url: fifaAsset.url,
        filename: "math-uno-fifa-world-cup-2026.pdf",
      },
    ],
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
    hasScoreboard: true,
  },
  {
    id: "paper-dolls",
    name: "Paper Dolls Craft Kit",
    shortName: "Paper Dolls",
    tagline: "+250 paper dolls to print, cut & play",
    badge: "🎀 New Release",
    accent: "bg-fun-pink",
    gradient: "from-fun-pink via-fun-purple to-fun-red",
    cards: 250,
    operations: "Dolls · Outfits · Accessories · Dollhouse",
    url: dollsBundle.url,
    filename: "paper-dolls-complete-bundle.pdf",
    card: cardPaperDolls,
    cover: cardPaperDolls,
    sample: cardPaperDolls,
    files: [
      {
        label: "Complete Bundle — 20 sheets",
        description: "Dolls with hair, dresses, shoes and accessories in every color theme.",
        pages: 20,
        url: dollsBundle.url,
        filename: "paper-dolls-complete-bundle.pdf",
      },
      {
        label: "Bonus: Rumi Set",
        description: "7 extra sheets with a full outfit collection.",
        pages: 7,
        url: dollsRumi.url,
        filename: "paper-dolls-rumi.pdf",
      },
      {
        label: "Bonus: Extra Doll Set",
        description: "6 more sheets of dolls and wardrobe pieces.",
        pages: 6,
        url: dollsExtra.url,
        filename: "paper-dolls-extra-set.pdf",
      },
      {
        label: "Bonus: Dark Skin · Brown Hair Set",
        description: "8 sheets so every kid finds a doll that looks like her.",
        pages: 8,
        url: dollsDark.url,
        filename: "paper-dolls-dark-skin-brown-hair.pdf",
      },
      {
        label: "Bonus: Paper Phone Craft",
        description: "5 sheets to build a cute paper phone for the dolls.",
        pages: 5,
        url: dollsPhone.url,
        filename: "paper-dolls-iphone-craft.pdf",
      },
    ],
    print: [
      "White cardstock 180–250 gsm keeps the dolls sturdy.",
      "A4 or US Letter at 100% scale — turn OFF “Fit to page”.",
      "Print in color, high quality mode for soft pastel tones.",
      "Cut around the outlines with a grown-up — small scissors help.",
      "Do NOT laminate the dolls: tabs need to bend to hold outfits.",
    ],
    play: [
      "Print the doll sheets first, then the outfit sheets.",
      "Cut each doll and fold the little base tab so she stands up.",
      "Cut the dresses keeping the white tabs — they fold over the shoulders.",
      "Mix hair, dresses, shoes and accessories to create new looks.",
      "Build the dollhouse pages and set up rooms for playtime.",
      "Store everything in an envelope or zip bag between plays.",
    ],
    hasScoreboard: false,
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function downloadUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadProduct(product: Product) {
  downloadUrl(product.url, product.filename);
}
