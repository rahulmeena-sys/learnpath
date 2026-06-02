import { Router } from "express";
import { db, savedCardsTable, lessonsTable, contentTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { SaveCardBody } from "@workspace/api-zod";
import { getOrCreateDefaultUser } from "./helpers";

const router = Router();

router.get("/saved-cards", async (req, res) => {
  const user = await getOrCreateDefaultUser();
  const cards = await db.query.savedCardsTable.findMany({
    where: eq(savedCardsTable.userId, user.id),
    orderBy: (c, { desc }) => [desc(c.savedAt)],
  });
  return res.json(
    cards.map((c) => ({
      id: c.id,
      contentId: c.contentId,
      lessonId: c.lessonId,
      contentTitle: c.contentTitle,
      lessonTitle: c.lessonTitle,
      keyTakeaways: c.keyTakeaways,
      coreInsight: c.coreInsight,
      coverColor: c.coverColor,
      accentColor: c.accentColor,
      savedAt: c.savedAt.toISOString(),
    }))
  );
});

router.post("/saved-cards", async (req, res) => {
  const parsed = SaveCardBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

  const user = await getOrCreateDefaultUser();
  const { contentId, lessonId } = parsed.data;

  const lesson = await db.query.lessonsTable.findFirst({ where: eq(lessonsTable.id, lessonId) });
  const content = await db.query.contentTable.findFirst({ where: eq(contentTable.id, contentId) });

  if (!lesson || !content) return res.status(404).json({ error: "Not found" });

  const card = lesson.summaryCard as any;

  const [saved] = await db
    .insert(savedCardsTable)
    .values({
      userId: user.id,
      contentId,
      lessonId,
      contentTitle: content.title,
      lessonTitle: lesson.title,
      keyTakeaways: card?.keyTakeaways ?? content.keyInsights?.slice(0, 3) ?? [],
      coreInsight: card?.coreInsight ?? null,
      coverColor: content.coverColor,
      accentColor: content.accentColor,
    })
    .returning();

  return res.status(201).json({
    id: saved.id,
    contentId: saved.contentId,
    lessonId: saved.lessonId,
    contentTitle: saved.contentTitle,
    lessonTitle: saved.lessonTitle,
    keyTakeaways: saved.keyTakeaways,
    coreInsight: saved.coreInsight,
    coverColor: saved.coverColor,
    accentColor: saved.accentColor,
    savedAt: saved.savedAt.toISOString(),
  });
});

router.delete("/saved-cards/:cardId", async (req, res) => {
  const cardId = Number(req.params.cardId);
  if (isNaN(cardId)) return res.status(400).json({ error: "Invalid id" });

  const user = await getOrCreateDefaultUser();
  await db
    .delete(savedCardsTable)
    .where(and(eq(savedCardsTable.id, cardId), eq(savedCardsTable.userId, user.id)));

  return res.status(204).send();
});

export default router;
