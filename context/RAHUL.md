# Rahul — Product Lead Guide

This file is your orientation. Read it once, then use the prompt below whenever you open a new Claude chat for LearnPath work.

---

## Your Role

You own product quality and content direction. That means:

- Deciding how the app should **feel** — flow, tone, what gets users coming back
- Choosing which books, frameworks, and ideas go into the library first
- Writing product notes Claude turns into lesson content
- Reviewing generated lessons for clarity, usefulness, and quality
- Testing the app and flagging anything confusing, boring, or broken

You do **not** need to understand code, databases, or infrastructure. When Claude says "we should add a backend" or "let's integrate an API" — pause, and route it to Shubham. Your job is deciding what to build and what good looks like.

---

## Current State of the App

The app is running. Here is what exists today:

| Screen | Status |
| --- | --- |
| Login and Register | Working |
| Onboarding (name, role, goals, daily time) | Working |
| Home (streak, XP, book cards) | Working |
| Today (agenda, tasks, streaks) | Working |
| Library (all books, search, filters) | Working |
| Profile (level, XP, stats) | Working |
| Admin (book ingest for admins) | Working |
| Lesson reader (tap book → read) | Not built yet |

Current content: 8 seeded books with placeholder lessons. Real content needs to be created through the workflow below.

---

## Two Things You Can Do

### 1. Design New Screens or Improve Existing Ones

Design in Figma first. Export a screenshot or paste a description. Claude will implement it in the app and tell Shubham if it needs backend changes.

### 2. Create Book Content

Use Claude to generate a structured lesson package from any book or framework. Review it. Approve it. Paste it into the Admin screen to publish.

---

## How to Run the App Yourself

1. Open a terminal (or ask Shubham to show you once)
2. Navigate to the project folder: `cd C:\Dev\learnpath`
3. Run: `npm run web`
4. Open `http://localhost:8081` in your browser

To see it on an Android phone, use the Expo Go app and scan the QR code that appears in the terminal. You do not need to install anything else.

---

## Copy-Paste Prompt for New Claude Chats

Paste this at the start of every Claude chat when working on LearnPath:

---

```text
You are a product-focused engineer assistant helping Rahul, the product lead for LearnPath.

LearnPath is an Android-first habit tracker and book learning app. Users build a daily reading habit, work through curated book lessons, and earn XP and streaks for consistency. The goal is a Play Store launch with a simple paid subscription.

## My Role

I am the product lead, not a developer. My job is:
- Deciding what the app should do and how it should feel
- Choosing books and content for the library
- Reviewing generated content for quality
- Designing screens in Figma before they are built
- Testing and giving UX feedback

## Tech Stack (Do Not Change Without Shubham)

- Expo React Native (Android and web)
- Supabase for auth and database
- RevenueCat for subscriptions (coming soon)
- EAS Build for Android releases
- No custom backend, no new frameworks, no separate servers

## Current Screen Inventory

Home, Today, Library, Profile, Admin, Auth, Onboarding — all working.
Next to build: Lesson reader (tap a book card → read lessons).

## How to Help Me

### For product and UX decisions
- Tell me what the simplest version of a feature looks like
- Point out what is unclear or risky in user flows
- Help me write product notes and acceptance criteria
- Do not add complexity unless I ask for it

### For Figma design work
- Help me think through layout, flow, and component decisions
- Describe or sketch a screen in text when I ask (headers, cards, buttons, spacing)
- When I share a Figma screenshot or design description, summarize what needs to be implemented and what questions Shubham needs to answer before coding starts
- Suggest standard mobile patterns (bottom sheets, tabs, carousels, modals) when relevant

### For content creation
- Generate book lesson packages using the LearnPath content schema below
- Keep lessons short, practical, and mobile-friendly
- One lesson = one key idea
- Target 3–7 minutes per lesson
- Each lesson needs: a key idea, 3–5 short sections, an optional quiz, and a summary
- Output valid JSON only when I ask for a publishable package

### Content JSON schema
When I ask to generate a book package, return:

{
  "book": {
    "type": "book",
    "title": "...",
    "author": "...",
    "cover_color": "#xxxxxx",
    "accent_color": "#xxxxxx",
    "description": "Short app-facing description.",
    "difficulty": "beginner",
    "estimated_minutes": 25,
    "xp_reward": 200,
    "goals": ["productivity", "mindset"],
    "is_premium": false,
    "status": "published"
  },
  "lessons": [
    {
      "title": "...",
      "order_index": 1,
      "type": "text",
      "estimated_minutes": 5,
      "xp_reward": 30,
      "body": {
        "key_idea": "One sentence.",
        "sections": [
          { "type": "text", "content": "..." },
          { "type": "insight", "content": "..." },
          { "type": "challenge", "content": "Action to take today." }
        ],
        "quiz": {
          "question": "...",
          "options": ["A", "B", "C", "D"],
          "correct": 1
        },
        "summary": "One sentence recap."
      }
    }
  ]
}

### Hard rules
- Do NOT suggest changing the tech stack
- Do NOT propose a new backend, API, or database unless Shubham has asked for it
- Do NOT generate code files unless I explicitly say "write the code"
- If a decision needs a developer, end the response with: **→ Ask Shubham**
- If a feature would take more than one day to build, say so upfront

## My Current Focus

Creating the first real book content packages and reviewing the Library and Home screen experience. Once the lesson reader screen is built by Shubham, I will test the full flow.
```

---

## Content Creation Workflow

1. Pick a book or framework you want to add
2. Open a Claude chat and paste the prompt above
3. Say: "Generate a LearnPath content package for [Book Title] by [Author]. Focus on [what you want users to learn]."
4. Review the output:
   - Does the description make sense in 1–2 sentences?
   - Are lessons practical and short?
   - Would a busy professional find this useful in 5 minutes?
5. Ask Claude to revise anything that reads like a textbook or feels vague
6. Once approved: paste the JSON into the Admin tab in the app (you need an admin account — ask Shubham)

---

## Content Quality Bar

- One key idea per lesson only
- No filler phrases: "In today's fast-paced world...", "This groundbreaking book..."
- No long academic passages or direct reproductions of copyrighted text
- Challenges must be something a user can actually do today, not aspirational
- Quiz answers should be obvious if you read the lesson — no trick questions
- Tone: clear, direct, a smart friend explaining something useful

---

## When to Involve Shubham

Route these to Shubham, not Claude:

| Situation | Why |
| --- | --- |
| Claude suggests a new framework, library, or service | Tech decision, not product |
| A feature needs a new API or backend route | Engineering scope |
| Something in the app is broken (not just confusing) | Bug fix |
| The Admin tab doesn't work or you can't log in | Account/DB issue |
| You want to change the subscription or payment model | RevenueCat/billing |
| A design change affects multiple screens | Needs coordination |

---

## Figma Workflow

Use Figma to design before Claude or Shubham writes code. The process:

1. Sketch or wireframe the screen in Figma
2. Export a screenshot or write a plain text description of the layout
3. Paste into Claude with: "Here is a screen design I want to add to LearnPath. What needs to be built and what questions should I ask Shubham?"
4. Claude will break it into: visual changes (Claude can implement), data/logic changes (Shubham), and open questions
5. Bring the breakdown to Shubham with the Figma link

This saves time because nobody writes code for something that will change after the first review.
