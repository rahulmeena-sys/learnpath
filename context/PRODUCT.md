# Product — LearnPath

## Vision

A habit tracker + book/content learning app. Users build reading habits, track progress through books and lessons, and earn gamified rewards (streaks, XP, levels). AI features are post-MVP.

## Target

- **Platform:** Android (Google Play Store), first release
- **Monetisation:** Paid subscription via RevenueCat + Google Play Billing
- **User:** Single-user to start (no social/multiplayer features in MVP)

## MVP scope

### In
- Onboarding (preferences, goals)
- Content library (books, podcasts, frameworks — seeded, not user-uploaded)
- Daily habit tracking (streaks, check-ins)
- Lesson/reading sessions with progress tracking
- Basic gamification (XP, level, streak counter)
- Subscription gate (free tier: limited content; paid: full access)

### Out (post-MVP)
- AI-generated content or personalisation
- Social features
- iOS release
- User-uploaded content
- Push notifications (can add late MVP)

## Tech stack

| Layer | Choice | Reason |
|-------|--------|--------|
| App | Expo (React Native) | One codebase, Play Store ready, no native Android knowledge needed |
| Backend / Auth | Supabase | Already in repo, keep it |
| Subscriptions | RevenueCat | Handles Play Store billing, free tier, fast integration |
| Build / Distribution | EAS Build (cloud) | Builds AAB in cloud — no local Android SDK needed |
| Dev testing | Android Studio emulator | After enabling virtualisation in BIOS |

## Reference code

`artifacts/` contains the original React/Vite + Express prototype by Rahul (PM). It is **reference only** — not deployed, not active. Useful for: DB schema patterns, seeded content data, API route logic.
