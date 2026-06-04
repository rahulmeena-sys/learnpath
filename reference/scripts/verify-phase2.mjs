// Phase 2 full verification: import a draft -> hidden from public -> publish ->
// visible with working lessons. Drafts must not leak (feed, detail, lessons).
//
// Run server-side with the API up:
//   SECRET=<service-role-key> VERIFY_ADMIN_EMAIL=<email-in-ADMIN_EMAILS> \
//     node --env-file=.env scripts/verify-phase2.mjs
//
// Reads SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAILS from the env file.
// SECRET (Supabase service-role key) is required and the admin is provisioned
// via the admin API with email_confirm:true — this sends NO confirmation email,
// so it never bounces (unlike the public /signup endpoint). VERIFY_ADMIN_EMAIL
// must be listed in ADMIN_EMAILS.
import { readFileSync } from "node:fs";

const SUPA = process.env.SUPABASE_URL?.replace(/\/$/, "");
const PUB = process.env.VITE_SUPABASE_ANON_KEY;
const SECRET = process.env.SECRET;
const API = process.env.API ?? "http://localhost:8080";
const ADMIN = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const ADMIN_EMAIL = process.env.VERIFY_ADMIN_EMAIL;
const PASSWORD = "Test123456";

if (!SUPA || !PUB) throw new Error("Missing SUPABASE_URL / VITE_SUPABASE_ANON_KEY in env file.");
if (!SECRET) throw new Error("Missing SECRET (Supabase service-role key) — needed to provision the admin without sending email.");
if (!ADMIN_EMAIL) throw new Error("Set VERIFY_ADMIN_EMAIL to an address listed in ADMIN_EMAILS.");
if (!ADMIN.includes(ADMIN_EMAIL.toLowerCase()))
  throw new Error(`${ADMIN_EMAIL} is not in ADMIN_EMAILS (${ADMIN.join(", ")}).`);

const results = [];
const note = (label, pass, extra = "") =>
  results.push(`[${pass ? "PASS" : "FAIL"}] ${label}${extra ? " — " + extra : ""}`);

async function auth() {
  // Provision via the admin API with email_confirm:true — no email is sent, so
  // even a throwaway address never bounces. Idempotent across runs.
  const r = await fetch(`${SUPA}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: PASSWORD, email_confirm: true }),
  });
  if (!r.ok && r.status !== 422 /* already registered */) {
    throw new Error(`admin create failed: ${r.status} ${await r.text()}`);
  }
  const t = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: PASSWORD }),
  });
  const j = await t.json();
  if (!j.access_token) throw new Error(`sign-in failed: ${JSON.stringify(j)}`);
  return j.access_token;
}

async function api(tok, path, method = "GET", body) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: { ...(tok ? { Authorization: `Bearer ${tok}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let d = null; try { d = await r.json(); } catch {}
  return { status: r.status, d };
}

const inFeatured = (feat, title) =>
  (feat?.sections ?? []).some((s) => s.items.some((i) => i.title === title));

const tok = await auth();
note("provisioned admin + token", !!tok, ADMIN_EMAIL);

const draft = JSON.parse(readFileSync(new URL("./draft-grit.json", import.meta.url)));
const TITLE = draft.title;

// 1. Import as draft
const imp = await api(tok, "/api/admin/content/import", "POST", draft);
const id = imp.d?.content?.id;
note("import -> 201 draft created", imp.status === 201 && !!id, `id=${id} status=${imp.d?.content?.status}`);
note("imported row is status=draft", imp.d?.content?.status === "draft");
note("draft persisted its lessons", (imp.d?.lessons?.length ?? 0) === draft.lessons.length, `lessons=${imp.d?.lessons?.length}`);

// 2. Hidden from all public surfaces while draft
const feat0 = await api(tok, "/api/content/featured");
note("draft NOT in public featured feed", !inFeatured(feat0.d, TITLE));
const lib0 = await api(tok, "/api/content?limit=50");
note("draft NOT in public library", Array.isArray(lib0.d) && !lib0.d.some((c) => c.title === TITLE));
const det0 = await api(tok, `/api/content/${id}`);
note("draft content detail -> 404", det0.status === 404, `got ${det0.status}`);
const les0 = await api(tok, `/api/content/${id}/lessons`);
note("draft lessons list -> 404 (no leak)", les0.status === 404, `got ${les0.status}`);

// 3. Publish
const pub = await api(tok, `/api/admin/content/${id}/publish`, "POST");
note("publish -> ok", pub.status === 200 && pub.d?.ok === true);

// 4. Now visible + working lessons
const feat1 = await api(tok, "/api/content/featured");
note("published content NOW in featured feed", inFeatured(feat1.d, TITLE));
const det1 = await api(tok, `/api/content/${id}`);
note("published content detail -> 200 with key insights", det1.status === 200 && (det1.d?.keyInsights?.length ?? 0) > 0);
const les1 = await api(tok, `/api/content/${id}/lessons`);
const lessonId = les1.d?.[0]?.id;
note("lessons list loads", les1.status === 200 && Array.isArray(les1.d) && les1.d.length === draft.lessons.length, `count=${les1.d?.length}`);
const lesson = await api(tok, `/api/content/${id}/lessons/${lessonId}`);
const c = lesson.d?.content;
note("lesson detail has sections + quiz + summary",
  lesson.status === 200 && (c?.sections?.length ?? 0) > 0 && !!c?.quiz && !!c?.summaryCard,
  `sections=${c?.sections?.length} quiz=${!!c?.quiz} summary=${!!c?.summaryCard}`);

console.log("\n=== Phase 2 verification ===");
console.log(`content id: ${id} ("${TITLE}")`);
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("[FAIL]")).length;
console.log(`\n${failed === 0 ? "ALL PASS" : failed + " FAILED"}`);
process.exit(failed === 0 ? 0 : 1);
