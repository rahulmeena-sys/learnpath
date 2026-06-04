import { Router } from "express";
import { db, sessionsTable, lessonsTable, lessonProgressTable, contentProgressTable, usersTable, contentTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { StartSessionBody, CompleteLessonInSessionBody, SubmitQuizAnswerBody } from "@workspace/api-zod";
import { getReqUser, getLevelFromXp, getTodayString } from "./helpers";

const router = Router();

function getLessonsForDuration(allLessons: typeof lessonsTable.$inferSelect[], durationMinutes: number) {
  let total = 0;
  const selected = [];
  for (const lesson of allLessons) {
    if (total + lesson.durationMinutes > durationMinutes && selected.length > 0) break;
    selected.push(lesson);
    total += lesson.durationMinutes;
  }
  return selected.length > 0 ? selected : allLessons.slice(0, 1);
}

router.post("/sessions", async (req, res) => {
  const parsed = StartSessionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const user = getReqUser(req);
  const { contentId, durationMinutes } = parsed.data;

  const allLessons = await db.query.lessonsTable.findMany({
    where: eq(lessonsTable.contentId, contentId),
    orderBy: (l, { asc }) => [asc(l.order)],
  });

  const selectedLessons = getLessonsForDuration(allLessons, durationMinutes);

  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId: user.id,
      contentId,
      durationMinutes,
      status: "active",
      currentLessonIndex: 0,
      lessonIds: selectedLessons.map((l) => l.id),
      xpEarned: 0,
    })
    .returning();

  return res.status(201).json({
    id: session.id,
    contentId: session.contentId,
    durationMinutes: session.durationMinutes,
    status: session.status,
    currentLessonIndex: session.currentLessonIndex,
    lessonsToComplete: selectedLessons.map((l) => ({
      id: l.id,
      contentId: l.contentId,
      order: l.order,
      title: l.title,
      type: l.type,
      durationMinutes: l.durationMinutes,
      xpReward: l.xpReward,
      isCompleted: false,
    })),
    xpEarned: session.xpEarned,
    startedAt: session.startedAt.toISOString(),
    completedAt: null,
  });
});

router.get("/sessions/:sessionId", async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  if (isNaN(sessionId)) return res.status(400).json({ error: "Invalid session id" });

  const user = getReqUser(req);
  const session = await db.query.sessionsTable.findFirst({
    where: and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, user.id)),
  });
  if (!session) return res.status(404).json({ error: "Not found" });

  const lessonIds = session.lessonIds as number[];
  const lessons = await db.query.lessonsTable.findMany({
    where: (l, { inArray }) => inArray(l.id, lessonIds),
  });
  const lessonsOrdered = lessonIds.map((id) => lessons.find((l) => l.id === id)).filter(Boolean) as typeof lessons;

  return res.json({
    id: session.id,
    contentId: session.contentId,
    durationMinutes: session.durationMinutes,
    status: session.status,
    currentLessonIndex: session.currentLessonIndex,
    lessonsToComplete: lessonsOrdered.map((l) => ({
      id: l.id,
      contentId: l.contentId,
      order: l.order,
      title: l.title,
      type: l.type,
      durationMinutes: l.durationMinutes,
      xpReward: l.xpReward,
      isCompleted: false,
    })),
    xpEarned: session.xpEarned,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
  });
});

router.post("/sessions/:sessionId/complete-lesson", async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  if (isNaN(sessionId)) return res.status(400).json({ error: "Invalid session id" });

  const parsed = CompleteLessonInSessionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const user = getReqUser(req);
  const session = await db.query.sessionsTable.findFirst({
    where: and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, user.id)),
  });
  if (!session) return res.status(404).json({ error: "Not found" });

  const { lessonId } = parsed.data;
  const lesson = await db.query.lessonsTable.findFirst({ where: eq(lessonsTable.id, lessonId) });
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  const xpEarned = lesson.xpReward;
  const newXp = user.xp + xpEarned;
  const oldLevel = getLevelFromXp(user.xp);
  const newLevel = getLevelFromXp(newXp);
  const levelUp = newLevel > oldLevel;

  const lessonIds = session.lessonIds as number[];
  const newIndex = session.currentLessonIndex + 1;
  const sessionComplete = newIndex >= lessonIds.length;

  await db
    .insert(lessonProgressTable)
    .values({ userId: user.id, contentId: lesson.contentId, lessonId, completed: true, completedAt: new Date() })
    .onConflictDoNothing();

  // Update content progress
  const existingProgress = await db.query.contentProgressTable.findFirst({
    where: and(eq(contentProgressTable.userId, user.id), eq(contentProgressTable.contentId, lesson.contentId)),
  });
  if (existingProgress) {
    await db
      .update(contentProgressTable)
      .set({ lessonsCompleted: existingProgress.lessonsCompleted + 1 })
      .where(and(eq(contentProgressTable.userId, user.id), eq(contentProgressTable.contentId, lesson.contentId)));
  } else {
    await db.insert(contentProgressTable).values({ userId: user.id, contentId: lesson.contentId, lessonsCompleted: 1, isCompleted: false });
  }

  // Update session
  await db
    .update(sessionsTable)
    .set({
      currentLessonIndex: newIndex,
      xpEarned: session.xpEarned + xpEarned,
      status: sessionComplete ? "completed" : "active",
      completedAt: sessionComplete ? new Date() : null,
    })
    .where(eq(sessionsTable.id, sessionId));

  // Update streak
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
    .set({
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lessonsCompleted: user.lessonsCompleted + 1,
      contentCompleted: sessionComplete ? user.contentCompleted + 1 : user.contentCompleted,
      lastActiveDate: today,
      xpEarnedToday: user.xpEarnedToday + xpEarned,
    })
    .where(eq(usersTable.id, user.id));

  return res.json({
    xpEarned,
    totalXp: newXp,
    levelUp,
    newLevel,
    sessionComplete,
    streakUpdated,
    newStreak,
  });
});

router.post("/sessions/:sessionId/quiz-answer", async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  if (isNaN(sessionId)) return res.status(400).json({ error: "Invalid session id" });

  const parsed = SubmitQuizAnswerBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const { quizId, selectedIndex } = parsed.data;

  // Find the lesson with this quiz
  const allLessons = await db.query.lessonsTable.findMany();
  const lesson = allLessons.find((l) => l.quiz && (l.quiz as any).id === quizId);

  if (!lesson || !lesson.quiz) {
    return res.json({ correct: true, correctIndex: 0, explanation: "Good thinking!", xpEarned: 10 });
  }

  const quiz = lesson.quiz as any;
  const correct = selectedIndex === quiz.correctIndex;
  const xpEarned = correct ? quiz.xpReward : Math.floor(quiz.xpReward / 2);

  if (xpEarned > 0) {
    const user = getReqUser(req);
    await db.update(usersTable).set({ xp: user.xp + xpEarned }).where(eq(usersTable.id, user.id));
  }

  return res.json({
    correct,
    correctIndex: quiz.correctIndex,
    explanation: quiz.explanation,
    xpEarned,
  });
});

router.get("/sessions/:sessionId/summary", async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  if (isNaN(sessionId)) return res.status(400).json({ error: "Invalid" });

  const user = getReqUser(req);
  const session = await db.query.sessionsTable.findFirst({
    where: and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, user.id)),
  });
  if (!session) return res.status(404).json({ error: "Not found" });

  const lessonIds = session.lessonIds as number[];
  const lastLessonId = lessonIds[lessonIds.length - 1];
  const lesson = await db.query.lessonsTable.findFirst({ where: eq(lessonsTable.id, lastLessonId) });
  const content = await db.query.contentTable.findFirst({ where: eq(contentTable.id, session.contentId) });

  const card = lesson?.summaryCard as any;

  return res.json({
    contentId: session.contentId,
    lessonId: lastLessonId,
    title: card?.title ?? content?.title ?? "Session Summary",
    keyTakeaways: card?.keyTakeaways ?? content?.keyInsights?.slice(0, 4) ?? ["Key insight from your learning session"],
    coreInsight: card?.coreInsight ?? "You've taken a meaningful step in your learning journey.",
    coverColor: content?.coverColor ?? "#7c3aed",
    accentColor: content?.accentColor ?? "#06b6d4",
  });
});

export default router;
