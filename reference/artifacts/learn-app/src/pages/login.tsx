import { useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Minimal, intentionally-unpolished auth screen. Isolated in one file so it can
 * be restyled or replaced wholesale once the product UI is finalized. Email +
 * password and Google; the AuthProvider reacts to the resulting session.
 */
export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) setInfo("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">LearnPath</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-accent">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          className="w-full rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="font-medium text-primary hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
