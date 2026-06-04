import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";

/**
 * UI Design Sandbox
 * -----------------
 * Drop any candidate design (e.g. a ChatGPT-generated screen) into
 * `./variants/<name>.tsx` as a default-exported React component. It will be
 * auto-discovered here — no routing/wiring needed.
 *
 *   /sandbox            -> gallery of all variants
 *   /sandbox/<name>     -> render that variant full-screen
 *
 * Variants can use real API hooks (@workspace/api-client-react), shadcn/ui
 * components (@/components/ui/*), the design tokens, and `cn` from @/lib/utils.
 */

// Eagerly import every variant module so we can list + render them.
const modules = import.meta.glob("./variants/*.tsx", { eager: true }) as Record<
  string,
  { default: React.ComponentType; meta?: { title?: string; note?: string } }
>;

type Variant = {
  name: string;
  title: string;
  note?: string;
  Component: React.ComponentType;
};

function loadVariants(): Variant[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const name = path.split("/").pop()!.replace(/\.tsx$/, "");
      return {
        name,
        title: mod.meta?.title ?? name,
        note: mod.meta?.note,
        Component: mod.default,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function Sandbox() {
  const params = useParams();
  const variants = useMemo(loadVariants, []);
  const active = params.variant
    ? variants.find((v) => v.name === params.variant)
    : undefined;

  if (active) {
    const C = active.Component;
    return (
      <div className="min-h-[100dvh] bg-background">
        <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-2 backdrop-blur-xl">
          <Link
            href="/sandbox"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{active.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              /sandbox/{active.name}
            </p>
          </div>
        </div>
        <C />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background px-5 pt-10 pb-16">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">UI Sandbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {variants.length} variant{variants.length === 1 ? "" : "s"}. Drop a
            new design into{" "}
            <code className="text-primary">src/pages/sandbox/variants/</code> and
            it appears here automatically.
          </p>
        </div>

        {variants.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No variants yet. Add a default-exported component at
            <br />
            <code className="text-primary">
              src/pages/sandbox/variants/my-design.tsx
            </code>
          </div>
        )}

        <div className="grid gap-3">
          {variants.map((v) => (
            <Link
              key={v.name}
              href={`/sandbox/${v.name}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{v.title}</p>
                {v.note && (
                  <p className="truncate text-xs text-muted-foreground">
                    {v.note}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {v.name}.tsx
                </p>
              </div>
              <span className="text-xs font-medium text-primary">Open →</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          <Link href="/home" className="text-muted-foreground hover:text-foreground">
            ← Back to the real app
          </Link>
        </div>
      </div>
    </div>
  );
}
