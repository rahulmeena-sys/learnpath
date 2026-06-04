# LearnPath — UI Specification (for mockup generation)

This document describes every screen of **LearnPath**, a personalized learning
& implementation mobile app, in enough detail to generate UI mockups. Paste this
into any design tool / LLM and ask it to produce mockups for a given screen.

---

## 1. Product summary

LearnPath is a **single-user, mobile-first** learning app. The user completes a
short onboarding quiz, then receives curated content (books, podcasts, philosophy,
frameworks, courses). They learn through bite-sized animated lessons with inline
quizzes, collect visual summary cards, build 30/60/90-day implementation roadmaps,
and stay motivated via gamification (XP, daily streaks, levels, achievements).

**Tone:** premium, focused, calm-but-energetic. Think a blend of Duolingo's
gamification, Headspace's calm, and Blinkist's content cards — in a dark theme.

---

## 2. Global design system

**Theme: dark only.** All values are HSL.

| Token | HSL | Hex (approx) | Use |
|-------|-----|--------------|-----|
| Background | `240 10% 4%` | `#0a0a0f` | App background (near-black) |
| Foreground | `0 0% 98%` | `#fafafa` | Primary text |
| Card | `240 10% 6%` | `#0f0f14` | Card / surface background |
| Border | `240 10% 12%` | `#1e1e2a` | Card borders, dividers |
| Secondary | `240 10% 12%` | `#1e1e2a` | Subtle fills, progress track |
| Muted foreground | `240 5% 65%` | `#9ca3af` | Secondary / helper text |
| **Primary** | `262 83% 58%` | `#7c3aed` | Purple — buttons, accents, active state |
| **Accent** | `190 90% 50%` | `#06b6d4` | Cyan — gradients, highlights |
| Destructive | `0 84% 60%` | `#ef4444` | Errors, delete |

**Semantic status colors** (used for tags/feedback):
orange `#f97316` (streak/challenge), green `#22c55e` (correct/action/done),
red `#ef4444` (wrong), blue `#3b82f6` (reflection), yellow `#eab308` (achievement/review),
purple `#a855f7` (habit), cyan `#06b6d4` (mini-game/visual).

**Typography:** Inter (sans). Headings bold/black, tight tracking. Body 13–15px.
Labels often `text-xs uppercase tracking-widest text-muted-foreground`.

**Shape & spacing:** base radius `0.75rem`. Cards use `rounded-2xl` (~16px),
buttons/inputs `rounded-xl` (~12px), pills/tags `rounded-full`. Generous padding
(`p-4`/`p-5`), vertical rhythm via `space-y-3`/`space-y-6`. Page horizontal padding `px-5`.

**Shadows:** soft, primarily colored glows on primary buttons
(`shadow-lg shadow-primary/30`).

**Motion (framer-motion):** content fades/slides up on mount (`y: 20 → 0`),
staggered list items (~60ms delay each), buttons scale to 0.97 on tap, progress
bars animate width from 0, XP "+N" floats up and fades. Page transitions are quick (300–400ms).

**Layout frame:**
- Mobile-first, single column. Content max-width ~`max-w-lg` centered on larger screens.
- **Bottom navigation** (fixed, frosted/blurred bg, top border, height 64px,
  `max-w-md` centered). 5 tabs, each an icon + label; active tab is purple with a
  soft `bg-primary/10` rounded pill behind the icon, inactive is muted gray.
  Order: **Today** (compass), **Home** (home), **Library** (library), **Roadmaps** (map), **Profile** (user).
- Detail/flow screens (content detail, learn session, summary, roadmap detail,
  saved cards) are full-screen and **do not** show the bottom nav; they have their
  own back button.
- Content "covers" have no images — they're **diagonal gradient blocks**
  (`linear-gradient(135deg, coverColor, accentColor)`) with a dark overlay and
  white text. Each content item has its own `coverColor` + `accentColor`.

**Iconography:** lucide-react line icons, ~16–20px.

---

## 3. Screens

> Notation: each screen lists its regions top→bottom and the elements inside.

### 3.1 Onboarding — route `/` (full screen, no nav)
A 4-step animated quiz. One question per step, vertically centered, with a fixed
bottom CTA. Steps slide horizontally/vertically between transitions.

- **Top:** row of progress dots (4). Current step = elongated purple pill; completed
  = purple; upcoming = dim gray.
- **Center (changes per step):** centered title (bold 2xl) + muted subtitle, then the input:
  - **Step 1 — "What should we call you?"** / "Personalize your experience":
    single large text input, placeholder "Your name".
  - **Step 2 — "What best describes you?"** / "We'll tailor your content":
    2-column grid of role buttons: Student, Professional, Entrepreneur, Creator,
    Researcher, Other. Selected = filled purple with glow; unselected = card with border.
  - **Step 3 — "What do you want to improve?"** / "Select all that apply":
    wrapping pill multi-select: Productivity, Focus & Deep Work, Confidence,
    Leadership, Relationships, Creativity, Mindset, Health & Habits, Finance,
    Communication. Selected pills = filled purple.
  - **Step 4 — "How much time can you commit?"** / "We'll design your daily sessions":
    vertical list of 4 options, each a row with label + sub-label:
    "5 min / day — Quick wins", "10 min / day — Steady progress",
    "20 min / day — Deep learner", "30 min / day — Committed". Selected = `primary/10` fill + purple border.
- **Bottom:** full-width primary button ("Continue", last step "Start Learning",
  loading "Setting up…"), disabled until the step is valid. From step 2 on, a
  muted text "Back" link below it.

### 3.2 Home — route `/home` (with bottom nav)
A curated feed of horizontally-scrolling content tiles.

- **Header:** greeting "Good morning" (muted) + the user's name (bold 2xl).
- **Stats bar:** two side-by-side stat cards:
  - Streak: orange flame icon chip + "{N}" big + "Day streak".
  - XP: purple lightning icon chip + "{N}" big + "Total XP".
- **Today's goal card:** label "Today's goal" + "{x}/{goal} XP" in purple; a thin
  progress bar with a purple→cyan gradient fill.
- **"Continue Learning" section** (only if in-progress items exist): row header with
  a "See all ›" link to Library; horizontal scroll of content tiles.
- **Curated sections** (repeated): each has a bold title + muted subtitle (e.g.
  "For Your Goals — Handpicked for your journey") and a horizontal scroll row of tiles.
  - **Content tile:** ~176px wide, ~224px tall, rounded-2xl gradient cover with dark
    overlay. Top-left: small uppercase type pill ("BOOK"/"PODCAST"…) on a dark chip.
    Top-right: circular progress ring with % (only if started). Bottom: bold white
    title (2 lines max), muted author, and a small frosted pill button with a play
    icon — "Begin" or "Continue".
  - Loading state: shimmering gray skeleton rows of tiles.
- **Library shortcut card:** full-width card, book icon chip + "Full Library" /
  "Books, podcasts, frameworks & more" + chevron.

### 3.3 Today — route `/today` (with bottom nav)
The daily agenda and streak.

- **Header:** uppercase date (e.g. "TUESDAY, JUNE 3") + greeting (bold 2xl, e.g. "Good morning").
- **Streak card:** flame icon + "{N} day streak"; below it a row of 7 day-squares
  labeled M T W T F S S — active days filled orange with white letter, inactive gray.
- **Daily XP goal card:** "Daily XP Goal" with lightning icon + "{x}/{goal}"; gradient progress bar.
- **"Today's Agenda" list:** stacked feed cards. Each card has a colored left
  icon chip, a bold title, a muted description, and (if any) an XP reward badge
  ("⚡{N}") on the right. Card border/tint varies by type:
  - task (purple), challenge (orange), reflection (blue), new-content (cyan),
    streak-reminder (orange), achievement (yellow).
  - `task` cards also show a full-width "Mark Complete" button (purple subtle fill).
  - Tapping a card navigates (to content or roadmap). Loading = skeleton cards.
- **"Discover" section** (optional): horizontal scroll of smaller content cover
  cards (~144×192) with type pill + title + author.

### 3.4 Library — route `/library` (with bottom nav)
Searchable, filterable grid of all content.

- **Header:** title "Library" (bold 2xl).
- **Search bar:** rounded input with a left search icon, placeholder "Search books, authors…".
- **Type filter pills** (horizontal scroll): All, Books, Podcasts, Philosophy,
  Frameworks, Courses. Active = filled purple; others = card pill with muted text.
- **Content grid:** 2-column grid of cover cards (~full-width/2, height ~208px),
  same gradient-cover style as home tiles. Each shows: type pill (top-left),
  progress ring (top-right, if started), bold title, author, and a bottom row with a
  difficulty label (beginner=green / intermediate=yellow / advanced=red) and
  duration "{N}m".
- **Empty state:** centered search icon chip + "No results found" + "Try a different
  search or filter". Loading = skeleton grid.

### 3.5 Content Detail — route `/content/:contentId` (full screen, no nav)
Pre-session detail + session launcher.

- **Cover header (288px tall):** full-bleed diagonal gradient with dark
  bottom-fade overlay. Top-left circular frosted **back** button. Bottom: type pill,
  large bold white title (3xl), author.
- **Body (centered, max-w-lg):**
  - **Stats row:** "{N} lessons" (book icon), "{N}m" (clock), "{N} XP" (purple lightning).
  - **Description** paragraph (muted).
  - **"Key Insights"** section: numbered list — each a card row with a small purple
    numbered circle + insight text.
  - **"Lessons"** section: list of lesson rows — gray numbered square, title +
    "{type} · {N}m" subtitle, and an XP value on the right.
  - **"Session Length"** selector: 4-column grid of buttons — "2 min / Core insight
    only", "5 min / Key ideas", "10 min / Deep dive", "20 min / Full session".
    Selected = `primary/10` fill + purple border, purple bold value.
  - **CTA:** full-width primary "Begin Learning" button (loading "Starting…").
    If the content has a roadmap: a secondary outlined button below — map icon +
    "Start 30-Day Implementation" + chevron.

### 3.6 Learn Session — route `/learn/:sessionId` (full screen, no nav)
The active lesson reader with inline quiz. Three-zone layout: sticky header,
scrolling content, sticky footer.

- **Sticky header (frosted):** circular back button; center shows "Lesson {i} of {N}"
  (muted) + the lesson title (bold, truncated); right shows current session XP
  ("⚡{N}", purple). Below: a thin gradient progress bar (purple→cyan).
- **Scrolling content (centered, max-w-lg):** a vertical stack of **section cards**,
  each rounded-2xl with a colored border/tint based on type:
  - insight (purple), quote (cyan, italic accent text), challenge (orange),
    reflection (purple), visual (cyan), text (plain card).
  - A card may show an uppercase type label, an optional bold title, the body text,
    and an optional left-border "highlight" callout in purple.
  - **Quiz card** ("Quick Check"): label + question, then a vertical list of option
    buttons. On select: correct option turns green, a wrong pick turns red, and an
    explanation banner appears (green if correct / orange if not) ending with "+{N} XP".
- **Sticky footer (frosted):** full-width primary button — "Next Lesson", or
  "Complete Session" on the last lesson ("Saving…" while pending). A "+{N} XP" label
  floats up and fades from the button on completion.

### 3.7 Learn Summary — route `/learn/:sessionId/summary` (full screen, no nav)
Celebration / takeaways after finishing a session.

- **Hero header:** diagonal gradient block with dark fade. Centered: a rounded
  frosted tile showing the title's first letter (big), the bold title (2xl), and
  "Session Complete" (muted white).
- **Body (centered):**
  - **"Key Takeaways"** numbered list — each a card row with a colored numbered
    square (uses the content's cover color) + takeaway text.
  - **"Core Insight"** callout card (`primary/10` fill, purple border): label
    "CORE INSIGHT" + the insight in italic quotes.
  - **XP earned card:** gradient (`primary/20 → accent/20`) centered card with big
    purple "+{N} XP" and "Earned this session".
- **Actions (stacked):** outlined "Save Summary Card" button (bookmark icon; becomes
  "Saved to your library" with a filled bookmark); purple-subtle "Start 30-Day
  Implementation" (map icon); a muted text "Back to Home" (home icon).

### 3.8 Roadmaps — route `/roadmaps` (with bottom nav)
List of implementation plans + a create flow.

- **Header:** title "Roadmaps" + subtitle "Turn knowledge into habits"; right side a
  square purple **+** button.
- **Roadmap cards:** each a horizontal card — a **progress ring** (with center %
  label, colored by the content) on the left; then content title, a row with
  "Day {x}/{total}" (calendar icon) and a status pill (active=green / else gray),
  and "{done}/{total} tasks · {N} XP"; chevron on the right.
- **Empty state:** centered map icon chip + "No active roadmaps" + helper text +
  a "Start a Roadmap" button. Loading = skeleton cards.
- **Create modal (bottom sheet):** dark overlay; sheet slides up from bottom with a
  top drag-handle. Title "New Roadmap". Section "CHOOSE CONTENT": scrollable list of
  selectable rows (color swatch + title + author; selected = `primary/10` + purple
  border). Section "DURATION": 3-column grid — "30 Days / Foundation", "60 Days /
  Deep Work", "90 Days / Mastery". Full-width primary "Start Roadmap" button
  (disabled until content chosen; "Creating…" while pending).

### 3.9 Roadmap Detail — route `/roadmaps/:roadmapId` (full screen, no nav)
A single roadmap's daily tasks.

- **Gradient header:** back button; bold content title; a row with "Day {x}/{total}"
  (calendar) and "{N} XP" (lightning); then a labeled progress bar ("{done} tasks
  done" / "{pct}%") with a white fill on translucent track.
- **Body (centered):**
  - **"Today — Day {N}"** section: **task cards**. Each card: a round checkbox on the
    left (empty outline → filled green check when done); a type tag pill (habit=purple,
    challenge=orange, reflection=blue, mini-game=cyan, action=green, review=yellow),
    an "⚡{N} XP" label, the task title (strikethrough + muted once completed), and a
    description. Completed cards get a green tint.
  - **"Coming Up"** section: dimmed (opacity ~60%) cards showing "Day {N}" (clock
    icon), title, and description — not yet actionable.
  - **"Recently Completed"** section: up to 3 dimmed rows, each a green check + the
    struck-through task title.

### 3.10 Saved Cards — route `/saved` (full screen, no nav)
Grid/list of saved summary cards.

- **Sticky header:** back button + title "Saved Cards".
- **Card list (centered, max-w-lg):** each saved card is two stacked parts:
  - **Top (gradient banner):** content title (small muted-white) + lesson title
    (bold white); a circular frosted **trash/delete** button top-right.
  - **Bottom (card surface):** up to 3 key takeaways as small purple-bulleted lines;
    an optional italic "core insight" separated by a top border; a tiny "Saved
    {date}" footnote.
- **Empty state:** centered bookmark icon chip + "No saved cards yet" + helper text.
  Loading = skeleton cards. Deleting animates the card out.

### 3.11 Profile — route `/profile` (with bottom nav)
Identity, stats, XP chart, achievements.

- **Header:** a rounded square **avatar** showing the name's first letter on a colored
  block (`avatarColor`); next to it the name (bold xl), role (muted, capitalized), and
  up to 3 goal pills (small purple-tinted, capitalized).
- **Level + XP card:** a small purple square with the level number + "Level {N}" on
  the left, "{xp} XP total" on the right; a gradient progress bar; helper text
  "{N} XP to level {N+1}" (or "Max level!").
- **Stats grid (2×2):** four stat cards, each an icon chip + big value + label:
  Day streak (orange flame), Completed (purple book), Lessons done (cyan target),
  Time learned "{N}m" (green clock).
- **"XP This Week" card:** header with title + "⚡{N}" (week total, purple); a small
  filled **area chart** (recharts), purple line with a purple→transparent gradient
  fill, x-axis = short dates, dark tooltip.
- **"Achievements" section:** header + "{unlocked}/{total} unlocked"; a 3-column grid
  of badge tiles — each shows an emoji icon + short title. Unlocked = purple-tinted
  border/glow; locked = dimmed (~50% opacity). (Seeded set of 9: First Steps, On a
  Roll, Week Warrior, Deep Diver, Habit Builder, Card Collector, Century Club,
  Philosophy Major, Road Warrior.)
- **"Saved Summary Cards" shortcut:** full-width card (bookmark chip + label +
  subtitle) linking to `/saved`.

---

## 4. Seeded content (for realistic mock copy)

8 content items, each with 4–5 lessons, a quiz, and a summary card:
Atomic Habits (James Clear), Deep Work (Cal Newport), The Psychology of Money
(Morgan Housel), Meditations (Marcus Aurelius), The 5 AM Club (Robin Sharma),
Thinking Fast and Slow (Daniel Kahneman), How to Build Confidence, The PARA Method
(Tiago Forte).

Content **types:** book, podcast, philosophy, framework, course.
**Difficulty:** beginner / intermediate / advanced.
Lesson **section types:** text, insight, quote, challenge, reflection, visual.
Roadmap **task types:** habit, challenge, reflection, mini-game, action, review.

---

## 5. Suggested prompt for generating a mockup

> "Using the LearnPath design system above (dark theme, near-black `#0a0a0f`
> background, purple `#7c3aed` primary, cyan `#06b6d4` accent, Inter font,
> rounded-2xl cards, mobile-first 390px-wide frame with a frosted bottom nav),
> design a high-fidelity mockup of the **[SCREEN NAME]** screen as described in
> section 3.[x]. Use the seeded content names for realistic copy."
