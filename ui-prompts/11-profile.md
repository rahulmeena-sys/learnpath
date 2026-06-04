# ChatGPT prompt — Profile (with bottom nav)

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

**Profile (with bottom nav)**
Identity, stats, XP chart, achievements.
- Header: a rounded square avatar with the name's first letter on a colored block; next to it the name (bold xl), role (muted, capitalized), and up to 3 small purple-tinted goal pills.
- Level + XP card: a small purple square with the level number + "Level {N}" on the left, "{xp} XP total" on the right; a gradient progress bar; helper text "{N} XP to level {N+1}".
- Stats grid (2×2): four stat cards (icon chip + big value + label): Day streak (orange flame), Completed (purple book), Lessons done (cyan target), Time learned "{N}m" (green clock).
- "XP This Week" card: header with title + "⚡{N}" (purple); a small filled area chart (purple line, purple→transparent gradient fill, short-date x-axis). You may use recharts or a simple SVG.
- "Achievements": header + "{unlocked}/{total} unlocked"; a 3-column grid of badge tiles (emoji icon + short title). Unlocked = purple-tinted border/glow; locked = dimmed ~50%. Names: First Steps, On a Roll, Week Warrior, Deep Diver, Habit Builder, Card Collector, Century Club, Philosophy Major, Road Warrior.
- "Saved Summary Cards" shortcut: full-width card (bookmark chip + label + subtitle).
Include the fixed bottom nav (Profile active).

OUTPUT: exactly one .tsx file (default-exported component + `meta`). No prose before or after the code block.
