import { createContext, useContext } from "react";
import {
  Home,
  Library,
  BookOpen,
  PenSquare,
  User,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";

/**
 * Navigation context shared by the prototype. When a screen is rendered inside
 * <NavProvider> (the app-prototype), `useNav()` returns a navigator so the bottom
 * nav and in-screen buttons can switch screens. Rendered standalone in the
 * gallery, `useNav()` is null and navigation is a no-op.
 */
export type ScreenKey =
  | "home"
  | "library"
  | "detail"
  | "roadmap"
  | "wisdom"
  | "reader"
  | "principles"
  | "map"
  | "journal"
  | "stats"
  | "player"
  | "onboarding";

export type Nav = { go: (k: ScreenKey) => void; back: () => void };
export const NavCtx = createContext<Nav | null>(null);
export const useNav = () => useContext(NavCtx);

// bottom-nav tab id -> screen key
const TAB_TO_SCREEN: Record<string, ScreenKey> = {
  home: "home",
  library: "library",
  path: "roadmap",
  journal: "journal",
  profile: "stats",
};

/**
 * Shared "warm/serif" theme kit for the sandbox variants that reproduce the
 * "Complete screens" mockup. Lives OUTSIDE ./variants so it isn't picked up by
 * the sandbox glob. Colors are applied via inline styles (not Tailwind arbitrary
 * classes) so new screens render without a dev-server restart.
 */

export const C = {
  cream: "#F4F1EA",
  cream2: "#EFEBE0",
  card: "#FFFFFF",
  green: "#566B55",
  greenDk: "#46583F",
  greenDeep: "#3C4A38",
  gold: "#C7A24A",
  ink: "#26261F",
  sub: "#6F6B61",
  muted: "#9C988C",
  line: "#E4DECF",
  outside: "#1c1c1c",
};

export const serif = "Georgia, 'Times New Roman', serif";
export const sans = "Inter, sans-serif";

export function Shell({
  children,
  bg = C.cream,
  pad = true,
}: {
  children: React.ReactNode;
  bg?: string;
  pad?: boolean;
}) {
  return (
    <div className="flex min-h-screen justify-center" style={{ background: C.outside }}>
      <div
        className="relative flex w-full max-w-[390px] flex-col"
        style={{ background: bg, minHeight: "100vh", fontFamily: sans, color: C.ink }}
      >
        {children}
        {pad && <div style={{ height: 88 }} />}
      </div>
    </div>
  );
}

export function StatusBar({ light = false }: { light?: boolean }) {
  const col = light ? "#fff" : C.ink;
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-semibold" style={{ color: col }}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={18} />
      </div>
    </div>
  );
}

const NAV = [
  { id: "home", label: "Home", Icon: Home },
  { id: "library", label: "Library", Icon: Library },
  { id: "path", label: "Path", Icon: BookOpen },
  { id: "journal", label: "Journal", Icon: PenSquare },
  { id: "profile", label: "Profile", Icon: User },
];

export function BottomNav({ active = "home" }: { active?: string }) {
  const nav = useNav();
  return (
    <div className="absolute bottom-0 left-0 right-0">
      <div
        className="flex items-center justify-around px-2"
        style={{
          height: 72,
          background: "rgba(252,250,247,0.92)",
          backdropFilter: "blur(14px)",
          borderTop: `1px solid ${C.line}`,
        }}
      >
        {NAV.map(({ id, label, Icon }) => {
          const on = id === active;
          return (
            <button
              key={id}
              onClick={() => nav?.go(TAB_TO_SCREEN[id])}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <Icon size={20} style={{ color: on ? C.green : C.muted }} strokeWidth={on ? 2.4 : 2} />
              <span className="text-[10px]" style={{ color: on ? C.green : C.muted }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Pill({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition"
      style={{
        background: active ? C.green : C.card,
        color: active ? "#fff" : C.sub,
        border: `1px solid ${active ? C.green : C.line}`,
      }}
    >
      {children}
    </button>
  );
}

/** A flat "book cover" using a gradient + serif title (no images, matches mockup). */
export function Cover({
  title,
  from,
  to,
  h = 150,
}: {
  title: string;
  from: string;
  to: string;
  h?: number;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-xl p-3 text-center"
      style={{ height: h, background: `linear-gradient(150deg, ${from}, ${to})` }}
    >
      <span className="leading-tight" style={{ fontFamily: serif, color: C.ink, fontSize: 15 }}>
        {title}
      </span>
    </div>
  );
}

export const COVERS: Record<string, [string, string]> = {
  "Atomic Habits": ["#EAE0CC", "#DCCBA6"],
  "Deep Work": ["#E7E9DE", "#C9D0BE"],
  "The Almanack of Naval Ravikant": ["#E3DECF", "#CFC6AE"],
  "Meditations": ["#DAE0D6", "#B9C4AE"],
  "The Psychology of Money": ["#F0E9DB", "#E0D4BC"],
  "Ikigai": ["#E8E2D2", "#CFC4A8"],
};
