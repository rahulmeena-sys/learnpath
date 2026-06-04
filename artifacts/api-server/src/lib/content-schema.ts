import { z } from "zod";

/**
 * The exact shape the AI generator must produce, mirroring contentTable +
 * lessonsTable JSON columns (lib/db/src/schema/{content,lessons}.ts).
 *
 * Two artifacts:
 *  - GeneratedContentSchema: zod, used to validate the model output before insert.
 *  - contentJsonSchema: JSON Schema (structured-outputs subset) passed to the
 *    Anthropic API via output_config.format so the model returns valid JSON.
 * Keep the two in sync.
 */

const SectionSchema = z.object({
  id: z.number().int(),
  type: z.enum(["text", "insight", "quote", "visual", "challenge", "reflection"]),
  content: z.string(),
  title: z.string().nullable(),
  highlight: z.string().nullable(),
});

const QuizSchema = z.object({
  id: z.number().int(),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().int(),
  explanation: z.string(),
  xpReward: z.number().int(),
});

const SummaryCardSchema = z.object({
  title: z.string(),
  keyTakeaways: z.array(z.string()),
  coreInsight: z.string(),
});

const LessonSchema = z.object({
  order: z.number().int(),
  title: z.string(),
  type: z.enum(["concept", "story", "framework", "reflection", "challenge"]),
  durationMinutes: z.number().int(),
  xpReward: z.number().int(),
  sections: z.array(SectionSchema),
  quiz: QuizSchema.nullable(),
  summaryCard: SummaryCardSchema.nullable(),
});

export const GeneratedContentSchema = z.object({
  type: z.enum(["book", "podcast", "philosophy", "framework", "course"]),
  title: z.string(),
  author: z.string(),
  coverColor: z.string(),
  accentColor: z.string(),
  description: z.string(),
  totalLessons: z.number().int(),
  estimatedMinutes: z.number().int(),
  goals: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  xpReward: z.number().int(),
  keyInsights: z.array(z.string()),
  hasRoadmap: z.boolean(),
  lessons: z.array(LessonSchema),
});

export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  properties,
  required: Object.keys(properties),
});

/** JSON Schema (structured-outputs subset) — mirrors GeneratedContentSchema. */
export const contentJsonSchema = obj({
  type: { type: "string", enum: ["book", "podcast", "philosophy", "framework", "course"] },
  title: { type: "string" },
  author: { type: "string" },
  coverColor: { type: "string" },
  accentColor: { type: "string" },
  description: { type: "string" },
  totalLessons: { type: "integer" },
  estimatedMinutes: { type: "integer" },
  goals: { type: "array", items: { type: "string" } },
  difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
  xpReward: { type: "integer" },
  keyInsights: { type: "array", items: { type: "string" } },
  hasRoadmap: { type: "boolean" },
  lessons: {
    type: "array",
    items: obj({
      order: { type: "integer" },
      title: { type: "string" },
      type: { type: "string", enum: ["concept", "story", "framework", "reflection", "challenge"] },
      durationMinutes: { type: "integer" },
      xpReward: { type: "integer" },
      sections: {
        type: "array",
        items: obj({
          id: { type: "integer" },
          type: { type: "string", enum: ["text", "insight", "quote", "visual", "challenge", "reflection"] },
          content: { type: "string" },
          title: { type: ["string", "null"] },
          highlight: { type: ["string", "null"] },
        }),
      },
      quiz: {
        anyOf: [
          { type: "null" },
          obj({
            id: { type: "integer" },
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correctIndex: { type: "integer" },
            explanation: { type: "string" },
            xpReward: { type: "integer" },
          }),
        ],
      },
      summaryCard: {
        anyOf: [
          { type: "null" },
          obj({
            title: { type: "string" },
            keyTakeaways: { type: "array", items: { type: "string" } },
            coreInsight: { type: "string" },
          }),
        ],
      },
    }),
  },
});
