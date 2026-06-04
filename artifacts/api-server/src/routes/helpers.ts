import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Request } from "express";

/**
 * Find the app user for a Supabase auth identity, creating it on first sign-in
 * (JIT provisioning). Uniqueness per authId is guaranteed by this find-first.
 */
export async function getOrCreateUserByAuth(
  authId: string,
  email: string | null,
): Promise<User> {
  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.authId, authId),
  });
  if (existing) return existing;

  const [user] = await db
    .insert(usersTable)
    .values({
      authId,
      email,
      name: email?.split("@")[0] ?? "Learner",
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

/**
 * The authenticated app user, attached by `requireAuth`. Throws if called on an
 * unauthenticated request (shouldn't happen behind the middleware).
 */
export function getReqUser(req: Request): User {
  if (!req.appUser) {
    throw new Error("getReqUser called without an authenticated user");
  }
  return req.appUser;
}

export function getLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
