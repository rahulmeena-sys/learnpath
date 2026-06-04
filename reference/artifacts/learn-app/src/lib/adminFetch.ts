import { supabase } from "./supabase";

/**
 * fetch wrapper for the admin API (not part of the generated client). Attaches
 * the Supabase access token. Throws Error(message) on non-2xx.
 */
export async function adminFetch<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (json && (json.error as string)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}
