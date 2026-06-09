# Tasks

## Phase 0 - Repo Cleanup And Context Setup

- [x] Created `context/` for project docs
- [x] Rewrote `CLAUDE.md` as the minimal session entry point
- [x] Decided stack: Expo + Supabase + RevenueCat + EAS Build
- [x] Dropped pnpm; npm only
- [x] Added root `README.md` for Rahul/Shubham project tracking
- [x] Added Rahul's Claude ramp-up context in `context/RAHUL.md`

## Phase 1 - Dev Environment And App Base

- [x] Expo 56 scaffolded in repo root
- [x] Dark theme and core screens: Auth, Onboarding, Home, Today, Library, Profile
- [x] Supabase client wired with `.env`
- [x] Database schema and seed data via `npm run setup-db`
- [x] `setup.sh` and `SETUP.md` for new machines
- [x] Root TypeScript check limited to the active Expo app, not `reference/`
- [ ] Verify full flow end-to-end in browser: register -> onboarding -> tabs
- [ ] Install/login EAS CLI: `npm i -g eas-cli` and `eas login`

## Phase 2 - Content Pipeline

- [x] Defined two workstreams: app and content creation
- [x] Added Claude book-content skill at `context/claude-book-skill/SKILL.md`
- [x] Added Admin tab for admin-only JSON ingest
- [x] Added Supabase `is_admin` flag and admin-only book/lesson write policies
- [ ] Create first real book content package using the Claude skill
- [ ] Review generated content with Rahul
- [ ] Publish reviewed package through Admin
- [ ] Decide the minimum lesson reader UX before building it

## Phase 3 - Core Learning Features

- [ ] Lesson/reading session screen: tap a book -> read lessons
- [ ] Progress saved to Supabase on lesson complete
- [ ] XP award on lesson complete
- [ ] Streak logic: increment on daily completion, reset if missed
- [ ] Google login, after Google Cloud client ID is ready

## Phase 4 - Subscription Infrastructure

- [ ] Google Play Console account, identity verification can take 1-2 days
- [ ] RevenueCat account and Play Console app link
- [ ] Install `react-native-purchases`
- [ ] Wire entitlement check
- [ ] Paywall screen for gated content

## Phase 5 - Play Store Release

- [ ] Replace Expo default app icon and splash screen
- [ ] EAS preview APK for phone testing
- [ ] EAS production AAB for Play Store
- [ ] Play Store listing: screenshots, description, category
- [ ] Internal testing track -> closed test -> production

---

Mark tasks `[x]` when done. Completed phases stay for reference.
