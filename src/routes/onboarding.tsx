import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import confetti from "canvas-confetti";
import mascot from "@/assets/mascot.png";
import { saveProfile, applyTheme, themeForGender, getProfile, type Profile, type Gender } from "@/lib/store";
import { playWin } from "@/lib/sounds";
import { InstallButton } from "@/components/InstallButton";
import { useInstallPrompt } from "@/hooks/use-install-prompt";


export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — Kids Math Uno" },
      { name: "description", content: "Set up your child's profile: pick a hero, name, level and favorite theme." },
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

const STEPS = 6;

function Onboarding() {
  const navigate = useNavigate();
  const existing = typeof window !== "undefined" ? getProfile() : null;
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Gender | null>(existing?.gender ?? null);
  const [name, setName] = useState(existing?.name ?? "");
  const [level, setLevel] = useState<1 | 2 | 3>(existing?.level ?? 1);
  const [topic, setTopic] = useState(existing?.topic ?? "dinosaurs");
  const { canInstall, install } = useInstallPrompt();

  const pickGender = (g: Gender) => {
    setGender(g);
    applyTheme(themeForGender(g));
    setTimeout(() => setStep(2), 250);
  };

  const finish = () => {
    if (!gender) return;
    const theme = themeForGender(gender);
    const profile: Profile = {
      name: name.trim() || (gender === "boy" ? "Hero" : "Star"),
      gender,
      level,
      topic,
      theme,
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    playWin();
    void confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
    setStep(5);
  };


  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      <div className="mb-8 flex justify-center gap-2">
        {Array.from({ length: STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-3 rounded-full transition-all ${i === step ? "w-8 bg-primary" : "w-3 bg-border"}`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-pop-in">
          <img src={mascot} alt="Friendly fox mascot" width={768} height={768} className="mb-6 h-48 w-48 animate-bounce-soft" />
          <h1 className="font-display text-4xl font-extrabold text-primary">Welcome to Kids Math Uno!</h1>
          <p className="mt-3 text-lg font-bold text-muted-foreground">
            Print & play card decks, fun quizzes and a math adventure road just for you!
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
          <h1 className="text-center font-display text-3xl font-extrabold">Are you a...</h1>
          <p className="mt-1 text-center text-base font-bold text-muted-foreground">
            We'll pick colors made just for you!
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => pickGender("boy")}
              className={`btn-bounce shadow-pop rounded-3xl border-4 p-6 text-center ${
                gender === "boy" ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              <span className="text-6xl">👦</span>
              <span className="mt-3 block font-display text-2xl font-extrabold">Boy</span>
              <span className="mt-2 flex justify-center gap-1">
                <span className="h-4 w-4 rounded-full bg-fun-blue" />
                <span className="h-4 w-4 rounded-full bg-fun-green" />
                <span className="h-4 w-4 rounded-full bg-fun-orange" />
              </span>
            </button>
            <button
              onClick={() => pickGender("girl")}
              className={`btn-bounce shadow-pop rounded-3xl border-4 p-6 text-center ${
                gender === "girl" ? "border-primary bg-primary/10" : "border-border bg-card"
              }`}
            >
              <span className="text-6xl">👧</span>
              <span className="mt-3 block font-display text-2xl font-extrabold">Girl</span>
              <span className="mt-2 flex justify-center gap-1">
                <span className="h-4 w-4 rounded-full bg-fun-pink" />
                <span className="h-4 w-4 rounded-full bg-fun-purple" />
                <span className="h-4 w-4 rounded-full bg-fun-yellow" />
              </span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
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
            onClick={() => setStep(3)}
            disabled={!name.trim()}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-primary px-6 py-5 font-display text-xl font-extrabold text-primary-foreground disabled:opacity-40"
          >
            Next ➡️
          </button>
        </div>
      )}

      {step === 3 && (
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
            onClick={() => setStep(4)}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-primary px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
          >
            Next ➡️
          </button>
        </div>
      )}

      {step === 4 && (
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
            onClick={finish}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-fun-green px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
          >
            All Done! 🎉
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-1 flex-col justify-center text-center animate-pop-in">
          <span className="text-6xl">📲</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Install the App!</h1>
          <p className="mt-2 text-base font-bold text-muted-foreground">
            Tap the button below to install Kids Math Uno on your phone — play anytime, even offline!
          </p>
          <button
            onClick={async () => {
              await install();
              void navigate({ to: "/" });
            }}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-fun-green px-6 py-6 font-display text-2xl font-extrabold text-primary-foreground"
          >
            📲 Install App Now
          </button>
          {!canInstall && (
            <p className="mt-4 text-sm font-bold text-muted-foreground">
              Not seeing the prompt? Open your browser menu and tap "Add to Home Screen".
            </p>
          )}
          <button
            onClick={() => void navigate({ to: "/" })}
            className="mt-4 w-full rounded-3xl px-6 py-3 font-display text-base font-bold text-muted-foreground underline"
          >
            Skip for now →
          </button>
        </div>
      )}
    </div>
  );

}
