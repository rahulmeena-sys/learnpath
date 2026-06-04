# ChatGPT prompt — Home (with bottom nav)

Paste everything below into ChatGPT (one screen at a time).

---

You are designing ONE screen of **LearnPath**, a single-user, mobile-first, dark-theme learning & implementation app. Tone: premium, focused, calm-but-energetic (a blend of Duolingo's gamification, Headspace's calm, Blinkist's content cards).

Output a SINGLE self-contained **React + Tailwind (TypeScript)** component with a default export, ready to drop into a Vite app. Rules:
- Use **lucide-react** for icons and **framer-motion** for subtle entrance animation.
- Use inline mock/placeholder data — do NOT call any API.
- Mobile-first, ~390px wide. Add `export const meta = { title: "...", note: "..." }` above the component.
- Use ONLY the design tokens below (as Tailwind classes; hex given for reference).

DESIGN TOKENS (dark theme):
- Background `bg-background` #0a0a0f · surfaces `bg-card` #0f0f14 · borders `border-border` #1e1e2a · subtle fill `bg-secondary` #1e1e2a
- Text `text-foreground` #fafafa · muted `text-muted-foreground` #9ca3af
- Primary (purple) `bg-primary`/`text-primary` #7c3aed · Accent (cyan) `text-accent` #06b6d4
- Status colors: orange #f97316, green #22c55e, red #ef4444, blue #3b82f6, yellow #eab308, purple #a855f7, cyan #06b6d4
- Font Inter. Headings bold/black, tight tracking. Small labels: `text-xs uppercase tracking-widest text-muted-foreground`.
- Radius: cards `rounded-2xl`, buttons/inputs `rounded-xl`, pills/tags `rounded-full`. Padding `p-4`/`p-5`, page `px-5`. Vertical rhythm `space-y-3`/`space-y-6`.
- Primary buttons carry a colored glow: `shadow-lg shadow-primary/30`.
- Content "covers" use NO images — they are diagonal gradient blocks `linear-gradient(135deg, coverColor, accentColor)` with a dark overlay and white text. Each content item has its own coverColor + accentColor.
- Motion: fade + slide up on mount (y:20→0), stagger list items ~60ms, buttons `whileTap={{ scale: 0.97 }}`, progress bars animate width from 0.

SEEDED CONTENT (use for realistic copy): Atomic Habits (James Clear), Deep Work (Cal Newport), The Psychology of Money (Morgan Housel), Meditations (Marcus Aurelius), The 5 AM Club (Robin Sharma), Thinking Fast and Slow (Daniel Kahneman), How to Build Confidence, The PARA Method (Tiago Forte). Content types: book, podcast, philosophy, framework, course. Difficulty: beginner/intermediate/advanced.

THE SCREEN TO DESIGN:

**Home (with bottom nav)**
A curated feed of horizontally scrolling content tiles.
- Header: greeting "Good morning" (muted) + user name (bold 2xl).
- Stats bar: two side-by-side stat cards — Streak (orange flame icon chip + big number + "Day streak") and XP (purple lightning chip + big number + "Total XP").
- "Today's goal" card: label + "{x}/{goal} XP" in purple + a thin progress bar with purple→cyan gradient fill.
- "Continue Learning" section: row header with a "See all ›" link + a horizontal scroll of content tiles.
- One or more curated sections: each has a bold title + muted subtitle (e.g. "For Your Goals — Handpicked for your journey") and a horizontal scroll row of tiles.
- Content tile (~176×224): rounded-2xl gradient cover + dark overlay. Top-left small uppercase type pill ("BOOK"); top-right circular % progress ring (only if started); bottom: bold white title (2 lines max), muted author, and a small frosted pill button with a play icon ("Begin"/"Continue").
- Bottom: a full-width "Full Library" shortcut card (book icon chip + label + subtitle + chevron).
Include a fixed bottom nav (5 tabs: Today, Home, Library, Roadmaps, Profile — Home active in purple).

OUTPUT: exactly one .tsx file (default-exported component + `meta`). No prose before or after the code block.
