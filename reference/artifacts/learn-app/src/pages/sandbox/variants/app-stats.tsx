import { Award, Compass, Flame } from "lucide-react";
import { C, serif, Shell, StatusBar, BottomNav } from "../warm-kit";

export const meta = { title: "App · Your Stats", note: "Warm mockup — profile stats" };

const STATS = [
  { label: "Reading Time", value: "36h 40m" },
  { label: "Books Read", value: "24" },
  { label: "Principles Saved", value: "112" },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const ACTIVE = [true, true, true, true, true, false, true];

const BADGES = [
  { Icon: Award, title: "Consistency", desc: "Read 7 days in a row", color: C.gold },
  { Icon: Compass, title: "Explorer", desc: "Read 10 books", color: C.green },
];

export default function AppStats() {
  return (
    <Shell>
      <StatusBar />
      <div className="px-5 pt-3">
        <h1 className="text-[26px] leading-tight" style={{ fontFamily: serif }}>
          Your Stats
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>
          Keep learning. Keep growing.
        </p>
      </div>

      {/* stat columns */}
      <div className="mx-5 mt-5 flex items-center justify-between rounded-3xl bg-white px-5 py-5" style={{ border: `1px solid ${C.line}` }}>
        {STATS.map((s, i) => (
          <div key={s.label} className="flex-1 text-center" style={{ borderLeft: i ? `1px solid ${C.line}` : "none" }}>
            <p className="text-[20px] font-bold" style={{ fontFamily: serif }}>
              {s.value}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: C.muted }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* streak */}
      <div className="mx-5 mt-4 rounded-3xl p-5" style={{ background: C.cream2, border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-2">
          <Flame size={18} style={{ color: "#C98A3C" }} />
          <span className="text-[18px] font-bold" style={{ fontFamily: serif }}>
            25 days
          </span>
          <span className="text-xs" style={{ color: C.muted }}>
            current streak
          </span>
        </div>
        <div className="mt-4 flex justify-between">
          {DAYS.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold"
                style={{
                  background: ACTIVE[i] ? C.green : C.card,
                  color: ACTIVE[i] ? "#fff" : C.muted,
                  border: `1px solid ${ACTIVE[i] ? C.green : C.line}`,
                }}
              >
                {d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* badges */}
      <div className="px-5 pt-6">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
          Badges
        </p>
        <div className="mt-3 space-y-3">
          {BADGES.map(({ Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl bg-white p-4" style={{ border: `1px solid ${C.line}` }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `${color}22` }}>
                <Icon size={20} style={{ color }} />
              </span>
              <div>
                <p className="text-[15px] font-semibold" style={{ fontFamily: serif }}>
                  {title}
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </Shell>
  );
}
