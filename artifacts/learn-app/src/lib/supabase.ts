import { createClient } from "@supabase/supabase-js";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Surfaced clearly in dev; the app can't authenticate without these.
  console.error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — set them in the root .env",
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: { persistSession: true, autoRefreshToken: true },
});

// Attach the current Supabase access token to every generated API request.
// This is the single seam that authenticates all data hooks — no per-page code.
setAuthTokenGetter(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});
