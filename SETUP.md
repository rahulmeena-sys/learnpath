# LearnPath Setup

## Prerequisites

- Node.js LTS, version 18 or newer
- Git

No Android Studio is required for normal development. Browser development uses Expo Web, and Android builds will use EAS cloud builds.

## New Machine Setup

```bash
git clone <repo-url>
cd learnpath
./setup.sh
```

The setup script will:

1. Check Node and Git.
2. Create `.env` from `.env.example` if needed.
3. Install npm dependencies.
4. Create the Supabase schema and seed content.

If `.env` is created for the first time, fill in the values from the team, then run `./setup.sh` again.

## Windows

Run setup from Git Bash:

```bash
./setup.sh
```

## Start The App

```bash
npm run web
```

For Android preview later:

```bash
npm run android
```

## Reset The Database

```bash
npm run setup-db
```

This drops and recreates all app tables, then seeds starter books and lessons. Use it only when you are comfortable resetting local/dev Supabase data.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `DATABASE_URL` | Postgres connection string used only by setup scripts |

`.env` is ignored by git. Never commit real keys.

## Admin Access

The Admin tab only appears for profiles with `is_admin = true`.

For dev, set this manually in Supabase SQL editor after creating your account:

```sql
update profiles
set is_admin = true
where email = 'your-email@example.com';
```

Sign out and sign back in if the tab does not appear immediately.

## Project Structure

```text
App.tsx              app entry point
src/screens/         app screens
src/navigation/      tab navigator and auth gate
src/context/         AuthContext
src/hooks/           data hooks
src/lib/             Supabase client and shared types
src/theme.ts         colors, typography, spacing
scripts/            setup and database scripts
context/            project docs and Claude/Rahul context
reference/          old prototype, read-only reference
```
