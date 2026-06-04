import { pgTable, serial, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { contentTable } from "./content";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  contentId: integer("content_id").notNull().references(() => contentTable.id),
  durationMinutes: integer("duration_minutes").notNull(),
  status: text("status").notNull().default("active"), // active, completed, abandoned
  currentLessonIndex: integer("current_lesson_index").notNull().default(0),
  lessonIds: jsonb("lesson_ids").$type<number[]>().notNull().default([]),
  xpEarned: integer("xp_earned").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true, startedAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
