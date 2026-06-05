const SUPA = process.env.SUPA_URL, PUB = process.env.PUB, API = process.env.API ?? "http://localhost:8080";
const signIn = async (email) => {
  const r = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Test123456" }),
  });
  return (await r.json()).access_token;
};
const api = async (tok, path) => {
  const r = await fetch(`${API}${path}`, { headers: tok ? { Authorization: `Bearer ${tok}` } : {} });
  let d = null; try { d = await r.json(); } catch {}
  return { status: r.status, d };
};
const tok = await signIn(process.env.EMAIL);
const feat = await api(tok, "/api/content/featured");
const seeded = (feat.d?.sections ?? []).reduce((n, s) => n + s.items.length, 0);
const adminList = await api(tok, "/api/admin/content");
console.log(`[${feat.status === 200 && seeded > 0 ? "PASS" : "FAIL"}] published seeded content still served (items across sections: ${seeded})`);
console.log(`[${adminList.status === 403 ? "PASS" : "FAIL"}] non-admin -> /api/admin/content = ${adminList.status} (expect 403)`);
