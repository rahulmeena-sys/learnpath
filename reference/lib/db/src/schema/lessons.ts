import { pgTable, serial, integer, text, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { contentTable } from "./content";

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentTable.id),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull().default("concept"), // concept, story, framework, reflection, challenge
  durationMinutes: integer("duration_minutes").notNull().default(5),
  xpReward: integer("xp_reward").notNull().default(20),
  sections: jsonb("sections").$type<LessonSection[]>().notNull().default([]),
  quiz: jsonb("quiz").$type<LessonQuiz | null>().default(null),
  summaryCard: jsonb("summary_card").$type<LessonSummaryCard | null>().default(null),
});

export type LessonSection = {
  id: number;
  type: "text" | "insight" | "quote" | "visual" | "challenge" | "reflection";
  content: string;
  title?: string | null;
  highlight?: string | null;
};

export type LessonQuiz = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
};

export type LessonSummaryCard = {
  title: string;
  keyTakeaways: string[];
  coreInsight: string;
};

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
