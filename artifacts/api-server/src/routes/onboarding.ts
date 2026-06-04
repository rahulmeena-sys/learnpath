import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CompleteOnboardingBody } from "@workspace/api-zod";
import { getReqUser } from "./helpers";

const router = Router();

router.post("/onboarding", async (req, res) => {
  const parsed = CompleteOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const { name, role, goals, learningStyle, dailyMinutes } = parsed.data;

  // The authenticated user already exists (provisioned by requireAuth); onboarding
  // just fills in their profile and marks it complete.
  const current = getReqUser(req);
  const [user] = await db
    .update(usersTable)
    .set({ name, role, goals, learningStyle, dailyMinutes, onboardingComplete: true })
    .where(eq(usersTable.id, current.id))
    .returning();

  return res.json({
    id: user.id,
    name: user.name,
    role: user.role,
    goals: user.goals,
    learningStyle: user.learningStyle,
    dailyMinutes: user.dailyMinutes,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    longestStreak: user.longestStreak,
    onboardingComplete: user.onboardingComplete,
    avatarColor: user.avatarColor,
    contentCompleted: user.contentCompleted,
    lessonsCompleted: user.lessonsCompleted,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
