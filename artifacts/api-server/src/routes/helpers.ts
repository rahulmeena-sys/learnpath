import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const DEFAULT_USER_ID = 1;

export async function getOrCreateDefaultUser() {
  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, DEFAULT_USER_ID),
  });
  if (existing) return existing;

  const [user] = await db
    .insert(usersTable)
    .values({
      name: "Learner",
      goals: [],
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      onboardingComplete: false,
      contentCompleted: 0,
      lessonsCompleted: 0,
      avatarColor: "#7c3aed",
    })
    .returning();
  return user;
}

export function getLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
