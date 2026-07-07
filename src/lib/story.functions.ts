import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const StoryInput = z.object({
  name: z.string().min(1).max(40),
  topic: z.string().min(1).max(60),
  operation: z.enum(["addition", "subtraction", "multiplication", "division"]),
  level: z.number().int().min(1).max(3),
});

const LooseProblems = z.object({
  problems: z
    .array(
      z.object({
        story: z.string().min(1),
        answer: z.number(),
        choices: z.array(z.number()).optional(),
      }),
    )
    .min(1),
});

function fixChoices(answer: number, choices: number[] | undefined): number[] {
  const set = new Set<number>((choices ?? []).filter((c) => Number.isFinite(c) && c >= 0));
  set.add(answer);
  let delta = 1;
  while (set.size < 4) {
    const candidate = answer + delta;
    if (candidate >= 0) set.add(candidate);
    const candidate2 = answer - delta;
    if (set.size < 4 && candidate2 >= 0) set.add(candidate2);
    delta += 2;
  }
  const arr = [...set].slice(0, 4);
  if (!arr.includes(answer)) arr[0] = answer;
  // shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const generateStoryProblems = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => StoryInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const levelDesc =
      data.level === 1
        ? "very easy, numbers up to 10"
        : data.level === 2
          ? "easy, numbers up to 20 (times tables up to 9)"
          : "medium, numbers up to 100 (times tables up to 12)";

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt: `You write fun math story problems for young children.

Create exactly 3 short ${data.operation} story problems for a child named ${data.name} who LOVES ${data.topic}.

Rules:
- Each story is 1-2 short, playful sentences starring ${data.name} and themed around ${data.topic}.
- Difficulty: ${levelDesc}.
- End each story with a clear question.
- "answer" is the correct numeric answer.
- "choices" contains exactly 4 numbers: the correct answer plus 3 plausible wrong answers, in random order, all >= 0.
- Simple English a 6-10 year old can read.

Respond with ONLY valid JSON, no markdown fences, in exactly this shape:
{"problems":[{"story":"...","answer":12,"choices":[10,12,14,9]},{"story":"...","answer":5,"choices":[5,6,4,8]},{"story":"...","answer":7,"choices":[7,9,3,6]}]}`,
    });

    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("AI response was not JSON");

    const parsed = LooseProblems.parse(JSON.parse(cleaned.slice(start, end + 1)));

    return {
      problems: parsed.problems.slice(0, 3).map((problem) => ({
        story: problem.story,
        answer: problem.answer,
        choices: fixChoices(problem.answer, problem.choices),
      })),
    };
  });
