// Phase 1 verification: proves auth + per-user isolation + IDOR fix.
// Secrets come from env (not hardcoded): SUPA_URL, PUB, SECRET, API.
// Run server-side (the sb_secret_ key is blocked in browsers).
const SUPA = process.env.SUPA_URL;
const PUB = process.env.PUB;
const SECRET = process.env.SECRET;
const API = process.env.API ?? "http://localhost:8080";

const ok = (b) => (b ? "PASS" : "FAIL");
const results = [];
const note = (label, pass, extra = "") => {
  results.push(`[${ok(pass)}] ${label}${extra ? " — " + extra : ""}`);
};

async function adminCreate(email) {
  const r = await fetch(`${SUPA}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Test123456", email_confirm: true }),
  });
  if (!r.ok) throw new Error(`adminCreate ${email}: ${r.status} ${await r.text()}`);
  return r.json();
}
async function signIn(email) {
  const r = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Test123456" }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error(`signIn ${email}: ${JSON.stringify(j)}`);
  return j.access_token;
}
async function api(token, path, method = "GET", body) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await r.json(); } catch {}
  return { status: r.status, data };
}

const ts = Date.now();
const emailA = `lp.alice.${ts}@gmail.com`;
const emailB = `lp.bob.${ts}@gmail.com`;

await adminCreate(emailA);
await adminCreate(emailB);
const tokA = await signIn(emailA);
const tokB = await signIn(emailB);
note("created + signed in two users", !!tokA && !!tokB);

// unauth still blocked
const unauth = await api(null, "/api/profile");
note("unauthenticated /api/profile -> 401", unauth.status === 401, `got ${unauth.status}`);

// distinct identities
const pA = await api(tokA, "/api/profile");
const pB = await api(tokB, "/api/profile");
note("two users map to distinct app ids", pA.data?.id && pB.data?.id && pA.data.id !== pB.data.id,
  `A=${pA.data?.id} B=${pB.data?.id}`);

// A onboards + creates data
await api(tokA, "/api/onboarding", "POST", { name: "Alice", role: "student", goals: ["focus"], learningStyle: "mixed", dailyMinutes: 10 });
const lessons = await api(tokA, "/api/content/1/lessons");
const lessonId = lessons.data?.lessons?.[0]?.id ?? lessons.data?.[0]?.id;
const savedA = await api(tokA, "/api/saved-cards", "POST", { contentId: 1, lessonId });
const rmA = await api(tokA, "/api/roadmaps", "POST", { contentId: 1, durationDays: 30 });
const roadmapId = rmA.data?.id;
const rmDetail = await api(tokA, `/api/roadmaps/${roadmapId}`);
const taskId = rmDetail.data?.todaysTasks?.[0]?.id;
note("A created roadmap + saved card", !!roadmapId && savedA.status < 300, `roadmapId=${roadmapId} savedStatus=${savedA.status}`);

// B sees none of A's data
const rmListB = await api(tokB, "/api/roadmaps");
const cardsB = await api(tokB, "/api/saved-cards");
note("B sees 0 roadmaps", Array.isArray(rmListB.data) && rmListB.data.length === 0, `count=${rmListB.data?.length}`);
note("B sees 0 saved cards", Array.isArray(cardsB.data) && cardsB.data.length === 0, `count=${cardsB.data?.length}`);
note("B profile not onboarded / not Alice", pB.data?.onboardingComplete === false && pB.data?.name !== "Alice", `name=${pB.data?.name}`);

// B cannot read A's roadmap by id
const stealRead = await api(tokB, `/api/roadmaps/${roadmapId}`);
note("B cannot read A's roadmap by id -> 404", stealRead.status === 404, `got ${stealRead.status}`);

// IDOR: B cannot complete A's task
let idor = { status: "n/a" };
if (taskId) {
  idor = await api(tokB, `/api/roadmaps/${roadmapId}/tasks/${taskId}/complete`, "POST");
  note("B cannot complete A's task (IDOR) -> 404", idor.status === 404, `got ${idor.status}`);
}

// positive: A CAN complete own task
if (taskId) {
  const legit = await api(tokA, `/api/roadmaps/${roadmapId}/tasks/${taskId}/complete`, "POST");
  note("A can complete own task -> 2xx", legit.status >= 200 && legit.status < 300, `got ${legit.status}`);
}

console.log("\n=== Phase 1 verification ===");
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("[FAIL]")).length;
console.log(`\n${failed === 0 ? "ALL PASS" : failed + " FAILED"}`);
