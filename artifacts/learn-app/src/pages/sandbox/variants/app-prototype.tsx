import { useState, useCallback } from "react";
import { Layers, X } from "lucide-react";
import { NavCtx, type ScreenKey } from "../warm-kit";

import AppHome from "./app-home";
import AppLibrary from "./app-library";
import AppDetail from "./app-detail";
import AppRoadmap from "./app-roadmap";
import AppWisdom from "./app-wisdom";
import AppReader from "./app-reader";
import AppPrinciples from "./app-principles";
import AppPrincipleMap from "./app-principle-map";
import AppJournal from "./app-journal";
import AppStats from "./app-stats";
import AppPlayer from "./app-player";
import OnboardingWarm from "./onboarding-warm";

export const meta = {
  title: "★ Full App Prototype",
  note: "All screens connected — tap nav & buttons to move",
};

const SCREENS: { key: ScreenKey; label: string; Component: React.ComponentType }[] = [
  { key: "onboarding", label: "Onboarding", Component: OnboardingWarm },
  { key: "home", label: "Home", Component: AppHome },
  { key: "library", label: "My Library", Component: AppLibrary },
  { key: "detail", label: "Content Detail", Component: AppDetail },
  { key: "reader", label: "Reader / Session", Component: AppReader },
  { key: "principles", label: "Principles", Component: AppPrinciples },
  { key: "map", label: "Principle Map", Component: AppPrincipleMap },
  { key: "roadmap", label: "Roadmap", Component: AppRoadmap },
  { key: "wisdom", label: "Daily Wisdom", Component: AppWisdom },
  { key: "journal", label: "Journal", Component: AppJournal },
  { key: "stats", label: "Your Stats", Component: AppStats },
  { key: "player", label: "Audio Player", Component: AppPlayer },
];

const REG = Object.fromEntries(SCREENS.map((s) => [s.key, s.Component])) as Record<
  ScreenKey,
  React.ComponentType
>;

export default function AppPrototype() {
  const [stack, setStack] = useState<ScreenKey[]>(["onboarding"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const current = stack[stack.length - 1];

  const go = useCallback((k: ScreenKey) => {
    setStack((s) => (s[s.length - 1] === k ? s : [...s, k]));
    setMenuOpen(false);
  }, []);
  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const Screen = REG[current];

  return (
    <NavCtx.Provider value={{ go, back }}>
      {/* the active screen renders its own full device frame */}
      <Screen key={current} />

      {/* dev launcher — jump to any screen */}
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
        style={{ background: "#2F3B2C" }}
        title="Jump to a screen"
      >
        {menuOpen ? <X size={20} /> : <Layers size={20} />}
      </button>

      {menuOpen && (
        <div
          className="fixed bottom-20 right-5 z-[100] w-56 overflow-hidden rounded-2xl text-sm shadow-2xl"
          style={{ background: "#23231f", border: "1px solid #3a3a33" }}
        >
          <p className="px-4 py-2 text-[11px] uppercase tracking-widest" style={{ color: "#9C988C", borderBottom: "1px solid #3a3a33" }}>
            Screens
          </p>
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {SCREENS.map((s) => (
              <button
                key={s.key}
                onClick={() => go(s.key)}
                className="flex w-full items-center justify-between px-4 py-2 text-left transition"
                style={{ color: current === s.key ? "#fff" : "#c9c5ba", background: current === s.key ? "#3a4636" : "transparent" }}
              >
                {s.label}
                {current === s.key && <span style={{ color: "#8fae74" }}>●</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </NavCtx.Provider>
  );
}
