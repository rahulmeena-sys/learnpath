import { useState } from "react";
import { ChevronLeft, Bookmark, MoreHorizontal, Star, Clock, ListChecks } from "lucide-react";
import { C, serif, Shell, StatusBar, Cover, COVERS, useNav } from "../warm-kit";

export const meta = { title: "App · Content Detail", note: "Warm mockup — Atomic Habits" };

const TABS = ["Summary", "Principles", "Roadmap", "Actions", "Notes"];
const THEMES = ["Identity", "Habit Stacking", "Environment Design", "Continuous Improvement"];

function Scenery() {
  return (
    <svg viewBox="0 0 390 220" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFEADC" />
          <stop offset="100%" stopColor="#D9DBC8" />
        </linearGradient>
      </defs>
      <rect width="390" height="220" fill="url(#sky)" />
      <circle cx="300" cy="60" r="26" fill="#EAD9A8" opacity="0.7" />
      <path d="M0 170 Q110 120 210 165 T390 150 V220 H0 Z" fill="#B9C3A4" opacity="0.85" />
      <path d="M0 195 Q120 160 240 195 T390 185 V220 H0 Z" fill="#8E9C77" />
      <rect x="190" y="150" width="6" height="34" fill="#5d6b4d" opacity="0.7" />
    </svg>
  );
}

export default function AppDetail() {
  const [tab, setTab] = useState("Summary");
  const nav = useNav();
  const onTab = (t: string) => {
    if (t === "Principles") nav?.go("principles");
    else if (t === "Roadmap") nav?.go("roadmap");
    else setTab(t);
  };
  return (
    <Shell pad={false}>
      {/* scenic header */}
      <div className="relative" style={{ height: 220 }}>
        <Scenery />
        <div className="relative">
          <StatusBar />
          <div className="flex items-center justify-between px-5 pt-1">
            <button onClick={() => nav?.back()} className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.6)" }}>
              <ChevronLeft size={18} style={{ color: C.ink }} />
            </button>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.6)" }}>
                <Bookmark size={16} style={{ color: C.ink }} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.6)" }}>
                <MoreHorizontal size={16} style={{ color: C.ink }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* title row overlapping */}
      <div className="-mt-8 px-5">
        <div className="flex items-end gap-4">
          <div style={{ width: 84 }}>
            <Cover title="Atomic Habits" from={COVERS["Atomic Habits"][0]} to={COVERS["Atomic Habits"][1]} h={112} />
          </div>
          <div className="pb-1">
            <h1 className="text-[26px] leading-none" style={{ fontFamily: serif }}>
              Atomic Habits
            </h1>
            <p className="mt-1 text-sm" style={{ color: C.sub }}>
              James Clear
            </p>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Star size={14} fill={C.gold} color={C.gold} />
              <span className="font-semibold">4.8</span>
              <span style={{ color: C.muted }}>(12.4k)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-5 text-sm" style={{ color: C.sub }}>
          <span className="flex items-center gap-1.5">
            <Clock size={15} /> 15 min review
          </span>
          <span className="flex items-center gap-1.5">
            <ListChecks size={15} /> 8 principles
          </span>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-4 flex gap-5 overflow-x-auto px-5" style={{ borderBottom: `1px solid ${C.line}`, scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => onTab(t)}
            className="pb-2.5 text-sm"
            style={{
              color: tab === t ? C.ink : C.muted,
              fontWeight: tab === t ? 600 : 400,
              borderBottom: `2px solid ${tab === t ? C.green : "transparent"}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* body */}
      <div className="px-5 pt-5">
        <h2 className="text-[19px]" style={{ fontFamily: serif }}>
          The Power of Tiny Changes
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.sub }}>
          Small habits, when repeated consistently, compound into remarkable results. You do not
          rise to the level of your goals — you fall to the level of your systems.
        </p>

        <div className="mt-4 rounded-2xl p-4" style={{ background: C.cream2, border: `1px solid ${C.line}` }}>
          <p className="text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
            Key Takeaway
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            You do not rise to the level of your goals. You fall to the level of your systems.
          </p>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
          Core Themes
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {THEMES.map((t, i) => (
            <div key={t} className="flex items-center gap-2.5 rounded-xl bg-white p-3" style={{ border: `1px solid ${C.line}` }}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: C.cream2, color: C.green, fontFamily: serif }}>
                {i + 1}
              </span>
              <span className="text-[13px] font-medium leading-tight">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 pt-6">
        <button onClick={() => nav?.go("reader")} className="w-full rounded-full py-4 text-[15px] font-semibold text-white" style={{ background: C.green }}>
          Continue Reading
        </button>
      </div>
    </Shell>
  );
}
