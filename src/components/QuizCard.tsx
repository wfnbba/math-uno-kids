import { OP_META, type Operation } from "@/lib/store";
import type { Question } from "@/lib/questions";
import { playDing, playBuzz } from "@/lib/sounds";
import { useState } from "react";

interface Props {
  question: Question;
  index: number;
  total: number;
  playerLabel?: string;
  onAnswer: (correct: boolean) => void;
}

export function QuizCard({ question, index, total, playerLabel, onAnswer }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const meta = OP_META[question.op as Operation];

  const pick = (choice: number) => {
    if (picked !== null) return;
    setPicked(choice);
    const correct = choice === question.answer;
    if (correct) playDing();
    else playBuzz();
    setTimeout(() => {
      setPicked(null);
      onAnswer(correct);
    }, 900);
  };

  return (
    <div key={question.prompt} className="animate-pop-in">
      {playerLabel && (
        <p className="mb-2 text-center font-display text-lg font-bold text-fun-purple">{playerLabel}'s turn!</p>
      )}
      <p className="mb-3 text-center font-display text-sm font-bold text-muted-foreground">
        Question {index + 1} of {total}
      </p>
      <div className={`shadow-pop mx-auto mb-6 flex aspect-[4/3] max-w-xs flex-col items-center justify-center rounded-3xl bg-${meta.color} p-6`}>
        <span className="font-display text-lg font-bold text-primary-foreground/80">{meta.label}</span>
        <span className="font-display text-6xl font-bold text-primary-foreground">{question.prompt}</span>
        <span className="mt-2 font-display text-3xl font-bold text-primary-foreground">= ?</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => {
          let cls = "bg-card text-foreground";
          if (picked !== null) {
            if (choice === question.answer) cls = "bg-fun-green text-primary-foreground";
            else if (choice === picked) cls = "bg-fun-red text-primary-foreground";
          }
          return (
            <button
              key={choice}
              onClick={() => pick(choice)}
              className={`btn-bounce shadow-pop rounded-3xl border-4 border-border py-5 font-display text-3xl font-bold transition-colors ${cls}`}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
