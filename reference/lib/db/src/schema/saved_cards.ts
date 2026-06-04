import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { contentTable } from "./content";
import { lessonsTable } from "./lessons";

export const savedCardsTable = pgTable("saved_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  contentId: integer("content_id").notNull().references(() => contentTable.id),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  contentTitle: text("content_title").notNull(),
  lessonTitle: text("lesson_title").notNull(),
  keyTakeaways: jsonb("key_takeaways").$type<string[]>().notNull().default([]),
  coreInsight: text("core_insight"),
  coverColor: text("cover_color").notNull(),
  accentColor: text("accent_color"),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
});

export const insertSavedCardSchema = createInsertSchema(savedCardsTable).omit({ id: true, savedAt: true });
export type InsertSavedCard = z.infer<typeof insertSavedCardSchema>;
export type SavedCard = typeof savedCardsTable.$inferSelect;
