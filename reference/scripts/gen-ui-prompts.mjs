// Generates one self-contained ChatGPT prompt per screen into /ui-prompts.
// Run: node scripts/gen-ui-prompts.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "ui-prompts");
mkdirSync(outDir, { recursive: true });

const HEADER = `You are designing ONE screen of **LearnPath**, a single-user, mobile-first, dark-theme learning & implementation app. Tone: premium, focused, calm-but-energetic (a blend of Duolingo's gamification, Headspace's calm, Blinkist's content cards).

Output a SINGLE self-contained **React + Tailwind (TypeScript)** component with a default export, ready to drop into a Vite app. Rules:
- Use **lucide-react** for icons and **framer-motion** for subtle entrance animation.
- Use inline mock/placeholder data — do NOT call any API.
- Mobile-first, ~390px wide. Add \`export const meta = { title: "...", note: "..." }\` above the component.
- Use ONLY the design tokens below (as Tailwind classes; hex given for reference).

DESIGN TOKENS (dark theme):
- Background \`bg-background\` #0a0a0f · surfaces \`bg-card\` #0f0f14 · borders \`border-border\` #1e1e2a · subtle fill \`bg-secondary\` #1e1e2a
- Text \`text-foreground\` #fafafa · muted \`text-muted-foreground\` #9ca3af
- Primary (purple) \`bg-primary\`/\`text-primary\` #7c3aed · Accent (cyan) \`text-accent\` #06b6d4
- Status colors: orange #f97316, green #22c55e, red #ef4444, blue #3b82f6, yellow #eab308, purple #a855f7, cyan #06b6d4
- Font Inter. Headings bold/black, tight tracking. Small labels: \`text-xs uppercase tracking-widest text-muted-foreground\`.
- Radius: cards \`rounded-2xl\`, buttons/inputs \`rounded-xl\`, pills/tags \`rounded-full\`. Padding \`p-4\`/\`p-5\`, page \`px-5\`. Vertical rhythm \`space-y-3\`/\`space-y-6\`.
- Primary buttons carry a colored glow: \`shadow-lg shadow-primary/30\`.
- Content "covers" use NO images — they are diagonal gradient blocks \`linear-gradient(135deg, coverColor, accentColor)\` with a dark overlay and white text. Each content item has its own coverColor + accentColor.
- Motion: fade + slide up on mount (y:20→0), stagger list items ~60ms, buttons \`whileTap={{ scale: 0.97 }}\`, progress bars animate width from 0.

SEEDED CONTENT (use for realistic copy): Atomic Habits (James Clear), Deep Work (Cal Newport), The Psychology of Money (Morgan Housel), Meditations (Marcus Aurelius), The 5 AM Club (Robin Sharma), Thinking Fast and Slow (Daniel Kahneman), How to Build Confidence, The PARA Method (Tiago Forte). Content types: book, podcast, philosophy, framework, course. Difficulty: beginner/intermediate/advanced.

THE SCREEN TO DESIGN:
`;

const FOOTER = `

OUTPUT: exactly one .tsx file (default-exported component + \`meta\`). No prose before or after the code block.`;

const screens = [
  ["01-onboarding", "Onboarding (full screen, no bottom nav)", `A 4-step animated quiz, one question per step, vertically centered, with a fixed bottom CTA. Steps animate between transitions.
- Top: a row of 4 progress dots — current step is an elongated purple pill, completed steps purple, upcoming dim gray.
- Center (changes per step) — centered bold 2xl title + muted subtitle, then the input:
  - Step 1 "What should we call you?" / "Personalize your experience": a single large text input, placeholder "Your name".
  - Step 2 "What best describes you?" / "We'll tailor your content": 2-column grid of role buttons (Student, Professional, Entrepreneur, Creator, Researcher, Other). Selected = filled purple with glow; unselected = card with border.
  - Step 3 "What do you want to improve?" / "Select all that apply": wrapping pill multi-select (Productivity, Focus & Deep Work, Confidence, Leadership, Relationships, Creativity, Mindset, Health & Habits, Finance, Communication). Selected pills filled purple.
  - Step 4 "How much time can you commit?" / "We'll design your daily sessions": vertical list of 4 options each with label + sublabel ("5 min / day — Quick wins", "10 min / day — Steady progress", "20 min / day — Deep learner", "30 min / day — Committed"). Selected = primary/10 fill + purple border.
- Bottom: full-width primary button ("Continue", last step "Start Learning"), disabled until the step is valid. From step 2 on, a muted "Back" text link below it.
Render all four steps (e.g. with local state + a step switcher) so the whole flow is testable.`],

  ["02-home", "Home (with bottom nav)", `A curated feed of horizontally scrolling content tiles.
- Header: greeting "Good morning" (muted) + user name (bold 2xl).
- Stats bar: two side-by-side stat cards — Streak (orange flame icon chip + big number + "Day streak") and XP (purple lightning chip + big number + "Total XP").
- "Today's goal" card: label + "{x}/{goal} XP" in purple + a thin progress bar with purple→cyan gradient fill.
- "Continue Learning" section: row header with a "See all ›" link + a horizontal scroll of content tiles.
- One or more curated sections: each has a bold title + muted subtitle (e.g. "For Your Goals — Handpicked for your journey") and a horizontal scroll row of tiles.
- Content tile (~176×224): rounded-2xl gradient cover + dark overlay. Top-left small uppercase type pill ("BOOK"); top-right circular % progress ring (only if started); bottom: bold white title (2 lines max), muted author, and a small frosted pill button with a play icon ("Begin"/"Continue").
- Bottom: a full-width "Full Library" shortcut card (book icon chip + label + subtitle + chevron).
Include a fixed bottom nav (5 tabs: Today, Home, Library, Roadmaps, Profile — Home active in purple).`],

  ["03-today", "Today (with bottom nav)", `The daily agenda + streak.
- Header: uppercase date (e.g. "TUESDAY, JUNE 3") + greeting (bold 2xl).
- Streak card: flame icon + "{N} day streak"; below, a row of 7 day-squares labeled M T W T F S S — active days filled orange with white letter, inactive gray.
- Daily XP goal card: "Daily XP Goal" + lightning icon + "{x}/{goal}" + gradient progress bar.
- "Today's Agenda" list: stacked feed cards. Each has a colored left icon chip, bold title, muted description, and an optional XP badge ("⚡{N}") on the right. Card tint varies by type: task=purple, challenge=orange, reflection=blue, new-content=cyan, streak-reminder=orange, achievement=yellow. Task cards also show a full-width subtle "Mark Complete" button.
- "Discover" section: horizontal scroll of smaller content cover cards (~144×192) with type pill + title + author.
Include the fixed bottom nav (Today active).`],

  ["04-library", "Library (with bottom nav)", `Searchable, filterable grid of all content.
- Header: title "Library" (bold 2xl).
- Search bar: rounded input with a left search icon, placeholder "Search books, authors…".
- Type filter pills (horizontal scroll): All, Books, Podcasts, Philosophy, Frameworks, Courses. Active = filled purple; others = card pill with muted text.
- Content grid: 2-column grid of gradient cover cards (height ~208px). Each: type pill (top-left), % progress ring (top-right, if started), bold white title, author, and a bottom row with difficulty label (beginner=green / intermediate=yellow / advanced=red) and duration "{N}m".
- Empty state (show as a comment or secondary block): centered search icon chip + "No results found" + "Try a different search or filter".
Include the fixed bottom nav (Library active).`],

  ["05-content-detail", "Content Detail (full screen, no bottom nav)", `Pre-session detail + session launcher.
- Cover header (~288px tall): full-bleed diagonal gradient with a dark bottom-fade overlay. Top-left circular frosted back button. Bottom: type pill, large bold white title (3xl), author.
- Body (centered, max-w-lg):
  - Stats row: "{N} lessons" (book icon), "{N}m" (clock), "{N} XP" (purple lightning).
  - Description paragraph (muted).
  - "Key Insights": numbered list — each a card row with a small purple numbered circle + insight text.
  - "Lessons": list rows — gray numbered square, title + "{type} · {N}m" subtitle, XP value on the right.
  - "Session Length" selector: 4-column grid — "2 min / Core insight only", "5 min / Key ideas", "10 min / Deep dive", "20 min / Full session". Selected = primary/10 fill + purple border.
  - CTA: full-width primary "Begin Learning" button; below it a secondary outlined "Start 30-Day Implementation" button (map icon + chevron).`],

  ["06-learn-session", "Learn Session (full screen, no bottom nav)", `The active lesson reader with an inline quiz. Three zones: sticky header, scrolling content, sticky footer.
- Sticky header (frosted): circular back button; center shows "Lesson {i} of {N}" (muted) + lesson title (bold, truncated); right shows session XP "⚡{N}" (purple). Below: a thin purple→cyan gradient progress bar.
- Scrolling content (centered, max-w-lg): a vertical stack of section cards, each rounded-2xl with a colored border/tint by type: insight=purple, quote=cyan (italic accent text), challenge=orange, reflection=purple, visual=cyan, text=plain card. A card may have an uppercase type label, optional bold title, body text, and an optional left-border purple "highlight" callout.
  - Quiz card ("Quick Check"): label + question, then a vertical list of option buttons. Show the answered state: correct option green, a wrong pick red, plus an explanation banner (green if correct / orange if not) ending with "+{N} XP".
- Sticky footer (frosted): full-width primary button "Next Lesson" (or "Complete Session" on the last lesson). A "+{N} XP" label floats up and fades on tap.`],

  ["07-learn-summary", "Learn Summary (full screen, no bottom nav)", `Celebration / takeaways after finishing a session.
- Hero header: diagonal gradient block with dark fade. Centered: a rounded frosted tile showing the title's first letter (big), the bold title (2xl), and "Session Complete" (muted white).
- Body (centered):
  - "Key Takeaways": numbered list — each a card row with a colored numbered square (content's cover color) + takeaway text.
  - "Core Insight" callout card (primary/10 fill, purple border): label "CORE INSIGHT" + the insight in italic quotes.
  - XP earned card: gradient (primary/20 → accent/20), centered, big purple "+{N} XP" + "Earned this session".
- Actions (stacked): outlined "Save Summary Card" (bookmark icon; toggles to "Saved to your library" with filled bookmark); purple-subtle "Start 30-Day Implementation" (map icon); a muted text "Back to Home" (home icon).`],

  ["08-roadmaps", "Roadmaps (with bottom nav)", `List of implementation plans + a create flow.
- Header: title "Roadmaps" + subtitle "Turn knowledge into habits"; right side a square purple "+" button.
- Roadmap cards: each horizontal — a circular progress ring (center % label, colored by content) on the left; then content title, a row with "Day {x}/{total}" (calendar icon) + a status pill (active=green / else gray), and "{done}/{total} tasks · {N} XP"; chevron on the right.
- Empty state: centered map icon chip + "No active roadmaps" + helper text + a "Start a Roadmap" button.
- Create modal (bottom sheet): dark overlay; sheet slides up with a top drag-handle. Title "New Roadmap". Section "CHOOSE CONTENT": scrollable selectable rows (color swatch + title + author; selected = primary/10 + purple border). Section "DURATION": 3-column grid — "30 Days / Foundation", "60 Days / Deep Work", "90 Days / Mastery". Full-width primary "Start Roadmap" button.
Include the fixed bottom nav (Roadmaps active). Show the modal open so it's testable.`],

  ["09-roadmap-detail", "Roadmap Detail (full screen, no bottom nav)", `A single roadmap's daily tasks.
- Gradient header: back button; bold content title; a row with "Day {x}/{total}" (calendar) + "{N} XP" (lightning); then a labeled progress bar ("{done} tasks done" / "{pct}%") with a white fill on a translucent track.
- Body (centered):
  - "Today — Day {N}": task cards. Each: a round checkbox on the left (empty outline → filled green check when done); a type tag pill (habit=purple, challenge=orange, reflection=blue, mini-game=cyan, action=green, review=yellow), an "⚡{N} XP" label, the task title (strikethrough + muted once completed), and a description. Completed cards get a green tint.
  - "Coming Up": dimmed (~60% opacity) cards showing "Day {N}" (clock icon), title, description.
  - "Recently Completed": up to 3 dimmed rows, each a green check + the struck-through task title.`],

  ["10-saved-cards", "Saved Cards (full screen, no bottom nav)", `Grid/list of saved summary cards.
- Sticky header: back button + title "Saved Cards".
- Card list (centered, max-w-lg): each saved card has two stacked parts:
  - Top (gradient banner): content title (small muted-white) + lesson title (bold white); a circular frosted trash/delete button top-right.
  - Bottom (card surface): up to 3 key takeaways as small purple-bulleted lines; an optional italic "core insight" separated by a top border; a tiny "Saved {date}" footnote.
- Empty state: centered bookmark icon chip + "No saved cards yet" + helper text.`],

  ["11-profile", "Profile (with bottom nav)", `Identity, stats, XP chart, achievements.
- Header: a rounded square avatar with the name's first letter on a colored block; next to it the name (bold xl), role (muted, capitalized), and up to 3 small purple-tinted goal pills.
- Level + XP card: a small purple square with the level number + "Level {N}" on the left, "{xp} XP total" on the right; a gradient progress bar; helper text "{N} XP to level {N+1}".
- Stats grid (2×2): four stat cards (icon chip + big value + label): Day streak (orange flame), Completed (purple book), Lessons done (cyan target), Time learned "{N}m" (green clock).
- "XP This Week" card: header with title + "⚡{N}" (purple); a small filled area chart (purple line, purple→transparent gradient fill, short-date x-axis). You may use recharts or a simple SVG.
- "Achievements": header + "{unlocked}/{total} unlocked"; a 3-column grid of badge tiles (emoji icon + short title). Unlocked = purple-tinted border/glow; locked = dimmed ~50%. Names: First Steps, On a Roll, Week Warrior, Deep Diver, Habit Builder, Card Collector, Century Club, Philosophy Major, Road Warrior.
- "Saved Summary Cards" shortcut: full-width card (bookmark chip + label + subtitle).
Include the fixed bottom nav (Profile active).`],
];

for (const [slug, title, body] of screens) {
  const content = `# ChatGPT prompt — ${title}\n\nPaste everything below into ChatGPT (one screen at a time).\n\n---\n\n${HEADER}\n**${title}**\n${body}${FOOTER}\n`;
  writeFileSync(path.join(outDir, `${slug}.md`), content, "utf8");
}

writeFileSync(
  path.join(outDir, "README.md"),
  `# Per-screen ChatGPT prompts\n\nChatGPT can't reliably do all screens at once, so each file here is a **standalone prompt for ONE screen** — design system + that screen + output format all included. Workflow:\n\n1. Open one file (e.g. \`02-home.md\`), copy the prompt block, paste into ChatGPT.\n2. ChatGPT returns a single \`.tsx\` component.\n3. Save it as \`artifacts/learn-app/src/pages/sandbox/variants/<name>.tsx\` (or paste it to Claude and say "test this UI").\n4. View it live at \`http://localhost:22464/sandbox/<name>\`.\n\nScreens: onboarding, home, today, library, content-detail, learn-session, learn-summary, roadmaps, roadmap-detail, saved-cards, profile.\n\nFull reference spec: \`../UI_SPEC.md\`. Testing harness: \`../artifacts/learn-app/src/pages/sandbox/README.md\`.\n\nRegenerate these files after editing the generator: \`node scripts/gen-ui-prompts.mjs\`\n`,
  "utf8",
);

console.log(`Wrote ${screens.length} screen prompts + README to ${outDir}`);
