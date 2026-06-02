---
name: LearnPath Seed
description: How to seed the LearnPath database with content and achievements
---

## Run seed
```
pnpm --filter @workspace/db run seed
```

## Requirements
- tsx must be installed in lib/db devDependencies (add with `pnpm --filter @workspace/db add -D tsx`)
- Seed script lives at lib/db/src/seed.ts
- Script imports from ./index.js (relative, not workspace alias)

## Content seeded
8 items: Atomic Habits, Deep Work, Psychology of Money, Meditations, The 5 AM Club, Thinking Fast and Slow, How to Build Confidence, The PARA Method
Each has 4-5 lessons with sections, quiz, and summary card.
9 achievements seeded in achievements table.

**Why:** Running tsx from outside a workspace package fails ERR_MODULE_NOT_FOUND for @workspace/* imports. Must run from within the package that owns the dependency.
