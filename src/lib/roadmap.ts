import type { Operation } from "./store";

export type MiniGameKind =
  | "count" // count emojis, addition/subtraction
  | "group" // multiplication as groups of emojis
  | "share" // division as sharing items into buckets
  | "compare" // <, >, =
  | "sequence" // what comes next
  | "quick-tap" // timed rapid fire
  | "catch" // falling number "flappy" style — tap correct answer
  | "memory" // match equation to answer
  | "boss"; // mixed rapid fire boss

export interface Phase {
  id: number;
  name: string;
  emoji: string;
  color: string; // fun-* token
  kind: MiniGameKind;
  op?: Operation;
  theme?: string; // e.g. "fruits", "animals", "stars"
  rounds: number;
  desc: string;
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: "Fruit Counting",
    emoji: "🍎",
    color: "fun-red",
    kind: "count",
    op: "addition",
    theme: "fruits",
    rounds: 5,
    desc: "Count the yummy fruits!",
  },
  {
    id: 2,
    name: "Animal Groups",
    emoji: "🐶",
    color: "fun-orange",
    kind: "group",
    op: "multiplication",
    theme: "animals",
    rounds: 5,
    desc: "Groups of adorable animals!",
  },
  {
    id: 3,
    name: "Balloon Pop",
    emoji: "🎈",
    color: "fun-pink",
    kind: "count",
    op: "subtraction",
    theme: "balloons",
    rounds: 5,
    desc: "How many balloons are left?",
  },
  {
    id: 4,
    name: "Cookie Share",
    emoji: "🍪",
    color: "fun-yellow",
    kind: "share",
    op: "division",
    theme: "cookies",
    rounds: 5,
    desc: "Share the cookies fairly!",
  },
  {
    id: 5,
    name: "Bigger or Smaller?",
    emoji: "🐘",
    color: "fun-green",
    kind: "compare",
    rounds: 6,
    desc: "Which side is bigger?",
  },
  {
    id: 6,
    name: "Number Path",
    emoji: "🐾",
    color: "fun-blue",
    kind: "sequence",
    rounds: 5,
    desc: "What number comes next?",
  },
  {
    id: 7,
    name: "Quick Tap!",
    emoji: "⚡",
    color: "fun-purple",
    kind: "quick-tap",
    rounds: 8,
    desc: "Beat the clock — 30 seconds!",
  },
  {
    id: 8,
    name: "Bug Catch",
    emoji: "🐞",
    color: "fun-green",
    kind: "catch",
    op: "addition",
    rounds: 6,
    desc: "Catch the correct answers as they fall!",
  },
  {
    id: 9,
    name: "Memory Match",
    emoji: "🧠",
    color: "fun-orange",
    kind: "memory",
    rounds: 4,
    desc: "Match equations to answers!",
  },
  {
    id: 10,
    name: "Boss Battle",
    emoji: "👑",
    color: "fun-red",
    kind: "boss",
    rounds: 10,
    desc: "Face the Math King — mixed rapid fire!",
  },
];

export const THEME_EMOJIS: Record<string, string[]> = {
  fruits: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉"],
  animals: ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼"],
  balloons: ["🎈"],
  cookies: ["🍪"],
  stars: ["⭐"],
};

export function pickThemeEmoji(theme?: string): string {
  const arr = THEME_EMOJIS[theme ?? ""] ?? ["⭐"];
  return arr[Math.floor(Math.random() * arr.length)];
}
