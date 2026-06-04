import { pgTable, serial, integer, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { contentTable } from "./content";

export const roadmapsTable = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  contentId: integer("content_id").notNull().references(() => contentTable.id),
  durationDays: integer("duration_days").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  status: text("status").notNull().default("active"), // active, completed, paused
  completedTasks: integer("completed_tasks").notNull().default(0),
  totalTasks: integer("total_tasks").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
});

export const dailyTasksTable = pgTable("daily_tasks", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id").notNull().references(() => roadmapsTable.id),
  day: integer("day").notNull(),
  type: text("type").notNull(), // habit, challenge, reflection, mini-game, action, review
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull().default(15),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

export const insertRoadmapSchema = createInsertSchema(roadmapsTable).omit({ id: true, startDate: true });
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type Roadmap = typeof roadmapsTable.$inferSelect;

export const insertDailyTaskSchema = createInsertSchema(dailyTasksTable).omit({ id: true });
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type DailyTask = typeof dailyTasksTable.$inferSelect;
