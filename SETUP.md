# LearnPath — Setup

## Prerequisites

- [Node.js LTS](https://nodejs.org) (18+)
- [Git](https://git-scm.com)

That's it. No Android Studio, no extra tools.

## New machine setup

```bash
git clone <repo-url>
cd learnpath
./setup.sh
```

The script will:
1. Check Node + git versions
2. Create `.env` from the template (first run only)
3. Install npm dependencies
4. Create the database schema in Supabase

If it's the first run, it'll pause and ask you to fill in `.env`. Get the values from the team, then run `./setup.sh` again.

### Windows
Run the script in **Git Bash** (comes with Git for Windows):
```bash
./setup.sh
```

## Start the app

```bash
npm run web       # browser — fastest for dev
npm run android   # Android device or emulator
```

## Reset the database

```bash
npm run setup-db
```

Drops and recreates all tables from scratch. Safe to run any time.

## Environment variables

| Variable | What it is |
|----------|------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `DATABASE_URL` | Postgres connection string (setup script only, never in app) |

Get all three from the team. See `.env.example` for the format.

## Project structure

```
App.tsx              ← app entry point
src/
  screens/           ← all screens (Home, Today, Library, Profile, Auth, Onboarding)
  navigation/        ← tab navigator + auth gate
  context/           ← AuthContext (Supabase session)
  data/              ← seeded books (local, no DB needed)
  lib/               ← supabase client, shared types
  theme.ts           ← colors, typography, spacing
scripts/
  setup-db.mjs       ← DB schema script (run via npm run setup-db)
reference/           ← Rahul's original prototype (read-only reference)
context/             ← project documentation (PRODUCT.md, TASKS.md, etc.)
```
