import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import confetti from "canvas-confetti";
import { OPERATIONS, OP_META, recordAnswer, awardBadge, type Operation } from "@/lib/store";
import { generateRound, type Question } from "@/lib/questions";
import { playWin } from "@/lib/sounds";
import { QuizCard } from "@/components/QuizCard";
import { BottomNav } from "@/components/BottomNav";
import { useRequireProfile } from "@/hooks/use-require-profile";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play on Screen — KidsMath Cards" },
      { name: "description", content: "Play math flashcard quizzes solo or multiplayer, no printer needed." },
    ],
  }),
  component: Play,
});

type Mode = "solo" | "duo";
type Phase = "pick-mode" | "pick-op" | "playing" | "done";

const ROUND_SIZE = 10;

function Play() {
  const { profile, ready } = useRequireProfile();
  const [mode, setMode] = useState<Mode>("solo");
  const [phase, setPhase] = useState<Phase>("pick-mode");
  const [op, setOp] = useState<Operation>("addition");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);

  if (!ready || !profile) {
    return <div className="flex min-h-screen items-center justify-center font-display text-2xl font-extrabold">Loading... 🦊</div>;
  }

  const start = (operation: Operation) => {
    setOp(operation);
    setQuestions(generateRound(operation, profile.level, ROUND_SIZE));
    setIndex(0);
    setScores([0, 0]);
    setPhase("playing");
  };

  const currentPlayer = mode === "duo" ? index % 2 : 0;
  const playerNames: [string, string] = [profile.name, "Player 2"];

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScores((s) => {
        const next: [number, number] = [...s];
        next[currentPlayer] += 1;
        return next;
      });
    }
    // only track the child's answers in solo, or player 1's answers in duo
    if (currentPlayer === 0) recordAnswer(op, correct);

    if (index + 1 >= questions.length) {
      setPhase("done");
      playWin();
      void confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      const soloScore = correct ? scores[0] + 1 : scores[0];
      if (mode === "solo" && soloScore === ROUND_SIZE) awardBadge("perfect-round");
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-6">
      <h1 className="mb-6 text-center font-display text-3xl font-extrabold text-primary">Play on Screen 🎮</h1>

      {phase === "pick-mode" && (
        <div className="space-y-4 animate-pop-in">
          <button
            onClick={() => {
              setMode("solo");
              setPhase("pick-op");
            }}
            className="btn-bounce shadow-pop w-full rounded-3xl border-4 border-border bg-card p-6 text-left"
          >
            <span className="text-4xl">🧒</span>
            <span className="mt-2 block font-display text-2xl font-extrabold">Solo Quest</span>
            <span className="text-base font-bold text-muted-foreground">Answer 10 cards on your own!</span>
          </button>
          <button
            onClick={() => {
              setMode("duo");
              setPhase("pick-op");
            }}
            className="btn-bounce shadow-pop w-full rounded-3xl border-4 border-border bg-card p-6 text-left"
          >
            <span className="text-4xl">👨‍👧</span>
            <span className="mt-2 block font-display text-2xl font-extrabold">2 Players</span>
            <span className="text-base font-bold text-muted-foreground">
              Take turns with a parent, sibling or friend!
            </span>
          </button>
        </div>
      )}

      {phase === "pick-op" && (
        <div className="animate-pop-in">
          <h2 className="mb-4 text-center font-display text-xl font-extrabold">Pick an operation!</h2>
          <div className="grid grid-cols-2 gap-3">
            {OPERATIONS.map((operation) => (
              <button
                key={operation}
                onClick={() => start(operation)}
                className={`btn-bounce shadow-pop rounded-3xl bg-${OP_META[operation].color} p-6 text-center`}
              >
                <span className="block font-display text-5xl font-extrabold text-primary-foreground">
                  {OP_META[operation].symbol}
                </span>
                <span className="mt-1 block font-display text-lg font-extrabold text-primary-foreground">
                  {OP_META[operation].label}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setPhase("pick-mode")}
            className="mt-6 w-full text-center font-display text-base font-bold text-muted-foreground underline"
          >
            ← Back
          </button>
        </div>
      )}

      {phase === "playing" && questions[index] && (
        <div>
          {mode === "duo" && (
            <div className="mb-4 flex justify-center gap-4">
              {playerNames.map((n, i) => (
                <div
                  key={n}
                  className={`rounded-2xl border-4 px-4 py-2 font-display text-sm font-extrabold ${
                    currentPlayer === i ? "border-primary bg-primary/10" : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {n}: {scores[i]} ⭐
                </div>
              ))}
            </div>
          )}
          <QuizCard
            question={questions[index]}
            index={index}
            total={questions.length}
            playerLabel={mode === "duo" ? playerNames[currentPlayer] : undefined}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {phase === "done" && (
        <div className="text-center animate-pop-in">
          <span className="text-7xl">🏆</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold">Round Complete!</h2>
          {mode === "solo" ? (
            <p className="mt-2 font-display text-2xl font-extrabold text-primary">
              {scores[0]} / {questions.length} correct!
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {playerNames.map((n, i) => (
                <p key={n} className="font-display text-xl font-extrabold">
                  {n}: {scores[i]} ⭐
                </p>
              ))}
              <p className="mt-2 font-display text-2xl font-extrabold text-primary">
                {scores[0] === scores[1]
                  ? "It's a tie! 🤝"
                  : `${playerNames[scores[0] > scores[1] ? 0 : 1]} wins! 🎉`}
              </p>
            </div>
          )}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => start(op)}
              className="btn-bounce shadow-pop w-full rounded-3xl bg-primary px-6 py-4 font-display text-lg font-extrabold text-primary-foreground"
            >
              Play Again 🔁
            </button>
            <button
              onClick={() => setPhase("pick-op")}
              className="btn-bounce shadow-pop w-full rounded-3xl border-4 border-border bg-card px-6 py-4 font-display text-lg font-extrabold"
            >
              Change Operation
            </button>
            <Link
              to="/progress"
              className="block w-full pt-2 text-center font-display text-base font-bold text-fun-purple underline"
            >
              See my progress ⭐
            </Link>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
