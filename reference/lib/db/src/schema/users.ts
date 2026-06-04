import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  // Supabase Auth identity: the JWT `sub` (user UUID) and email. Nullable so
  // pre-auth/seed rows remain valid; real users always have authId set.
  // Uniqueness is enforced in app code (getOrCreateUserByAuth find-or-create);
  // a DB unique index can be added once the table holds only real users.
  authId: text("auth_id"),
  email: text("email"),
  name: text("name").notNull(),
  role: text("role"),
  goals: jsonb("goals").$type<string[]>().notNull().default([]),
  learningStyle: text("learning_style"),
  dailyMinutes: integer("daily_minutes").default(10),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  avatarColor: text("avatar_color"),
  contentCompleted: integer("content_completed").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  xpEarnedToday: integer("xp_earned_today").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
