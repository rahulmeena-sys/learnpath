import { Router } from "express";
import { db, roadmapsTable, dailyTasksTable, contentTable, usersTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { CreateRoadmapBody } from "@workspace/api-zod";
import { getOrCreateDefaultUser, getLevelFromXp, getTodayString } from "./helpers";

const router = Router();

const TASK_TEMPLATES = [
  { type: "habit", title: "Morning Intention", description: "Set one specific intention for today based on what you learned." },
  { type: "challenge", title: "Apply the Concept", description: "Find one real situation today where you can apply a key lesson from this book." },
  { type: "reflection", title: "Evening Review", description: "Write 3 sentences about what you noticed when you tried to apply today's concept." },
  { type: "action", title: "Small Experiment", description: "Run a tiny experiment with the core idea. Keep it under 10 minutes." },
  { type: "review", title: "Key Insight Recall", description: "Without looking at your notes, write down the 3 main ideas from the book so far." },
  { type: "mini-game", title: "Teach It Back", description: "Explain the core concept to someone (or out loud to yourself) in under 2 minutes." },
  { type: "habit", title: "Trigger-Habit-Reward", description: "Identify one habit you want to build. Write the trigger, the habit, and the reward." },
  { type: "challenge", title: "Obstacle Mapping", description: "Write down the #1 obstacle to implementing what you learned. Now write one solution." },
  { type: "reflection", title: "Progress Check", description: "Rate yourself 1-10 on applying this week's concepts. What would make it a 10?" },
  { type: "action", title: "Environment Design", description: "Change one thing in your environment to make the habit you're building easier." },
];

function generateTasks(roadmapId: number, durationDays: number, contentInsights: string[]) {
  const tasks = [];
  for (let day = 1; day <= durationDays; day++) {
    const template = TASK_TEMPLATES[(day - 1) % TASK_TEMPLATES.length];
    const insight = contentInsights[(day - 1) % Math.max(contentInsights.length, 1)];
    tasks.push({
      roadmapId,
      day,
      type: template.type,
      title: template.title,
      description: insight ? `${template.description} Focus on: "${insight}"` : template.description,
      xpReward: 15 + (day % 3 === 0 ? 10 : 0),
      completed: false,
    });
  }
  return tasks;
}

function formatRoadmap(r: typeof roadmapsTable.$inferSelect, content: typeof contentTable.$inferSelect | undefined) {
  const startDate = r.startDate;
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(daysDiff + 1, r.durationDays);

  return {
    id: r.id,
    contentId: r.contentId,
    contentTitle: content?.title ?? "Unknown",
    coverColor: content?.coverColor ?? "#7c3aed",
    durationDays: r.durationDays,
    startDate: r.startDate.toISOString(),
    status: r.status,
    completedTasks: r.completedTasks,
    totalTasks: r.totalTasks,
    currentDay,
    xpEarned: r.xpEarned,
  };
}

router.get("/roadmaps", async (req, res) => {
  const user = await getOrCreateDefaultUser();
  const roadmaps = await db.query.roadmapsTable.findMany({
    where: eq(roadmapsTable.userId, user.id),
  });

  const contentIds = [...new Set(roadmaps.map((r) => r.contentId))];
  const contents = contentIds.length > 0
    ? await db.query.contentTable.findMany({ where: (c, { inArray }) => inArray(c.id, contentIds) })
    : [];
  const contentMap = new Map(contents.map((c) => [c.id, c]));

  return res.json(roadmaps.map((r) => formatRoadmap(r, contentMap.get(r.contentId))));
});

router.post("/roadmaps", async (req, res) => {
  const parsed = CreateRoadmapBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const user = await getOrCreateDefaultUser();
  const { contentId, durationDays } = parsed.data;

  const content = await db.query.contentTable.findFirst({ where: eq(contentTable.id, contentId) });
  if (!content) return res.status(404).json({ error: "Content not found" });

  const [roadmap] = await db
    .insert(roadmapsTable)
    .values({ userId: user.id, contentId, durationDays, status: "active", completedTasks: 0, totalTasks: durationDays, xpEarned: 0 })
    .returning();

  const taskValues = generateTasks(roadmap.id, durationDays, content.keyInsights as string[]);
  await db.insert(dailyTasksTable).values(taskValues);

  return res.status(201).json(formatRoadmap(roadmap, content));
});

router.get("/roadmaps/:roadmapId", async (req, res) => {
  const roadmapId = Number(req.params.roadmapId);
  if (isNaN(roadmapId)) return res.status(400).json({ error: "Invalid id" });

  const user = await getOrCreateDefaultUser();
  const roadmap = await db.query.roadmapsTable.findFirst({
    where: and(eq(roadmapsTable.id, roadmapId), eq(roadmapsTable.userId, user.id)),
  });
  if (!roadmap) return res.status(404).json({ error: "Not found" });

  const content = await db.query.contentTable.findFirst({ where: eq(contentTable.id, roadmap.contentId) });
  const allTasks = await db.query.dailyTasksTable.findMany({
    where: eq(dailyTasksTable.roadmapId, roadmapId),
    orderBy: (t, { asc }) => [asc(t.day)],
  });

  const startDate = roadmap.startDate;
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(daysDiff + 1, roadmap.durationDays);

  const formatTask = (t: typeof allTasks[0]) => ({
    id: t.id,
    roadmapId: t.roadmapId,
    day: t.day,
    type: t.type,
    title: t.title,
    description: t.description,
    xpReward: t.xpReward,
    completed: t.completed,
    completedAt: t.completedAt?.toISOString() ?? null,
  });

  return res.json({
    ...formatRoadmap(roadmap, content),
    todaysTasks: allTasks.filter((t) => t.day === currentDay).map(formatTask),
    upcomingTasks: allTasks.filter((t) => t.day > currentDay && t.day <= currentDay + 3).map(formatTask),
    recentlyCompleted: allTasks.filter((t) => t.completed && t.day < currentDay).slice(-5).map(formatTask),
  });
});

router.post("/roadmaps/:roadmapId/tasks/:taskId/complete", async (req, res) => {
  const roadmapId = Number(req.params.roadmapId);
  const taskId = Number(req.params.taskId);
  if (isNaN(roadmapId) || isNaN(taskId)) return res.status(400).json({ error: "Invalid params" });

  const user = await getOrCreateDefaultUser();
  const task = await db.query.dailyTasksTable.findFirst({ where: eq(dailyTasksTable.id, taskId) });
  if (!task) return res.status(404).json({ error: "Not found" });

  await db.update(dailyTasksTable).set({ completed: true, completedAt: new Date() }).where(eq(dailyTasksTable.id, taskId));
  await db.update(roadmapsTable).set({ completedTasks: task.roadmapId }).where(eq(roadmapsTable.id, roadmapId));

  const xpEarned = task.xpReward;
  const newXp = user.xp + xpEarned;
  const oldLevel = getLevelFromXp(user.xp);
  const newLevel = getLevelFromXp(newXp);

  const today = getTodayString();
  let newStreak = user.streak;
  let streakUpdated = false;
  if (user.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    newStreak = user.lastActiveDate === yesterdayStr ? user.streak + 1 : 1;
    streakUpdated = true;
  }

  await db
    .update(usersTable)
    .set({ xp: newXp, level: newLevel, streak: newStreak, longestStreak: Math.max(user.longestStreak, newStreak), lastActiveDate: today })
    .where(eq(usersTable.id, user.id));

  return res.json({ xpEarned, totalXp: newXp, levelUp: newLevel > oldLevel, newLevel, streakUpdated });
});

export default router;
