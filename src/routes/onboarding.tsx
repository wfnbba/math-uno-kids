import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import confetti from "canvas-confetti";
import mascot from "@/assets/mascot.png";
import { saveProfile, applyTheme, type Profile } from "@/lib/store";
import { playWin } from "@/lib/sounds";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — KidsMath Cards" },
      { name: "description", content: "Set up your child's profile: name, level and favorite theme." },
    ],
  }),
  component: Onboarding,
});

const LEVELS = [
  { value: 1 as const, label: "Little Explorer", desc: "Ages 5-6 · numbers up to 10", emoji: "🐣" },
  { value: 2 as const, label: "Junior Master", desc: "Ages 7-8 · numbers up to 20", emoji: "🦊" },
  { value: 3 as const, label: "Math Hero", desc: "Ages 9-10 · big numbers!", emoji: "🦸" },
];

const TOPICS = [
  { value: "dinosaurs", emoji: "🦖" },
  { value: "princesses", emoji: "👑" },
  { value: "soccer", emoji: "⚽" },
  { value: "space", emoji: "🚀" },
  { value: "animals", emoji: "🐶" },
  { value: "superheroes", emoji: "🦸" },
];

const THEMES = [
  { value: "", label: "Sunny", swatch: "bg-fun-orange" },
  { value: "theme-ocean", label: "Ocean", swatch: "bg-fun-blue" },
  { value: "theme-candy", label: "Candy", swatch: "bg-fun-pink" },
  { value: "theme-jungle", label: "Jungle", swatch: "bg-fun-green" },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [topic, setTopic] = useState("dinosaurs");
  const [theme, setTheme] = useState("");

  const finish = () => {
    const profile: Profile = { name: name.trim(), level, topic, theme, createdAt: new Date().toISOString() };
    saveProfile(profile);
    playWin();
    void confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => void navigate({ to: "/" }), 900);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      {/* Progress dots */}
      <div className="mb-8 flex justify-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-3 rounded-full transition-all ${i === step ? "w-8 bg-primary" : "w-3 bg-border"}`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
          <img src={mascot} alt="Friendly fox mascot" width={768} height={768} className="mb-6 h-48 w-48 animate-bounce-soft" />
          <h1 className="font-display text-4xl font-extrabold text-primary">Welcome to KidsMath Cards!</h1>
          <p className="mt-3 text-lg font-bold text-muted-foreground">
            Print & play card decks, fun quizzes and math adventures made just for you!
          </p>
          <button
            onClick={() => setStep(1)}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-primary px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
          >
            Let's Go! 🚀
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col justify-center animate-pop-in">
          <h1 className="text-center font-display text-3xl font-extrabold">What's your name?</h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name..."
            maxLength={30}
            className="shadow-pop mt-6 w-full rounded-3xl border-4 border-border bg-card px-6 py-5 text-center font-display text-2xl font-extrabold outline-none focus:border-primary"
          />
          <button
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-primary px-6 py-5 font-display text-xl font-extrabold text-primary-foreground disabled:opacity-40"
          >
            Next ➡️
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col justify-center animate-pop-in">
          <h1 className="text-center font-display text-3xl font-extrabold">Pick your level!</h1>
          <div className="mt-6 space-y-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`btn-bounce shadow-pop flex w-full items-center gap-4 rounded-3xl border-4 p-4 text-left ${
                  level === l.value ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span className="text-4xl">{l.emoji}</span>
                <span>
                  <span className="block font-display text-xl font-extrabold">{l.label}</span>
                  <span className="text-sm font-bold text-muted-foreground">{l.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-primary px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
          >
            Next ➡️
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-1 flex-col justify-center animate-pop-in">
          <h1 className="text-center font-display text-3xl font-extrabold">What do you love?</h1>
          <p className="mt-1 text-center text-base font-bold text-muted-foreground">
            We'll make math stories about it!
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {TOPICS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTopic(t.value)}
                className={`btn-bounce shadow-pop rounded-3xl border-4 p-4 text-center ${
                  topic === t.value ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span className="block text-4xl">{t.emoji}</span>
                <span className="mt-1 block font-display text-lg font-extrabold capitalize">{t.value}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(4)}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-primary px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
          >
            Next ➡️
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-1 flex-col justify-center animate-pop-in">
          <h1 className="text-center font-display text-3xl font-extrabold">Pick your colors!</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setTheme(t.value);
                  applyTheme(t.value);
                }}
                className={`btn-bounce shadow-pop rounded-3xl border-4 p-5 text-center ${
                  theme === t.value ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span className={`mx-auto block h-12 w-12 rounded-full ${t.swatch}`} />
                <span className="mt-2 block font-display text-lg font-extrabold">{t.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={finish}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-fun-green px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
          >
            All Done! 🎉
          </button>
        </div>
      )}
    </div>
  );
}
