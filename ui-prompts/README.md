# Per-screen ChatGPT prompts

ChatGPT can't reliably do all screens at once, so each file here is a **standalone prompt for ONE screen** — design system + that screen + output format all included. Workflow:

1. Open one file (e.g. `02-home.md`), copy the prompt block, paste into ChatGPT.
2. ChatGPT returns a single `.tsx` component.
3. Save it as `artifacts/learn-app/src/pages/sandbox/variants/<name>.tsx` (or paste it to Claude and say "test this UI").
4. View it live at `http://localhost:22464/sandbox/<name>`.

Screens: onboarding, home, today, library, content-detail, learn-session, learn-summary, roadmaps, roadmap-detail, saved-cards, profile.

Full reference spec: `../UI_SPEC.md`. Testing harness: `../artifacts/learn-app/src/pages/sandbox/README.md`.

Regenerate these files after editing the generator: `node scripts/gen-ui-prompts.mjs`
