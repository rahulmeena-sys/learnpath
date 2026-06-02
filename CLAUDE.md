# LearnPath — Personalized Learning Platform

A single-user personalized learning and implementation platform. Users go through an onboarding quiz, then get curated content (books, podcasts, philosophy, frameworks), interactive learning sessions with quizzes, visual summary cards, implementation roadmaps, and gamification (XP, streaks, levels, achievements).

## Monorepo structure

```
/
├── artifacts/
│   ├── api-server/        # Express 5 REST API
│   └── learn-app/         # React + Vite frontend
├── lib/
│   ├── db/                # Drizzle ORM schema, migrations, seed
│   ├── api-spec/          # OpenAPI spec (source of truth)
│   ├── api-zod/           # Generated Zod request/response schemas
│   └── api-client-react/  # Generated React Query hooks
└── pnpm-workspace.yaml
```

## Running the project

```bash
# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (port 22464)
pnpm --filter @workspace/learn-app run dev

# Push DB schema changes
pnpm --filter @workspace/db run push

# Seed the database
pnpm --filter @workspace/db run seed

# Typecheck everything
pnpm run typecheck
```

## Architecture decisions

**Single-user, no auth.** There is no authentication. All API routes use `DEFAULT_USER_ID = 1`. The user record is created automatically on first request via `getOrCreateDefaultUser()` in `artifacts/api-server/src/routes/helpers.ts`. Do not add auth without rethinking all routes.

**API-first with codegen.** The API contract lives in `lib/api-spec/`. Zod schemas (`lib/api-zod/`) and React Query hooks (`lib/api-client-react/`) are generated from it. After changing the OpenAPI spec, regenerate: `pnpm --filter @workspace/api-zod run generate && pnpm --filter @workspace/api-client-react run generate`.

**Drizzle ORM.** The database layer is in `lib/db/src/`. The main `db` export (from `lib/db/src/index.ts`) includes the full schema for Drizzle's query API (`db.query.*`). Adding a new table means: create a schema file in `lib/db/src/schema/`, export it from `lib/db/src/schema/index.ts`, then run `pnpm --filter @workspace/db run push`.

## Database schema

Tables in `lib/db/src/schema/`:

| File | Tables |
|------|--------|
| `users.ts` | `usersTable` |
| `content.ts` | `contentTable` |
| `lessons.ts` | `lessonsTable` |
| `sessions.ts` | `sessionsTable` |
| `progress.ts` | `contentProgressTable`, `lessonProgressTable` |
| `saved_cards.ts` | `savedCardsTable` |
| `roadmaps.ts` | `roadmapsTable`, `dailyTasksTable` |
| `achievements.ts` | `achievementsTable`, `userAchievementsTable`, `xpHistoryTable` |

## API routes

All registered in `artifacts/api-server/src/routes/index.ts`:

| File | Base path | Purpose |
|------|-----------|---------|
| `onboarding.ts` | `/api/onboarding` | Complete onboarding quiz |
| `content.ts` | `/api/content` | Featured feed, library, content detail |
| `lessons.ts` | `/api/lessons` | Individual lesson data |
| `sessions.ts` | `/api/sessions` | Start session, complete lesson, submit quiz |
| `saved-cards.ts` | `/api/saved-cards` | Save/delete summary cards |
| `roadmaps.ts` | `/api/roadmaps` | Create/view/update roadmaps and daily tasks |
| `profile.ts` | `/api/profile` | User stats, achievements, XP history |
| `daily-feed.ts` | `/api/daily-feed` | Today's agenda and tasks |

## Frontend pages

All pages in `artifacts/learn-app/src/pages/`:

| Page | Route | Notes |
|------|-------|-------|
| `onboarding.tsx` | `/` | 4-step animated quiz |
| `home.tsx` | `/home` | Curated sections, horizontal scroll tiles |
| `today.tsx` | `/today` | Daily agenda, streak calendar |
| `library.tsx` | `/library` | Grid with type filters and search |
| `content-detail.tsx` | `/content/:contentId` | Key insights, lesson list, session duration picker |
| `learn-session.tsx` | `/learn/:sessionId` | Animated lesson sections + inline quiz |
| `learn-summary.tsx` | `/learn/:sessionId/summary` | Summary card, XP earned |
| `roadmaps.tsx` | `/roadmaps` | Active roadmaps list |
| `roadmap-detail.tsx` | `/roadmaps/:roadmapId` | Daily tasks, progress ring |
| `saved-cards.tsx` | `/saved` | Grid of saved summary cards |
| `profile.tsx` | `/profile` | Level, stats, XP chart, achievements |

Pages wrapped in `<AppLayout>` (bottom nav) get the bottom navigation bar. Detail/flow pages do not.

## Design system

- **Dark theme only.** Background: `240 10% 4%` (near-black). Defined in `artifacts/learn-app/src/index.css` as CSS custom properties.
- **Primary color:** `262 83% 58%` — purple (`#7c3aed`)
- **Accent color:** `190 90% 50%` — cyan (`#06b6d4`)
- **Animations:** framer-motion throughout for page transitions, lesson steps, quiz feedback, and XP pop effects.
- **No emojis** in the UI.
- **Charts:** recharts (used for XP history on profile page).
- **Routing:** wouter with `base={import.meta.env.BASE_URL}`.

## Seeded content

8 items: Atomic Habits (James Clear), Deep Work (Cal Newport), The Psychology of Money (Morgan Housel), Meditations (Marcus Aurelius), The 5 AM Club (Robin Sharma), Thinking Fast and Slow (Daniel Kahneman), How to Build Confidence, The PARA Method (Tiago Forte).

Each has 4–5 lessons with sections (text/insight/quote/challenge/reflection), a quiz question, and a summary card. 9 achievements are seeded.

## Common tasks

**Add a new API endpoint:**
1. Add the route handler to the appropriate file in `artifacts/api-server/src/routes/`
2. Add the OpenAPI path to `lib/api-spec/` and regenerate Zod + client
3. Use the generated hook in the frontend page

**Add a new DB table:**
1. Create `lib/db/src/schema/<name>.ts`
2. Export from `lib/db/src/schema/index.ts`
3. Run `pnpm --filter @workspace/db run push`

**Add a new frontend page:**
1. Create `artifacts/learn-app/src/pages/<name>.tsx`
2. Import and add a `<Route>` in `artifacts/learn-app/src/App.tsx`
3. Wrap in `<AppLayout>` if it needs the bottom nav
