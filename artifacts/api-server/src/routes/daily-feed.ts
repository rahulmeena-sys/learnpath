import { Router } from "express";
import { db, roadmapsTable, dailyTasksTable, contentTable, contentProgressTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getReqUser, getTodayString } from "./helpers";

const router = Router();

router.get("/daily-feed", async (req, res) => {
  const user = getReqUser(req);
  const today = getTodayString();
  const dayOfWeek = new Date().getDay(); // 0=Sun

  // Build 7-day streak booleans
  const daysThisWeek: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    daysThisWeek.push(user.lastActiveDate === ds || (i === 0 && user.xpEarnedToday > 0));
  }

  const hours = new Date().getHours();
  const timeGreeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening";
  const greeting = `${timeGreeting}, ${user.name}`;

  const items: any[] = [];

  // Active roadmap tasks
  const activeRoadmaps = await db.query.roadmapsTable.findMany({
    where: and(eq(roadmapsTable.userId, user.id), eq(roadmapsTable.status, "active")),
  });

  for (const roadmap of activeRoadmaps) {
    const startDate = roadmap.startDate;
    const daysDiff = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(daysDiff + 1, roadmap.durationDays);

    const todayTasks = await db.query.dailyTasksTable.findMany({
      where: and(eq(dailyTasksTable.roadmapId, roadmap.id), eq(dailyTasksTable.day, currentDay)),
    });

    for (const task of todayTasks.filter((t) => !t.completed)) {
      items.push({
        type: "task",
        title: task.title,
        description: task.description,
        xpReward: task.xpReward,
        contentId: roadmap.contentId,
        roadmapId: roadmap.id,
        taskId: task.id,
      });
    }
  }

  // Streak reminder if not active yet today
  if (user.streak > 0 && user.lastActiveDate !== today) {
    items.unshift({
      type: "streak-reminder",
      title: `${user.streak}-day streak at risk`,
      description: "Complete any lesson or task today to keep your streak alive.",
      xpReward: 0,
      contentId: null,
      roadmapId: null,
      taskId: null,
    });
  }

  // Reflection prompt
  items.push({
    type: "reflection",
    title: "Daily Reflection",
    description: "What's one thing you've learned recently that you want to make sure you remember?",
    xpReward: 10,
    contentId: null,
    roadmapId: null,
    taskId: null,
  });

  // Suggest new content
  const allContent = await db.query.contentTable.findMany({ limit: 20 });
  const progressRows = await db.query.contentProgressTable.findMany({ where: eq(contentProgressTable.userId, user.id) });
  const startedIds = new Set(progressRows.map((p) => p.contentId));
  const userGoals = user.goals as string[];
  const suggested = allContent
    .filter((c) => !startedIds.has(c.id))
    .filter((c) => userGoals.length === 0 || (c.goals as string[]).some((g) => userGoals.includes(g)))
    .slice(0, 4)
    .map((c) => ({
      id: c.id, type: c.type, title: c.title, author: c.author,
      coverColor: c.coverColor, accentColor: c.accentColor,
      description: c.description, totalLessons: c.totalLessons,
      estimatedMinutes: c.estimatedMinutes, goals: c.goals,
      difficulty: c.difficulty, xpReward: c.xpReward,
      userProgress: 0, isStarted: false, isCompleted: false, hasRoadmap: c.hasRoadmap,
    }));

  const dailyXpGoal = user.dailyMinutes ? user.dailyMinutes * 2 : 20;

  return res.json({
    greeting,
    date: today,
    dailyXpGoal,
    xpEarnedToday: user.xpEarnedToday,
    items,
    streakData: {
      current: user.streak,
      longest: user.longestStreak,
      daysThisWeek,
    },
    suggestedContent: suggested,
  });
});

export default router;
