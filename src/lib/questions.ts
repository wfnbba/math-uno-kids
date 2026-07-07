import type { Operation } from "./store";

export interface Question {
  prompt: string;
  answer: number;
  choices: number[];
  op: Operation;
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeChoices(answer: number): number[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard < 50) {
    guard++;
    const delta = rand(1, Math.max(3, Math.round(Math.abs(answer) * 0.3) + 2));
    const candidate = Math.random() < 0.5 ? answer - delta : answer + delta;
    if (candidate >= 0) set.add(candidate);
  }
  while (set.size < 4) set.add(answer + set.size * 2 + 1);
  return shuffle([...set]);
}

export function generateQuestion(op: Operation, level: 1 | 2 | 3): Question {
  let a = 0;
  let b = 0;
  let answer = 0;
  let symbol = "+";

  if (op === "addition") {
    const max = level === 1 ? 10 : level === 2 ? 20 : 99;
    a = rand(1, max);
    b = rand(1, max);
    answer = a + b;
    symbol = "+";
  } else if (op === "subtraction") {
    const max = level === 1 ? 10 : level === 2 ? 20 : 99;
    a = rand(2, max);
    b = rand(1, a);
    answer = a - b;
    symbol = "−";
  } else if (op === "multiplication") {
    const max = level === 1 ? 5 : level === 2 ? 9 : 12;
    a = rand(2, max);
    b = rand(2, max);
    answer = a * b;
    symbol = "×";
  } else {
    const max = level === 1 ? 5 : level === 2 ? 9 : 12;
    b = rand(2, max);
    answer = rand(2, max);
    a = b * answer;
    symbol = "÷";
  }

  return { prompt: `${a} ${symbol} ${b}`, answer, choices: makeChoices(answer), op };
}

export function generateRound(op: Operation, level: 1 | 2 | 3, count: number): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (questions.length < count && guard < count * 20) {
    guard++;
    const q = generateQuestion(op, level);
    if (seen.has(q.prompt)) continue;
    seen.add(q.prompt);
    questions.push(q);
  }
  return questions;
}
