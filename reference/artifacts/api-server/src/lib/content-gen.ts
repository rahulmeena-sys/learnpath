import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config";
import { AppError } from "../middlewares/error";
import {
  GeneratedContentSchema,
  contentJsonSchema,
  type GeneratedContent,
} from "./content-schema";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!config.ANTHROPIC_API_KEY) {
    throw new AppError(503, "Content generation is not configured (ANTHROPIC_API_KEY missing).");
  }
  if (!client) client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
  return client;
}

// Stable system prompt (schema rules + style guide + worked example) — cached so
// repeated generations only pay to process it once.
const SYSTEM = `You generate learning content for LearnPath, a personalized micro-learning app. Given a book/topic, produce one content item with several lessons that distill its core ideas into bite-sized, actionable learning.

STYLE:
- Voice: clear, motivating, practical. Concrete over abstract. No fluff, no emojis.
- Each lesson teaches ONE idea through a few short sections, then checks understanding with a quiz, then summarizes.
- keyInsights: 4–5 punchy, standalone takeaways for the whole item.
- coverColor/accentColor: tasteful hex colors that fit the topic's mood.
- goals: lowercase tags from {productivity, focus, confidence, leadership, relationships, creativity, mindset, health, finance, communication} that the content serves.

PER-LESSON STRUCTURE:
- sections: 3–4 blocks. Use types: "text" (exposition), "insight" (the key idea, set a short "highlight"), "quote" (a relevant quotation), "challenge" (a do-this-now task), "reflection" (a question to ponder). Give each section a short "title"; set "highlight" to null unless type is "insight".
- quiz: a single multiple-choice question with 4 options, the correct index, and a one-sentence explanation. xpReward ~10.
- summaryCard: title, 2–3 keyTakeaways, and a one-line coreInsight.
- lesson xpReward ~20, durationMinutes ~5.

Sequence section "id" values 1,2,3… within each lesson. Make quiz "id" unique-ish (e.g. lessonOrder*100+1). Return ONLY content matching the provided JSON schema — no preamble.`;

export interface GenerateInput {
  title: string;
  author?: string;
  type?: string;
  difficulty?: string;
  lessonCount?: number;
}

export async function generateContentDraft(input: GenerateInput): Promise<GeneratedContent> {
  const anthropic = getClient();
  const lessonCount = Math.min(Math.max(input.lessonCount ?? 5, 3), 6);

  const userPrompt = `Create LearnPath content for:
Title: ${input.title}
Author: ${input.author ?? "(infer or synthesize an appropriate author)"}
Type: ${input.type ?? "book"}
Difficulty: ${input.difficulty ?? "intermediate"}

Produce exactly ${lessonCount} lessons (set totalLessons to ${lessonCount}). Set hasRoadmap to true. Make estimatedMinutes the sum of lesson durations.`;

  const resp = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    // Constrain the response to our schema (structured outputs).
    output_config: { format: { type: "json_schema", schema: contentJsonSchema } },
    messages: [{ role: "user", content: userPrompt }],
  } as Anthropic.MessageCreateParamsNonStreaming);

  if (resp.stop_reason === "max_tokens") {
    throw new AppError(502, "Generation was truncated (hit max_tokens). Try fewer lessons.");
  }

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new AppError(502, "Generator returned non-JSON output.");
  }

  const parsed = GeneratedContentSchema.safeParse(json);
  if (!parsed.success) {
    throw new AppError(502, `Generated content failed validation: ${parsed.error.message}`);
  }
  return parsed.data;
}
