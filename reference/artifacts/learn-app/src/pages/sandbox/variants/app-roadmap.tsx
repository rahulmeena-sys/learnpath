import { Check, Lock, Menu } from "lucide-react";
import { C, serif, Shell, StatusBar, BottomNav, useNav } from "../warm-kit";

export const meta = { title: "App · Your Roadmap", note: "Warm mockup — week timeline" };

const WEEKS = [
  { week: "Week 1", title: "Identity Shift", sub: "3/3 tasks", done: true },
  { week: "Week 2", title: "Environment Design", locked: true },
  { week: "Week 3", title: "Habit Building", locked: true },
  { week: "Week 4", title: "System & Review", locked: true },
];

export default function AppRoadmap() {
  const nav = useNav();
  return (
    <Shell>
      <StatusBar />
      <div className="flex items-start justify-between px-5 pt-3">
        <div>
          <h1 className="text-[26px] leading-tight" style={{ fontFamily: serif }}>
            Your Roadmap
          </h1>
          <p className="mt-1 max-w-[250px] text-sm" style={{ color: C.muted }}>
            A step-by-step path to put ideas into practice.
          </p>
        </div>
        <Menu size={20} style={{ color: C.sub }} className="mt-1" />
      </div>

      <div className="relative px-5 pt-7">
        {/* connecting line */}
        <div className="absolute bottom-6 left-[34px] top-9" style={{ width: 2, background: C.line }} />

        <div className="space-y-6">
          {WEEKS.map((w) => (
            <div key={w.week} onClick={() => w.done && nav?.go("reader")} className={`relative flex items-start gap-4 ${w.done ? "cursor-pointer" : ""}`}>
              <div
                className="z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background: w.done ? C.green : C.card,
                  border: `2px solid ${w.done ? C.green : C.line}`,
                }}
              >
                {w.done ? <Check size={16} color="#fff" /> : <Lock size={14} style={{ color: C.muted }} />}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
                  {w.week}
                </p>
                <p className="text-[16px] font-medium" style={{ fontFamily: serif, color: w.locked ? C.sub : C.ink }}>
                  {w.title}
                </p>
                {w.sub && (
                  <p className="text-xs" style={{ color: C.green }}>
                    {w.sub}
                  </p>
                )}
              </div>
              {w.done && <span className="select-none text-2xl">🌱</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-8">
        <div
          className="flex items-center justify-between rounded-3xl p-5"
          style={{ background: C.cream2, border: `1px solid ${C.line}` }}
        >
          <div className="max-w-[200px]">
            <h3 className="text-[15px] font-semibold" style={{ fontFamily: serif }}>
              Track Your Progress
            </h3>
            <p className="mt-1 text-xs" style={{ color: C.muted }}>
              Keep showing up. Small steps every day.
            </p>
          </div>
          <Ring pct={62} />
        </div>
      </div>

      <BottomNav active="path" />
    </Shell>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0">
      <svg width="62" height="62" className="-rotate-90">
        <circle cx="31" cy="31" r={r} fill="none" stroke={C.line} strokeWidth="5" />
        <circle
          cx="31" cy="31" r={r} fill="none" stroke={C.green} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{pct}%</span>
    </div>
  );
}
