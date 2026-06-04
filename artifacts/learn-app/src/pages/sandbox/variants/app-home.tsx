import { useState } from "react";
import { Heart, ChevronRight } from "lucide-react";
import {
  C,
  serif,
  Shell,
  StatusBar,
  BottomNav,
  Pill,
  Cover,
  COVERS,
  useNav,
} from "../warm-kit";

export const meta = {
  title: "App · Home",
  note: "Warm mockup — curated feed",
};

const TABS = ["For You", "Books", "Podcasts", "Principles"];

export default function AppHome() {
  const [tab, setTab] = useState("For You");
  const nav = useNav();

  return (
    <Shell>
      <StatusBar />

      {/* header */}
      <div className="flex items-start justify-between px-5 pt-3">
        <div>
          <h1 className="text-[26px] leading-tight" style={{ fontFamily: serif }}>
            Good Morning, Arjun <span>☀️</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: C.muted }}>
            Feed your mind. Shape your life.
          </p>
        </div>
        <div
          className="h-10 w-10 flex-shrink-0 rounded-full"
          style={{ background: `linear-gradient(140deg, ${C.green}, ${C.greenDk})` }}
        />
      </div>

      {/* tabs */}
      <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Pill>
        ))}
      </div>

      {/* quote card */}
      <div className="px-5 pt-5">
        <div
          className="relative overflow-hidden rounded-[28px] p-6"
          style={{ background: C.greenDeep }}
        >
          <div className="pointer-events-none absolute right-2 top-6 select-none text-[120px] leading-none opacity-20">
            🌿
          </div>
          <p className="text-4xl leading-none" style={{ color: C.gold, fontFamily: serif }}>
            “
          </p>
          <h2
            className="max-w-[230px] text-[26px] leading-tight text-white"
            style={{ fontFamily: serif }}
          >
            Discipline is the bridge between goals and accomplishment.
          </h2>
          <p className="mt-5 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
            — Jim Rohn
          </p>
          <button className="absolute bottom-5 right-5 text-white/80">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* continue reading */}
      <div className="px-5 pt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Continue Reading</h3>
          <button className="text-xs" style={{ color: C.muted }}>
            See All
          </button>
        </div>
        <div
          onClick={() => nav?.go("detail")}
          className="flex cursor-pointer gap-4 rounded-3xl bg-white p-4"
          style={{ border: `1px solid ${C.line}` }}
        >
          <div style={{ width: 52 }}>
            <Cover title="Atomic Habits" from={COVERS["Atomic Habits"][0]} to={COVERS["Atomic Habits"][1]} h={68} />
          </div>
          <div className="flex-1">
            <h4 className="text-[15px] font-medium" style={{ fontFamily: serif }}>
              Atomic Habits
            </h4>
            <p className="text-xs" style={{ color: C.muted }}>
              James Clear
            </p>
            <div className="mt-4 h-1.5 rounded-full" style={{ background: C.line }}>
              <div className="h-1.5 rounded-full" style={{ width: "75%", background: C.green }} />
            </div>
            <p className="mt-1.5 text-right text-[11px]" style={{ color: C.muted }}>
              75%
            </p>
          </div>
        </div>
      </div>

      {/* because you read */}
      <div className="pt-7">
        <div className="flex items-center justify-between px-5">
          <h3 className="text-[15px] font-semibold">Because you read Deep Work</h3>
          <ChevronRight size={16} style={{ color: C.muted }} />
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
          {["The Almanack of Naval Ravikant", "Meditations", "The Psychology of Money"].map((t) => (
            <div key={t} onClick={() => nav?.go("detail")} className="w-[116px] flex-shrink-0 cursor-pointer">
              <Cover title={t} from={COVERS[t][0]} to={COVERS[t][1]} h={160} />
              <p className="mt-2 text-[13px] font-medium leading-tight">{t.split(" of ")[0]}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                {t === "Meditations" ? "Marcus Aurelius" : t === "The Psychology of Money" ? "Morgan Housel" : "Naval Ravikant"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </Shell>
  );
}
