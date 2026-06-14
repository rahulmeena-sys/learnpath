# LearnPath

LearnPath is an Android-first habit tracker and book learning app. Users build a daily reading habit, work through curated book lessons, and earn XP/streak progress for consistency.

Goal: launch a simple, Play Store deployable app with a paid subscription. Keep the first version focused, small, and easy for Rahul to review.

## What We Are Building

There are two connected workstreams.

### 1. The App

The app is the product users will install from Google Play.

- Library: curated books, frameworks, and courses as short lessons
- Today: daily check-ins, reading tasks, streaks, and XP
- Home: personalized content feed
- Profile: level, XP, streak, and stats
- Admin: hidden admin workflow for adding book content

Current stack: Expo React Native, Supabase, RevenueCat later, EAS Build for Android builds.

### 2. The Content Pipeline

Book content is created separately, reviewed, then published into the app.

Current v1 workflow:

1. Rahul chooses a book and gives product/content direction.
2. Claude generates a structured JSON content package.
3. Rahul and Shubham review the output.
4. An admin pastes the approved JSON into the app Admin screen.
5. The book and lessons are saved in Supabase and appear in Library.

Later commercial version:

- Admin enters a book title/source notes.
- Claude or OpenAI API generates the content inside the app.
- Rahul reviews and publishes without developer help.

## Current Status

| Area | Status |
| --- | --- |
| Expo app scaffold | Done |
| Supabase auth | Done |
| Onboarding | Done |
| Home, Today, Library, Profile | Done |
| Database schema and seed data | Done |
| Admin content ingest stub | Done |
| Claude book-content skill | Done |
| Lesson reading session | Next |
| Subscription gate | Upcoming |
| Play Store build/release | Upcoming |

Full task tracking: [context/TASKS.md](context/TASKS.md)

## Goals

### v1.0 - Play Store Launch

- Users can register and finish onboarding.
- Users can browse books and complete lessons.
- XP and streaks work.
- Basic subscription gate exists.
- App can be built as an Android AAB through EAS.

### v1.1 - Content Expansion

- Rahul can add reviewed book content through Admin.
- Library grows to 20+ high-quality books/frameworks.
- Content quality checklist is stable.

### v1.2 - AI Content Pipeline

- Admin can request content generation inside the app.
- Claude/OpenAI API generates summaries and lessons.
- Rahul reviews, edits, and publishes without code.

## For Rahul

You do not need to read code. Your job is to guide product quality:

- Decide how the app should feel and what workflows should do.
- Pick books and explain why users need them.
- Review generated summaries, lessons, tasks, and tone.
- Test the app and call out confusing or boring parts.

Start here: [context/RAHUL.md](context/RAHUL.md)

## For Shubham

Claude/Codex session entry point: [CLAUDE.md](CLAUDE.md)

Common commands:

```bash
./setup.sh
npm run web
npm run setup-db
```

Setup guide: [SETUP.md](SETUP.md)

Repo map and current decisions: [context/REPO.md](context/REPO.md)
