import { z } from "zod";

/**
 * Validated, typed application configuration.
 *
 * Importing this module validates `process.env` once at boot. If anything is
 * missing or malformed the process exits with a clear message instead of
 * failing in some confusing way deep inside a request later on.
 *
 * Import this BEFORE anything that reads env (db, logger) so validation runs
 * first — see src/index.ts.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  // Comma-separated list of allowed origins. Omit to allow all (dev only).
  CORS_ORIGIN: z.string().optional(),
  // Supabase project URL — used to derive the JWKS endpoint + token issuer for
  // verifying auth JWTs. Required in production; optional in dev so the server
  // can still boot without auth configured.
  SUPABASE_URL: z.string().url().optional(),
  // Anthropic API key for AI content generation. Optional at boot; the admin
  // generate endpoint returns 503 if it's missing.
  ANTHROPIC_API_KEY: z.string().optional(),
  // Comma-separated admin email allowlist (for the content pipeline).
  ADMIN_EMAILS: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(env)"}: ${i.message}`)
    .join("\n");
  // Use console here, not the logger (the logger depends on this config).
  console.error(`\n✖ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

const env = parsed.data;

// SUPABASE_URL is mandatory in production (auth can't work without it).
if (env.NODE_ENV === "production" && !env.SUPABASE_URL) {
  console.error("\n✖ SUPABASE_URL is required in production (auth JWT verification).\n");
  process.exit(1);
}

const supabaseUrl = env.SUPABASE_URL?.replace(/\/$/, "");

export const config = {
  ...env,
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  /** Parsed CORS allowlist, or undefined to allow all origins. */
  corsOrigins: env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined,
  /** Supabase auth config derived from SUPABASE_URL (undefined if unset). */
  supabaseAuth: supabaseUrl
    ? {
        jwksUrl: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
        issuer: `${supabaseUrl}/auth/v1`,
      }
    : undefined,
  /** Lowercased admin email allowlist. */
  adminEmails: env.ADMIN_EMAILS
    ? env.ADMIN_EMAILS.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    : [],
} as const;

export type Config = typeof config;
