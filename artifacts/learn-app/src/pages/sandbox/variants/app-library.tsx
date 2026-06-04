import { useState } from "react";
import { Search, Plus, ArrowRight } from "lucide-react";
import { C, serif, Shell, StatusBar, BottomNav, Pill, Cover, COVERS, useNav } from "../warm-kit";

export const meta = { title: "App · My Library", note: "Warm mockup — saved books grid" };

const TABS = ["All", "Books", "Podcasts", "Notes", "Saved"];

const ITEMS: { title: string; author: string; pct?: number }[] = [
  { title: "Atomic Habits", author: "James Clear", pct: 75 },
  { title: "Deep Work", author: "Cal Newport", pct: 60 },
  { title: "The Almanack of Naval Ravikant", author: "Naval Ravikant" },
  { title: "Meditations", author: "Marcus Aurelius" },
  { title: "The Psychology of Money", author: "Morgan Housel", pct: 40 },
  { title: "Ikigai", author: "Héctor García" },
];

export default function AppLibrary() {
  const [tab, setTab] = useState("All");
  const nav = useNav();
  return (
    <Shell>
      <StatusBar />

      <div className="flex items-center justify-between px-5 pt-3">
        <h1 className="text-[26px]" style={{ fontFamily: serif }}>
          My Library
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
            style={{ border: `1px solid ${C.line}` }}
          >
            <Search size={17} style={{ color: C.sub }} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: C.green }}
          >
            <Plus size={18} color="#fff" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Pill>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 pt-5">
        {ITEMS.map((it) => (
          <div key={it.title} onClick={() => nav?.go("detail")} className="cursor-pointer">
            <Cover title={it.title.split(" of ")[0]} from={COVERS[it.title][0]} to={COVERS[it.title][1]} h={132} />
            <p className="mt-2 text-[12px] font-medium leading-tight">{it.title.split(" of ")[0]}</p>
            <p className="text-[10px]" style={{ color: C.muted }}>
              {it.author}
            </p>
            {it.pct != null && (
              <div className="mt-1.5 h-1 rounded-full" style={{ background: C.line }}>
                <div className="h-1 rounded-full" style={{ width: `${it.pct}%`, background: C.green }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 pt-6">
        <div
          onClick={() => nav?.go("principles")}
          className="flex cursor-pointer items-center justify-between rounded-3xl p-5"
          style={{ background: C.cream2, border: `1px solid ${C.line}` }}
        >
          <div>
            <h3 className="text-[15px] font-semibold" style={{ fontFamily: serif }}>
              Your 12 Principles
            </h3>
            <p className="mt-1 text-xs" style={{ color: C.muted }}>
              Insights you've saved from books & podcasts
            </p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: C.green }}>
            <ArrowRight size={18} color="#fff" />
          </button>
        </div>
      </div>

      <BottomNav active="library" />
    </Shell>
  );
}
