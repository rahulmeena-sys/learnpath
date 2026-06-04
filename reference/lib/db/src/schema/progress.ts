import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { contentTable } from "./content";
import { lessonsTable } from "./lessons";

export const lessonProgressTable = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  contentId: integer("content_id").notNull().references(() => contentTable.id),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgressTable).omit({ id: true });
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgressTable.$inferSelect;

export const contentProgressTable = pgTable("content_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  contentId: integer("content_id").notNull().references(() => contentTable.id),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const insertContentProgressSchema = createInsertSchema(contentProgressTable).omit({ id: true });
export type InsertContentProgress = z.infer<typeof insertContentProgressSchema>;
export type ContentProgress = typeof contentProgressTable.$inferSelect;
