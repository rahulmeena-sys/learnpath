import { Router } from "express";
import { db, lessonsTable, lessonProgressTable, contentTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { getReqUser } from "./helpers";

const router = Router();

// Lessons are only reachable through published content — drafts must not leak
// even if a content id is guessed.
async function isPublished(contentId: number) {
  const row = await db.query.contentTable.findFirst({
    where: and(eq(contentTable.id, contentId), eq(contentTable.status, "published")),
    columns: { id: true },
  });
  return !!row;
}

router.get("/content/:contentId/lessons", async (req, res) => {
  const contentId = Number(req.params.contentId);
  if (isNaN(contentId)) return res.status(400).json({ error: "Invalid content id" });
  if (!(await isPublished(contentId))) return res.status(404).json({ error: "Not found" });

  const user = getReqUser(req);
  const lessons = await db.query.lessonsTable.findMany({
    where: eq(lessonsTable.contentId, contentId),
    orderBy: (l, { asc }) => [asc(l.order)],
  });

  const progress = await db.query.lessonProgressTable.findMany({
    where: and(
      eq(lessonProgressTable.userId, user.id),
      eq(lessonProgressTable.contentId, contentId)
    ),
  });
  const completedSet = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

  return res.json(
    lessons.map((l) => ({
      id: l.id,
      contentId: l.contentId,
      order: l.order,
      title: l.title,
      type: l.type,
      durationMinutes: l.durationMinutes,
      xpReward: l.xpReward,
      isCompleted: completedSet.has(l.id),
    }))
  );
});

router.get("/content/:contentId/lessons/:lessonId", async (req, res) => {
  const contentId = Number(req.params.contentId);
  const lessonId = Number(req.params.lessonId);
  if (isNaN(contentId) || isNaN(lessonId)) return res.status(400).json({ error: "Invalid params" });
  if (!(await isPublished(contentId))) return res.status(404).json({ error: "Not found" });

  const lesson = await db.query.lessonsTable.findFirst({
    where: and(eq(lessonsTable.id, lessonId), eq(lessonsTable.contentId, contentId)),
  });
  if (!lesson) return res.status(404).json({ error: "Not found" });

  return res.json({
    id: lesson.id,
    contentId: lesson.contentId,
    order: lesson.order,
    title: lesson.title,
    type: lesson.type,
    durationMinutes: lesson.durationMinutes,
    xpReward: lesson.xpReward,
    isCompleted: false,
    content: {
      sections: lesson.sections,
      quiz: lesson.quiz ? {
        id: lesson.quiz.id,
        question: lesson.quiz.question,
        options: lesson.quiz.options,
        xpReward: lesson.quiz.xpReward,
      } : undefined,
      summaryCard: lesson.summaryCard ? {
        contentId: lesson.contentId,
        lessonId: lesson.id,
        title: lesson.summaryCard.title,
        keyTakeaways: lesson.summaryCard.keyTakeaways,
        coreInsight: lesson.summaryCard.coreInsight,
        coverColor: "#7c3aed",
        accentColor: "#06b6d4",
      } : undefined,
    },
  });
});

export default router;
