import { pgTable, serial, text, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contentTable = pgTable("content", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // book, podcast, philosophy, framework, course
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverColor: text("cover_color").notNull().default("#6366f1"),
  accentColor: text("accent_color").notNull().default("#818cf8"),
  description: text("description").notNull(),
  totalLessons: integer("total_lessons").notNull().default(5),
  estimatedMinutes: integer("estimated_minutes").notNull().default(20),
  goals: jsonb("goals").$type<string[]>().notNull().default([]),
  difficulty: text("difficulty").notNull().default("intermediate"),
  xpReward: integer("xp_reward").notNull().default(100),
  keyInsights: jsonb("key_insights").$type<string[]>().notNull().default([]),
  hasRoadmap: boolean("has_roadmap").notNull().default(false),
  // Publish lifecycle. Default 'published' so existing seeded rows stay visible;
  // AI-generated content is inserted as 'draft' and only served once published.
  status: text("status").notNull().default("published"), // draft | published | archived
  createdBy: integer("created_by"), // admin user id (null for seeded content)
  sourceInput: jsonb("source_input").$type<{ title: string; author?: string; type: string } | null>(),
});

export const insertContentSchema = createInsertSchema(contentTable).omit({ id: true });
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contentTable.$inferSelect;
