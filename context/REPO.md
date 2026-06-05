# Repo Map

## Active structure

```
/
├── App.tsx            ← Expo app entry (root screen)
├── index.ts           ← app registration
├── app.json           ← Expo config (app name, slug, icons)
├── package.json       ← npm dependencies
├── tsconfig.json      ← TypeScript config
├── assets/            ← images, icons, splash screen
├── context/           ← all project MD files
│   ├── AGENT.md       ← working style + engineering principles
│   ├── PRODUCT.md     ← vision, MVP scope, tech stack
│   ├── REPO.md        ← this file
│   └── TASKS.md       ← active tasks and status
├── CLAUDE.md          ← entry point, tells Claude to load context/
└── reference/         ← Rahul's prototype (read-only, do not modify)
    ├── artifacts/     ← Express API + React/Vite frontend
    └── lib/           ← Drizzle ORM schema, OpenAPI spec
```

## Reference code (do not modify)

Useful references in `reference/`:
- `reference/lib/db/src/schema/` — table definitions to adapt for Supabase
- `reference/artifacts/api-server/src/routes/` — API logic patterns
- `reference/artifacts/learn-app/src/pages/` — screen/UX flow reference

## Dev environment

**Keep it light — no heavy installs.**

| Tool | Status | Notes |
|------|--------|-------|
| Node.js 24 LTS | Installed | Includes npm + npx |
| Expo 56 | Via npx | No global install needed |
| EAS CLI | To install | `npm i -g eas-cli` (one-time) |
| Android Studio | Not installed | Not needed |
| Android SDK | Not installed | EAS builds in cloud |

**Machines:** Shubham (primary, Windows 11, i7-10750H), Rahul (secondary — same Node install + git clone)

## Testing strategy

- Day-to-day dev: `npx expo start --web` — browser, zero extra setup
- Android preview: EAS Build → APK → sideload on physical device
- No emulator, no BIOS changes needed

## Key commands

```bash
# Start dev server (browser)
npx expo start --web

# Cloud build — APK for testing (sideload on phone)
eas build --platform android --profile preview

# Cloud build — AAB for Play Store
eas build --platform android --profile production
```

## Environment variables

Create `.env` at root (never commit):
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=
```
