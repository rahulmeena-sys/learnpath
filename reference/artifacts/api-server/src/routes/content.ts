import { Router } from "express";
import { db, contentTable, contentProgressTable } from "@workspace/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getReqUser } from "./helpers";

const router = Router();

async function enrichContentWithProgress(items: typeof contentTable.$inferSelect[], userId: number) {
  if (items.length === 0) return [];
  const ids = items.map((c) => c.id);
  const progressRows = await db.query.contentProgressTable.findMany({
    where: (cp, { and, inArray: inArr }) => and(
      eq(cp.userId, userId),
      inArr(cp.contentId, ids)
    ),
  });
  const progressMap = new Map(progressRows.map((p) => [p.contentId, p]));

  return items.map((c) => {
    const prog = progressMap.get(c.id);
    const pct = prog ? Math.round((prog.lessonsCompleted / c.totalLessons) * 100) : 0;
    return {
      id: c.id,
      type: c.type,
      title: c.title,
      author: c.author,
      coverColor: c.coverColor,
      accentColor: c.accentColor,
      description: c.description,
      totalLessons: c.totalLessons,
      estimatedMinutes: c.estimatedMinutes,
      goals: c.goals,
      difficulty: c.difficulty,
      xpReward: c.xpReward,
      userProgress: pct,
      isStarted: prog ? prog.lessonsCompleted > 0 : false,
      isCompleted: prog ? prog.isCompleted : false,
      hasRoadmap: c.hasRoadmap,
    };
  });
}

router.get("/content", async (req, res) => {
  const user = getReqUser(req);
  const type = req.query.type as string | undefined;
  const goal = req.query.goal as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  let items = await db.query.contentTable.findMany({
    where: eq(contentTable.status, "published"),
    limit,
  });

  if (type) {
    items = items.filter((c) => c.type === type);
  }
  if (goal) {
    items = items.filter((c) => (c.goals as string[]).includes(goal));
  }

  const enriched = await enrichContentWithProgress(items, user.id);
  return res.json(enriched);
});

router.get("/content/featured", async (req, res) => {
  const user = getReqUser(req);
  const allContent = await db.query.contentTable.findMany({
    where: eq(contentTable.status, "published"),
  });
  const enriched = await enrichContentWithProgress(allContent, user.id);

  const userGoals = user.goals as string[];
  const forGoals = userGoals.length > 0
    ? enriched.filter((c) => c.goals.some((g: string) => userGoals.includes(g)))
    : enriched.slice(0, 6);
  const books = enriched.filter((c) => c.type === "book").slice(0, 8);
  const philosophy = enriched.filter((c) => c.type === "philosophy" || c.type === "framework").slice(0, 6);
  const continueReading = enriched.filter((c) => c.isStarted && !c.isCompleted);

  return res.json({
    sections: [
      { title: "For Your Goals", subtitle: "Handpicked for your journey", items: forGoals.slice(0, 8) },
      { title: "Essential Reads", subtitle: "Books that changed minds", items: books },
      { title: "Philosophy & Wisdom", subtitle: "Timeless frameworks", items: philosophy },
    ],
    continueReading,
  });
});

router.get("/content/:contentId", async (req, res) => {
  const contentId = Number(req.params.contentId);
  if (isNaN(contentId)) return res.status(400).json({ error: "Invalid content id" });

  const user = getReqUser(req);
  const item = await db.query.contentTable.findFirst({
    where: and(eq(contentTable.id, contentId), eq(contentTable.status, "published")),
  });
  if (!item) return res.status(404).json({ error: "Not found" });

  const [enriched] = await enrichContentWithProgress([item], user.id);

  const lessonPreviews = await db.query.lessonsTable.findMany({
    where: (l, { eq: eqL }) => eqL(l.contentId, contentId),
  });

  return res.json({
    ...enriched,
    keyInsights: item.keyInsights,
    lessonPreviews: lessonPreviews.map((l) => ({
      id: l.id,
      contentId: l.contentId,
      order: l.order,
      title: l.title,
      type: l.type,
      durationMinutes: l.durationMinutes,
      xpReward: l.xpReward,
      isCompleted: false,
    })),
  });
});

export default router;
