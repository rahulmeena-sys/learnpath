# UI design workflow (ChatGPT → Claude → live app)

This is the loop for designing new UI with ChatGPT and testing it in the real app.

## The three pieces

| File / place | Audience | Purpose |
|---|---|---|
| `UI_SPEC.md` | **ChatGPT** | Full design-system + per-screen spec. Paste it in, ask for designs. |
| `artifacts/learn-app/src/pages/sandbox/` | **the app** | Live harness — every variant renders at `/sandbox/<name>` with real data. |
| `UI_WORKFLOW.md` (this file) | **Claude** | How to take a ChatGPT design and get it running for the user. |

## Recommended loop

1. **Design (ChatGPT).** Give ChatGPT `UI_SPEC.md` and ask for a screen.
   **Ask it to output a self-contained React + Tailwind component** (default export,
   Tailwind classes using the design tokens, lucide-react icons) — *not* just an
   image. Code drops straight into the sandbox; images only help as reference.
2. **Drop in (Claude or user).** Save it as
   `artifacts/learn-app/src/pages/sandbox/variants/<name>.tsx`. It auto-appears at
   `/sandbox` — no wiring needed. (Details: `src/pages/sandbox/README.md`.)
3. **Test.** Open `http://localhost:22464/sandbox/<name>` in the running app. A/B
   multiple options by saving each as its own variant file.
4. **Promote.** Once chosen, move it into the real page (`src/pages/<page>.tsx`),
   wire real API hooks + routing + bottom-nav layout, and delete the variant.

## Instructions for Claude

When the user says *"test this UI"* / *"try this design"* / pastes UI code:

- **If they paste React/HTML/Tailwind code:** create
  `src/pages/sandbox/variants/<descriptive-name>.tsx` wrapping it as a default export.
  Add `export const meta = { title, note }`. Fix imports to this repo's conventions:
  `@/components/ui/*`, `cn` from `@/lib/utils`, hooks from `@workspace/api-client-react`.
  Replace hardcoded colors with tokens where reasonable (`bg-primary`, `text-muted-foreground`, …).
  Then confirm it renders (the app runs on :22464; see `memory/running-on-windows.md`
  for how to (re)start servers) and give the user the `/sandbox/<name>` URL.
- **If they paste only an image:** describe it back, then build a React variant
  approximating it in the sandbox so they can interact with it.
- **Keep production pages untouched** until the user explicitly approves promoting a
  variant. The sandbox is the safe testing ground.
- **Promotion** = adapt the variant into `src/pages/<page>.tsx` (real hooks, real
  routing, `<AppLayout>` if it needs bottom nav), update `App.tsx` if needed, remove
  the variant file.

## Running the app

API (:8080) + frontend (:22464) + portable Postgres (:5544). Full setup and the
Windows-specific fixes are in `~/.claude/.../memory/running-on-windows.md`. The
frontend is served via the Preview tool / `.claude/launch.json`.
