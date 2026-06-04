import { Router } from "express";
import { db, contentTable, lessonsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { asyncHandler, AppError } from "../middlewares/error";
import { getReqUser } from "./helpers";
import { generateContentDraft } from "../lib/content-gen";

const router = Router();

// Every /admin route requires an admin (requireAuth has already run globally).
router.use(requireAdmin);

async function withLessons(id: number) {
  const content = await db.query.contentTable.findFirst({ where: eq(contentTable.id, id) });
  if (!content) return null;
  const lessons = await db.query.lessonsTable.findMany({
    where: eq(lessonsTable.contentId, id),
    orderBy: (l, { asc }) => [asc(l.order)],
  });
  return { content, lessons };
}

const pick = <T extends object>(o: T, keys: string[]) =>
  Object.fromEntries(
    Object.entries(o).filter(([k, v]) => keys.includes(k) && v !== undefined),
  );

const CONTENT_FIELDS = [
  "type", "title", "author", "coverColor", "accentColor", "description",
  "totalLessons", "estimatedMinutes", "goals", "difficulty", "xpReward",
  "keyInsights", "hasRoadmap",
];
const LESSON_FIELDS = ["order", "title", "type", "durationMinutes", "xpReward", "sections", "quiz", "summaryCard"];

// Generate a draft from a title/topic, persist content (draft) + lessons.
router.post("/admin/content/generate", asyncHandler(async (req, res) => {
  const { title, author, type, difficulty, lessonCount } = req.body ?? {};
  if (!title || typeof title !== "string") throw new AppError(400, "title is required");

  const draft = await generateContentDraft({ title, author, type, difficulty, lessonCount });
  const user = getReqUser(req);

  const [content] = await db
    .insert(contentTable)
    .values({
      type: draft.type,
      title: draft.title,
      author: draft.author,
      coverColor: draft.coverColor,
      accentColor: draft.accentColor,
      description: draft.description,
      totalLessons: draft.totalLessons,
      estimatedMinutes: draft.estimatedMinutes,
      goals: draft.goals,
      difficulty: draft.difficulty,
      xpReward: draft.xpReward,
      keyInsights: draft.keyInsights,
      hasRoadmap: draft.hasRoadmap,
      status: "draft",
      createdBy: user.id,
      sourceInput: { title, author, type: type ?? "book" },
    })
    .returning();

  if (draft.lessons.length) {
    await db.insert(lessonsTable).values(
      draft.lessons.map((l) => ({
        contentId: content.id,
        order: l.order,
        title: l.title,
        type: l.type,
        durationMinutes: l.durationMinutes,
        xpReward: l.xpReward,
        sections: l.sections,
        quiz: l.quiz,
        summaryCard: l.summaryCard,
      })),
    );
  }

  res.status(201).json(await withLessons(content.id));
}));

// List all content (drafts + published) for the review dashboard.
router.get("/admin/content", asyncHandler(async (_req, res) => {
  const items = await db.query.contentTable.findMany({ orderBy: (c, { desc }) => [desc(c.id)] });
  res.json(items);
}));

// Full content + lessons for review/editing.
router.get("/admin/content/:id", asyncHandler(async (req, res) => {
  const data = await withLessons(Number(req.params.id));
  if (!data) throw new AppError(404, "Not found");
  res.json(data);
}));

// Human-review edits (partial content fields and/or lesson edits).
router.patch("/admin/content/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { content: contentPatch, lessons } = req.body ?? {};

  if (contentPatch && typeof contentPatch === "object") {
    const clean = pick(contentPatch, CONTENT_FIELDS) as Partial<typeof contentTable.$inferInsert>;
    if (Object.keys(clean).length) {
      await db.update(contentTable).set(clean).where(eq(contentTable.id, id));
    }
  }

  if (Array.isArray(lessons)) {
    for (const l of lessons) {
      if (!l?.id) continue;
      const clean = pick(l, LESSON_FIELDS) as Partial<typeof lessonsTable.$inferInsert>;
      if (Object.keys(clean).length) {
        await db.update(lessonsTable).set(clean).where(eq(lessonsTable.id, l.id));
      }
    }
  }

  const data = await withLessons(id);
  if (!data) throw new AppError(404, "Not found");
  res.json(data);
}));

router.post("/admin/content/:id/publish", asyncHandler(async (req, res) => {
  await db.update(contentTable).set({ status: "published" }).where(eq(contentTable.id, Number(req.params.id)));
  res.json({ ok: true });
}));

router.post("/admin/content/:id/unpublish", asyncHandler(async (req, res) => {
  await db.update(contentTable).set({ status: "draft" }).where(eq(contentTable.id, Number(req.params.id)));
  res.json({ ok: true });
}));

router.delete("/admin/content/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(lessonsTable).where(eq(lessonsTable.contentId, id));
  await db.delete(contentTable).where(eq(contentTable.id, id));
  res.json({ ok: true });
}));

export default router;
