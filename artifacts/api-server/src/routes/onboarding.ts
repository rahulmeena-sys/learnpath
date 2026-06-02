import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CompleteOnboardingBody } from "@workspace/api-zod";
import { DEFAULT_USER_ID } from "./helpers";

const router = Router();

router.post("/onboarding", async (req, res) => {
  const parsed = CompleteOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }
  const { name, role, goals, learningStyle, dailyMinutes } = parsed.data;

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, DEFAULT_USER_ID),
  });

  let user;
  if (existing) {
    const [updated] = await db
      .update(usersTable)
      .set({ name, role, goals, learningStyle, dailyMinutes, onboardingComplete: true })
      .where(eq(usersTable.id, DEFAULT_USER_ID))
      .returning();
    user = updated;
  } else {
    const [created] = await db
      .insert(usersTable)
      .values({
        name,
        role,
        goals,
        learningStyle,
        dailyMinutes,
        onboardingComplete: true,
        xp: 0,
        level: 1,
        streak: 0,
        longestStreak: 0,
        contentCompleted: 0,
        lessonsCompleted: 0,
        avatarColor: "#7c3aed",
      })
      .returning();
    user = created;
  }

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
