export type Operation = "addition" | "subtraction" | "multiplication" | "division";

export const OPERATIONS: Operation[] = ["addition", "subtraction", "multiplication", "division"];

export const OP_META: Record<Operation, { label: string; symbol: string; color: string; emoji: string }> = {
  addition: { label: "Addition", symbol: "+", color: "fun-green", emoji: "➕" },
  subtraction: { label: "Subtraction", symbol: "−", color: "fun-blue", emoji: "➖" },
  multiplication: { label: "Multiplication", symbol: "×", color: "fun-orange", emoji: "✖️" },
  division: { label: "Division", symbol: "÷", color: "fun-purple", emoji: "➗" },
};

export interface Profile {
  name: string;
  level: 1 | 2 | 3;
  topic: string;
  theme: string; // "" | "theme-ocean" | "theme-candy" | "theme-jungle"
  createdAt: string;
}

export interface OpStat {
  total: number;
  correct: number;
}

export type Stats = Record<Operation, OpStat>;

export interface DayEntry {
  total: number;
  correct: number;
  byOp: Partial<Record<Operation, OpStat>>;
}

export type DayLog = Record<string, DayEntry>;

const PROFILE_KEY = "kmc_profile";
const STATS_KEY = "kmc_stats";
const DAYS_KEY = "kmc_days";
const BADGES_KEY = "kmc_badges";

const emptyStats = (): Stats => ({
  addition: { total: 0, correct: 0 },
  subtraction: { total: 0, correct: 0 },
  multiplication: { total: 0, correct: 0 },
  division: { total: 0, correct: 0 },
});

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): Profile | null {
  return read<Profile | null>(PROFILE_KEY, null);
}

export function saveProfile(profile: Profile) {
  write(PROFILE_KEY, profile);
  applyTheme(profile.theme);
}

export function applyTheme(theme: string) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("theme-ocean", "theme-candy", "theme-jungle");
  if (theme) document.documentElement.classList.add(theme);
}

export function getStats(): Stats {
  return { ...emptyStats(), ...read<Partial<Stats>>(STATS_KEY, {}) };
}

export function getDayLog(): DayLog {
  return read<DayLog>(DAYS_KEY, {});
}

export function getBadges(): string[] {
  return read<string[]>(BADGES_KEY, []);
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function recordAnswer(op: Operation, correct: boolean): string[] {
  const stats = getStats();
  stats[op].total += 1;
  if (correct) stats[op].correct += 1;
  write(STATS_KEY, stats);

  const days = getDayLog();
  const key = todayKey();
  const entry: DayEntry = days[key] ?? { total: 0, correct: 0, byOp: {} };
  entry.total += 1;
  if (correct) entry.correct += 1;
  const opEntry = entry.byOp[op] ?? { total: 0, correct: 0 };
  opEntry.total += 1;
  if (correct) opEntry.correct += 1;
  entry.byOp[op] = opEntry;
  days[key] = entry;
  write(DAYS_KEY, days);

  return checkBadges(stats);
}

export function getStreak(): number {
  const days = getDayLog();
  let streak = 0;
  const d = new Date();
  // today counts if played, otherwise start from yesterday
  const fmt = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (!days[fmt(d)]) d.setDate(d.getDate() - 1);
  while (days[fmt(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: "first-steps", name: "First Steps", emoji: "🌟", description: "Answer your first question" },
  { id: "adder-ace", name: "Adder Ace", emoji: "➕", description: "20 correct additions" },
  { id: "minus-master", name: "Minus Master", emoji: "➖", description: "20 correct subtractions" },
  { id: "times-titan", name: "Times Titan", emoji: "✖️", description: "20 correct multiplications" },
  { id: "division-dynamo", name: "Division Dynamo", emoji: "➗", description: "20 correct divisions" },
  { id: "perfect-round", name: "Perfect Round", emoji: "💯", description: "Score 10/10 in a round" },
  { id: "hot-streak", name: "Hot Streak", emoji: "🔥", description: "Play 3 days in a row" },
  { id: "super-streak", name: "Super Streak", emoji: "🚀", description: "Play 5 days in a row" },
  { id: "storyteller", name: "Storyteller", emoji: "📚", description: "Solve a story problem" },
];

export function awardBadge(id: string): boolean {
  const badges = getBadges();
  if (badges.includes(id)) return false;
  badges.push(id);
  write(BADGES_KEY, badges);
  return true;
}

function checkBadges(stats: Stats): string[] {
  const earned: string[] = [];
  const totalAnswered = OPERATIONS.reduce((s, op) => s + stats[op].total, 0);
  if (totalAnswered >= 1 && awardBadge("first-steps")) earned.push("first-steps");
  if (stats.addition.correct >= 20 && awardBadge("adder-ace")) earned.push("adder-ace");
  if (stats.subtraction.correct >= 20 && awardBadge("minus-master")) earned.push("minus-master");
  if (stats.multiplication.correct >= 20 && awardBadge("times-titan")) earned.push("times-titan");
  if (stats.division.correct >= 20 && awardBadge("division-dynamo")) earned.push("division-dynamo");
  const streak = getStreak();
  if (streak >= 3 && awardBadge("hot-streak")) earned.push("hot-streak");
  if (streak >= 5 && awardBadge("super-streak")) earned.push("super-streak");
  return earned;
}
