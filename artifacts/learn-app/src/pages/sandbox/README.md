# UI Sandbox — testing ChatGPT-generated designs

A live harness for trying out candidate UI designs **inside the real running app**,
with real data, without touching the production pages. This is the recommended way
to evaluate designs ChatGPT produces — far more useful than comparing static images.

## How it works

- Every file in `variants/*.tsx` that has a **default-exported React component** is
  auto-discovered (via `import.meta.glob`).
- View them in the running app:
  - `http://localhost:22464/sandbox` — gallery of all variants
  - `http://localhost:22464/sandbox/<filename>` — render one full-screen
- Adding a design = drop in one file. No routing or imports to wire up.

## Adding a variant

1. Create `variants/<name>.tsx` (e.g. `home-v2.tsx`).
2. `export default` a component.
3. (Optional) `export const meta = { title, note }` to label it in the gallery.

```tsx
export const meta = { title: "Home — bold cards", note: "ChatGPT option A" };

export default function HomeV2() {
  return <div className="px-5 pt-6">...</div>;
}
```

See `variants/example-home.tsx` for a working template.

## What variants can use

- **Design tokens** (dark theme): `bg-background`, `bg-card`, `text-foreground`,
  `text-muted-foreground`, `bg-primary` (purple `#7c3aed`), `text-accent`/`bg-accent`
  (cyan `#06b6d4`), `border-border`, `bg-secondary`. Full reference: `/UI_SPEC.md`.
- **shadcn/ui** components: `@/components/ui/*` (button, card, dialog, input, …).
- **`cn`** class helper: `@/lib/utils`.
- **framer-motion** for animation, **lucide-react** for icons.
- **Live API data**: hooks from `@workspace/api-client-react`
  (e.g. `useGetFeaturedContent`, `useGetProfile`, `useListContent`,
  `useGetDailyFeed`). The QueryClientProvider is already mounted app-wide, so hooks
  work inside sandbox variants with the seeded database behind them.

## Gotcha: arbitrary colors need a dev-server restart

ChatGPT designs often use arbitrary hex utilities (`bg-[#F8F6F2]`, `text-[#566B55]`,
…) instead of the design tokens. Tailwind only generates a class once it has scanned
a file that uses it. When you add a variant with **brand-new** arbitrary classes, a
hot-reload isn't always enough — if colors render as transparent/black, **restart the
Vite dev server** so Tailwind rescans. (Classes already used elsewhere in the app, and
all design tokens, work immediately.)

## Comparing designs

To A/B two ChatGPT options for the same screen, drop both as
`home-optionA.tsx` and `home-optionB.tsx`, then flip between
`/sandbox/home-optionA` and `/sandbox/home-optionB`. The current production page
stays untouched at its real route (e.g. `/home`) for reference.

## Promoting a winner

Once a variant is chosen, move/adapt it into the real page under
`src/pages/<page>.tsx` and delete the variant. Ask Claude to "promote
sandbox/<name> to the real <page> page" — it will wire up real hooks, routing, and
the bottom-nav layout as needed.
