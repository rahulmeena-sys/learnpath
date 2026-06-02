import { Router } from "express";
import { db, usersTable, achievementsTable, userAchievementsTable, xpHistoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";
import { getOrCreateDefaultUser, getLevelFromXp } from "./helpers";

const router = Router();

function formatProfile(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    goals: user.goals,
    learningStyle: user.learningStyle,
    dailyMinutes: user.dailyMinutes,
    xp: user.xp,
    level: getLevelFromXp(user.xp),
    streak: user.streak,
    longestStreak: user.longestStreak,
    onboardingComplete: user.onboardingComplete,
    avatarColor: user.avatarColor,
    contentCompleted: user.contentCompleted,
    lessonsCompleted: user.lessonsCompleted,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/profile", async (req, res) => {
  const user = await getOrCreateDefaultUser();
  return res.json(formatProfile(user));
});

router.patch("/profile", async (req, res) => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const user = await getOrCreateDefaultUser();
  const { name, goals, dailyMinutes } = parsed.data;

  const [updated] = await db
    .update(usersTable)
    .set({ ...(name ? { name } : {}), ...(goals ? { goals } : {}), ...(dailyMinutes ? { dailyMinutes } : {}) })
    .where(eq(usersTable.id, user.id))
    .returning();

  return res.json(formatProfile(updated));
});

router.get("/profile/achievements", async (req, res) => {
  const user = await getOrCreateDefaultUser();
  const allAchievements = await db.query.achievementsTable.findMany();
  const earned = await db.query.userAchievementsTable.findMany({
    where: eq(userAchievementsTable.userId, user.id),
  });
  const earnedMap = new Map(earned.map((e) => [e.achievementId, e]));

  return res.json(
    allAchievements.map((a) => {
      const e = earnedMap.get(a.id);
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        earnedAt: e ? e.earnedAt.toISOString() : null,
        unlocked: !!e,
      };
    })
  );
});

router.get("/profile/stats", async (req, res) => {
  const user = await getOrCreateDefaultUser();

  // Summarize XP history for past 7 days
  const history = await db.query.xpHistoryTable.findMany({
    where: eq(xpHistoryTable.userId, user.id),
    orderBy: (h, { asc }) => [asc(h.date)],
  });

  // Fill in last 7 days
  const last7: { date: string; xp: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = history.find((h) => h.date === dateStr);
    last7.push({ date: dateStr, xp: found?.xp ?? 0 });
  }

  const xpThisWeek = last7.reduce((s, h) => s + h.xp, 0);
  const totalMinutesLearned = user.lessonsCompleted * 5;

  return res.json({
    totalXp: user.xp,
    level: getLevelFromXp(user.xp),
    streak: user.streak,
    longestStreak: user.longestStreak,
    contentCompleted: user.contentCompleted,
    lessonsCompleted: user.lessonsCompleted,
    tasksCompleted: 0,
    totalMinutesLearned,
    xpThisWeek,
    xpHistory: last7,
  });
});

export default router;
