import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { adminFetch } from "@/lib/adminFetch";

/**
 * Minimal, intentionally-unpolished admin console for the content pipeline:
 * generate an AI draft → review/edit → publish. Isolated in one file; replace
 * once the product UI is finalized. The API enforces admin access (403 → notice).
 */

type ContentRow = {
  id: number;
  title: string;
  author: string;
  type: string;
  status: string;
  difficulty: string;
};

type Lesson = {
  id: number;
  order: number;
  title: string;
  type: string;
  sections: unknown[];
  quiz: unknown;
  summaryCard: unknown;
};

type Detail = { content: ContentRow & { description: string }; lessons: Lesson[] };

const input = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm";
const btn = "rounded-lg px-3 py-1.5 text-sm font-medium";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [list, setList] = useState<ContentRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  // generate form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("book");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [lessonCount, setLessonCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  async function refresh() {
    try {
      setList(await adminFetch<ContentRow[]>("/api/admin/content"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  }
  useEffect(() => { refresh(); }, []);

  async function generate() {
    if (!title.trim()) return;
    setGenerating(true);
    setErr(null);
    try {
      const d = await adminFetch<Detail>("/api/admin/content/generate", {
        method: "POST",
        body: { title: title.trim(), author: author.trim() || undefined, type, difficulty, lessonCount },
      });
      setTitle(""); setAuthor("");
      await refresh();
      setDetail(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function open(id: number) {
    setErr(null);
    try { setDetail(await adminFetch<Detail>(`/api/admin/content/${id}`)); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
  }
  async function act(id: number, path: string, method = "POST") {
    try { await adminFetch(`/api/admin/content/${id}${path}`, { method }); await refresh(); if (detail?.content.id === id) await open(id); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
  }
  async function saveDetail() {
    if (!detail) return;
    try {
      const updated = await adminFetch<Detail>(`/api/admin/content/${detail.content.id}`, {
        method: "PATCH",
        body: {
          content: { title: detail.content.title, description: detail.content.description },
          lessons: detail.lessons.map((l) => ({ id: l.id, title: l.title })),
        },
      });
      setDetail(updated);
      await refresh();
    } catch (e) { setErr(e instanceof Error ? e.message : "Save failed"); }
  }

  const notAuthorized = err?.toLowerCase().includes("admin access");

  return (
    <div className="min-h-[100dvh] bg-background px-5 py-8 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Content Admin</h1>
          <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setLocation("/home")}>
            ← App
          </button>
        </div>

        {notAuthorized && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            You are not an admin. Add your email to <code>ADMIN_EMAILS</code> in the server <code>.env</code>.
          </div>
        )}
        {err && !notAuthorized && <p className="text-sm text-destructive">{err}</p>}

        {/* Generate */}
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <h2 className="font-semibold">Generate a draft</h2>
          <input className={input} placeholder="Title (e.g. Atomic Habits)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={input} placeholder="Author (optional)" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <select className={input + " flex-1"} value={type} onChange={(e) => setType(e.target.value)}>
              {["book", "podcast", "philosophy", "framework", "course"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className={input + " flex-1"} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {["beginner", "intermediate", "advanced"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className={input + " w-28"} value={lessonCount} onChange={(e) => setLessonCount(Number(e.target.value))}>
              {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} lessons</option>)}
            </select>
          </div>
          <button className={btn + " bg-primary text-white disabled:opacity-50"} disabled={generating || !title.trim()} onClick={generate}>
            {generating ? "Generating… (~20s)" : "Generate"}
          </button>
        </div>

        {/* List */}
        <div className="space-y-2">
          <h2 className="font-semibold">All content</h2>
          {list?.length === 0 && <p className="text-sm text-muted-foreground">No content yet.</p>}
          {list?.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${c.status === "published" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                {c.status}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="truncate text-xs text-muted-foreground">{c.author} · {c.type}</p>
              </div>
              <button className={btn + " border border-border"} onClick={() => open(c.id)}>View</button>
              {c.status === "published"
                ? <button className={btn + " border border-border"} onClick={() => act(c.id, "/unpublish")}>Unpublish</button>
                : <button className={btn + " bg-primary text-white"} onClick={() => act(c.id, "/publish")}>Publish</button>}
              <button className={btn + " text-destructive"} onClick={() => act(c.id, "", "DELETE")}>Delete</button>
            </div>
          ))}
        </div>

        {/* Detail / edit */}
        {detail && (
          <div className="space-y-3 rounded-2xl border border-primary/30 bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Review: {detail.content.title}</h2>
              <button className="text-sm text-muted-foreground" onClick={() => setDetail(null)}>close</button>
            </div>
            <label className="block text-xs text-muted-foreground">Title</label>
            <input className={input} value={detail.content.title}
              onChange={(e) => setDetail({ ...detail, content: { ...detail.content, title: e.target.value } })} />
            <label className="block text-xs text-muted-foreground">Description</label>
            <textarea className={input + " h-20"} value={detail.content.description}
              onChange={(e) => setDetail({ ...detail, content: { ...detail.content, description: e.target.value } })} />
            <p className="text-xs text-muted-foreground">{detail.lessons.length} lessons</p>
            {detail.lessons.map((l, i) => (
              <input key={l.id} className={input} value={l.title}
                onChange={(e) => {
                  const lessons = [...detail.lessons];
                  lessons[i] = { ...l, title: e.target.value };
                  setDetail({ ...detail, lessons });
                }} />
            ))}
            <button className={btn + " bg-primary text-white"} onClick={saveDetail}>Save edits</button>
          </div>
        )}
      </div>
    </div>
  );
}
