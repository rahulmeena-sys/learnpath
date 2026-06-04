import { defineConfig } from "drizzle-kit";
import path from "path";
import { sslFromUrl } from "./src/ssl";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  // Use POSIX separators so drizzle-kit's glob works on Windows too.
  schema: path.join(__dirname, "./src/schema/index.ts").replace(/\\/g, "/"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    // Supabase requires TLS; sslFromUrl returns { rejectUnauthorized: false }
    // for hosted hosts (encrypted, chain not verified) and undefined locally.
    ssl: sslFromUrl(process.env.DATABASE_URL),
  },
});
