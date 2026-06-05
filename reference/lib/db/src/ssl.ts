import type { PoolConfig } from "pg";

/**
 * Derive the `pg` SSL option from a connection string.
 *
 * Supabase (and most hosted Postgres) require TLS, but their pooler presents a
 * cert chain Node doesn't trust out of the box, which throws
 * SELF_SIGNED_CERT_IN_CHAIN. The connection stays encrypted; we just skip chain
 * verification. Local/plain Postgres (no sslmode, not a hosted host) gets no SSL.
 */
export function sslFromUrl(url: string | undefined): PoolConfig["ssl"] {
  if (!url) return undefined;
  const needsSsl =
    /[?&]sslmode=(require|prefer|verify-ca|verify-full|no-verify)/.test(url) ||
    /\.(supabase|neon|render|railway)\.(co|com|tech|app)/.test(url);
  return needsSsl ? { rejectUnauthorized: false } : undefined;
}
