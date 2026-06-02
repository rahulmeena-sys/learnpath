---
name: LearnPath Architecture
description: Key decisions for the LearnPath personalized learning platform
---

## Stack
- Express 5 API at `/api` (port 8080), React+Vite frontend at `/` (port 22464)
- Drizzle ORM + PostgreSQL, api-zod for request validation, api-client-react for React Query hooks
- framer-motion animations, recharts for XP chart, wouter for routing

## Single-user system
- No auth — DEFAULT_USER_ID=1, created on first request via `getOrCreateDefaultUser()` in routes/helpers.ts
- User is created during onboarding (POST /onboarding) or automatically on any API call

## DB schema files
- lib/db/src/schema/ — users, content, lessons, sessions, progress, saved_cards, roadmaps, achievements
- Each file exports its table + Zod insert schema
- lib/db/src/schema/index.ts re-exports everything

## Routes
- All routes registered in artifacts/api-server/src/routes/index.ts
- Route files: onboarding, content, lessons, sessions, saved-cards, roadmaps, profile, daily-feed
- Zod body schemas imported from @workspace/api-zod

## Frontend pages
- 11 pages in artifacts/learn-app/src/pages/: onboarding, home, library, content-detail, learn-session, learn-summary, roadmaps, roadmap-detail, saved-cards, today, profile
- Dark theme: background #0a0a10, primary #7c3aed (purple), accent #06b6d4 (cyan)

**Why DEFAULT_USER_ID approach:** No auth is required for MVP; single-user simplifies all routes and avoids auth complexity.
