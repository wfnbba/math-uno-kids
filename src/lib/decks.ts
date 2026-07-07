import additionAsset from "@/assets/addition.pdf.asset.json";
import subtractionAsset from "@/assets/subtraction.pdf.asset.json";
import multiplicationAsset from "@/assets/multiplication.pdf.asset.json";
import divisionAsset from "@/assets/division.pdf.asset.json";
import type { Operation } from "./store";

export interface Deck {
  op: Operation;
  name: string;
  symbol: string;
  url: string;
  filename: string;
  bg: string;
}

export const DECKS: Deck[] = [
  {
    op: "addition",
    name: "Addition",
    symbol: "+",
    url: additionAsset.url,
    filename: "math-cards-addition.pdf",
    bg: "bg-fun-green",
  },
  {
    op: "subtraction",
    name: "Subtraction",
    symbol: "−",
    url: subtractionAsset.url,
    filename: "math-cards-subtraction.pdf",
    bg: "bg-fun-blue",
  },
  {
    op: "multiplication",
    name: "Multiplication",
    symbol: "×",
    url: multiplicationAsset.url,
    filename: "math-cards-multiplication.pdf",
    bg: "bg-fun-orange",
  },
  {
    op: "division",
    name: "Division",
    symbol: "÷",
    url: divisionAsset.url,
    filename: "math-cards-division.pdf",
    bg: "bg-fun-purple",
  },
];

export function downloadDeck(deck: Deck) {
  const a = document.createElement("a");
  a.href = deck.url;
  a.download = deck.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadAll() {
  DECKS.forEach((deck, i) => {
    setTimeout(() => downloadDeck(deck), i * 600);
  });
}
