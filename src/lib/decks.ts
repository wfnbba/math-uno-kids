import additionAsset from "@/assets/addition.pdf.asset.json";
import subtractionAsset from "@/assets/subtraction.pdf.asset.json";
import multiplicationAsset from "@/assets/multiplication.pdf.asset.json";
import divisionAsset from "@/assets/division.pdf.asset.json";
import boxAddition from "@/assets/box-addition.jpg";
import boxSubtraction from "@/assets/box-subtraction.jpg";
import boxMultiplication from "@/assets/box-multiplication.jpg";
import boxDivision from "@/assets/box-division.jpg";
import type { Operation } from "./store";

export interface Deck {
  op: Operation;
  name: string;
  symbol: string;
  url: string;
  filename: string;
  bg: string;
  image: string;
  tagline: string;
}

export const DECKS: Deck[] = [
  {
    op: "addition",
    name: "Addition",
    symbol: "+",
    url: additionAsset.url,
    filename: "math-cards-addition.pdf",
    bg: "bg-fun-red",
    image: boxAddition,
    tagline: "Add it up!",
  },
  {
    op: "subtraction",
    name: "Subtraction",
    symbol: "−",
    url: subtractionAsset.url,
    filename: "math-cards-subtraction.pdf",
    bg: "bg-fun-blue",
    image: boxSubtraction,
    tagline: "Take it away!",
  },
  {
    op: "multiplication",
    name: "Multiplication",
    symbol: "×",
    url: multiplicationAsset.url,
    filename: "math-cards-multiplication.pdf",
    bg: "bg-fun-yellow",
    image: boxMultiplication,
    tagline: "Times to shine!",
  },
  {
    op: "division",
    name: "Division",
    symbol: "÷",
    url: divisionAsset.url,
    filename: "math-cards-division.pdf",
    bg: "bg-fun-green",
    image: boxDivision,
    tagline: "Share it fair!",
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
