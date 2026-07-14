import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import confetti from "canvas-confetti";
import { useMutation } from "@tanstack/react-query";
import { OPERATIONS, OP_META, recordAnswer, awardBadge, type Operation } from "@/lib/store";
import { generateStoryProblems } from "@/lib/story.functions";
import { playDing, playBuzz, playWin } from "@/lib/sounds";
import { BottomNav } from "@/components/BottomNav";
import { useRequireProfile } from "@/hooks/use-require-profile";
import { ProfileRedirectFallback } from "@/components/ProfileRedirectFallback";
import mascot from "@/assets/mascot.png";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Story Problems — KidsMath Cards" },
      { name: "description", content: "AI math story problems starring your child and their favorite theme." },
    ],
  }),
  component: Story,
});

interface Problem {
  story: string;
  answer: number;
  choices: number[];
}

function Story() {
  const { profile, ready, needsProfile } = useRequireProfile();
  const [op, setOp] = useState<Operation>("addition");
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("No profile");
      return generateStoryProblems({
        data: { name: profile.name, topic: profile.topic, operation: op, level: profile.level },
      });
    },
    onSuccess: (data) => {
      setProblems(data.problems);
      setIndex(0);
      setScore(0);
      setDone(false);
      setPicked(null);
    },
  });

  if (!ready && !needsProfile) {
    return <div className="flex min-h-screen items-center justify-center font-display text-2xl font-extrabold">Loading... 🦊</div>;
  }

  if (needsProfile || !profile) return <ProfileRedirectFallback />;

  const current = problems?.[index];

  const pick = (choice: number) => {
    if (!current || picked !== null) return;
    setPicked(choice);
    const correct = choice === current.answer;
    if (correct) {
      playDing();
      setScore((s) => s + 1);
    } else {
      playBuzz();
    }
    recordAnswer(op, correct);
    awardBadge("storyteller");
    setTimeout(() => {
      setPicked(null);
      if (index + 1 >= (problems?.length ?? 0)) {
        setDone(true);
        playWin();
        void confetti({ particleCount: 130, spread: 90, origin: { y: 0.6 } });
      } else {
        setIndex((i) => i + 1);
      }
    }, 1200);
  };

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
      <h1 className="mb-2 text-center font-display text-3xl font-extrabold text-primary">Story Problems 📚</h1>
      <p className="mb-6 text-center text-base font-bold text-muted-foreground">
        Magic math stories starring <span className="capitalize text-foreground">{profile.name}</span> and{" "}
        <span className="text-foreground">{profile.topic}</span>!
      </p>

      {!problems && !mutation.isPending && (
        <div className="animate-pop-in">
          <h2 className="mb-4 text-center font-display text-xl font-extrabold">Pick an operation!</h2>
          <div className="grid grid-cols-2 gap-3">
            {OPERATIONS.map((operation) => (
              <button
                key={operation}
                onClick={() => setOp(operation)}
                className={`btn-bounce shadow-pop rounded-3xl border-4 p-5 text-center ${
                  op === operation ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <span className="block font-display text-4xl font-extrabold">{OP_META[operation].symbol}</span>
                <span className="mt-1 block font-display text-base font-extrabold">{OP_META[operation].label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => mutation.mutate()}
            className="btn-bounce shadow-pop mt-6 w-full rounded-3xl bg-fun-purple px-6 py-5 font-display text-xl font-extrabold text-primary-foreground"
          >
            ✨ Create My Stories!
          </button>
          {mutation.isError && (
            <p className="mt-4 text-center text-sm font-bold text-destructive">
              Oops! The story machine hiccuped. Please try again!
            </p>
          )}
        </div>
      )}

      {mutation.isPending && (
        <div className="flex flex-col items-center py-12 text-center animate-pop-in">
          <img src={mascot} alt="Fox mascot writing stories" width={768} height={768} loading="lazy" className="h-32 w-32 animate-wiggle" />
          <p className="mt-4 font-display text-xl font-extrabold">Writing your {profile.topic} stories... ✍️</p>
        </div>
      )}

      {current && !done && (
        <div key={index} className="animate-pop-in">
          <p className="mb-3 text-center font-display text-sm font-bold text-muted-foreground">
            Story {index + 1} of {problems.length}
          </p>
          <div className="shadow-pop mb-6 rounded-3xl border-4 border-border bg-card p-6">
            <p className="text-lg font-bold leading-relaxed">{current.story}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {current.choices.map((choice, i) => {
              let cls = "bg-card text-foreground";
              if (picked !== null) {
                if (choice === current.answer) cls = "bg-fun-green text-primary-foreground";
                else if (choice === picked) cls = "bg-fun-red text-primary-foreground";
              }
              return (
                <button
                  key={`${i}-${choice}`}
                  onClick={() => pick(choice)}
                  className={`btn-bounce shadow-pop rounded-3xl border-4 border-border py-5 font-display text-3xl font-extrabold transition-colors ${cls}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {done && (
        <div className="text-center animate-pop-in">
          <span className="text-7xl">🌟</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold">Story Time Complete!</h2>
          <p className="mt-2 font-display text-2xl font-extrabold text-primary">
            {score} / {problems?.length} correct!
          </p>
          <button
            onClick={() => {
              setProblems(null);
              setDone(false);
            }}
            className="btn-bounce shadow-pop mt-8 w-full rounded-3xl bg-fun-purple px-6 py-4 font-display text-lg font-extrabold text-primary-foreground"
          >
            ✨ New Stories!
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
