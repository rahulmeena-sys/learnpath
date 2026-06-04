# Tasks

## Phase 0 — Repo cleanup + context setup ✓
- [x] Deleted noise MD files, created context/ folder
- [x] Rewrote CLAUDE.md as minimal entry point
- [x] Decided stack: Expo + Supabase + RevenueCat + EAS Build
- [x] Dropped pnpm — npm only

## Phase 1 — Dev environment ✓
- [x] Node.js v24, npm installed
- [x] Expo 56 scaffolded in repo root (blank-typescript)
- [x] Dark theme, all screens written: Auth, Onboarding, Home, Today, Library, Profile
- [x] Supabase client wired + .env configured
- [x] DB created (profiles, user_progress, check_ins) via npm run setup-db
- [x] setup.sh + SETUP.md for onboarding new machines
- [ ] EAS CLI: `npm i -g eas-cli` + `eas login` (expo.dev free account)
- [ ] **Verify full flow end-to-end** — register → onboarding → home tabs working in browser

## Phase 2 — Subscription infrastructure
- [ ] Google Play Console account (~$25 one-time, needs identity verification — start this now, takes 1-2 days)
- [ ] RevenueCat account (free) + link to Play Console app
- [ ] Install `react-native-purchases` + wire entitlement check
- [ ] Paywall screen (shown to free users on gated content)

## Phase 3 — Content + core features
- [ ] Lesson/reading session screen (tap a book → start reading)
- [ ] Progress saved to Supabase on lesson complete
- [ ] Streak logic (increment on daily check-in, reset if missed)
- [ ] XP award on lesson complete
- [ ] Google login (Google Cloud Console client ID pending)

## Phase 4 — Play Store release
- [ ] App icon + splash screen (replace Expo defaults)
- [ ] `eas build --platform android --profile production` → AAB
- [ ] Play Store listing (screenshots, description, category)
- [ ] Internal testing track → closed test → production

---
_Mark tasks [x] as done. Completed phases stay for reference._
