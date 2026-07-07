import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

const StoryInput = z.object({
  name: z.string().min(1).max(40),
  topic: z.string().min(1).max(60),
  operation: z.enum(["addition", "subtraction", "multiplication", "division"]),
  level: z.number().int().min(1).max(3),
});

const ProblemSchema = z.object({
  problems: z
    .array(
      z.object({
        story: z.string(),
        answer: z.number(),
        choices: z.array(z.number()).length(4),
      }),
    )
    .length(3),
});

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

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({ schema: ProblemSchema }),
      prompt: `You write fun math story problems for young children.

Create exactly 3 short ${data.operation} story problems for a child named ${data.name} who LOVES ${data.topic}.

Rules:
- Each story is 1-2 short, playful sentences starring ${data.name} and themed around ${data.topic}.
- Difficulty: ${levelDesc}.
- End each story with a clear question.
- "answer" is the correct numeric answer.
- "choices" contains exactly 4 numbers: the correct answer plus 3 plausible wrong answers, in random order, all >= 0.
- Simple English a 6-10 year old can read.`,
    });

    return output;
  });
