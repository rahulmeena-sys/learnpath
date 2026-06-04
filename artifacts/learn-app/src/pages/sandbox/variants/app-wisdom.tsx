import { Heart, Bookmark, CalendarDays, ArrowRight } from "lucide-react";
import { C, serif, Shell, StatusBar, BottomNav } from "../warm-kit";

export const meta = { title: "App · Daily Wisdom", note: "Warm mockup — quote of the day" };

export default function AppWisdom() {
  return (
    <Shell>
      <StatusBar />
      <div className="flex items-start justify-between px-5 pt-3">
        <div>
          <h1 className="text-[26px] leading-tight" style={{ fontFamily: serif }}>
            Daily Wisdom
          </h1>
          <p className="mt-1 text-sm" style={{ color: C.muted }}>
            May 28
          </p>
        </div>
        <CalendarDays size={20} style={{ color: C.sub }} className="mt-1" />
      </div>

      <div className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-[28px] p-7" style={{ background: C.cream2, border: `1px solid ${C.line}` }}>
          <div className="pointer-events-none absolute bottom-3 right-3 select-none text-[110px] leading-none opacity-25">
            🏛️
          </div>
          <p className="text-5xl leading-none" style={{ color: C.gold, fontFamily: serif }}>
            “
          </p>
          <h2 className="max-w-[250px] text-[28px] leading-snug" style={{ fontFamily: serif }}>
            We suffer more often in imagination than in reality.
          </h2>
          <p className="mt-6 text-sm" style={{ color: C.sub }}>
            — Seneca
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 pt-4">
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}>
          <Heart size={18} style={{ color: C.sub }} />
        </button>
        <button
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
          style={{ background: C.green }}
        >
          <Bookmark size={16} /> Save
        </button>
      </div>

      <div className="px-5 pt-7">
        <p className="text-[13px] font-semibold">Reflect on this</p>
        <div
          className="mt-2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3"
          style={{ border: `1px solid ${C.line}` }}
        >
          <input
            placeholder="Write your thoughts…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: C.ink }}
          />
          <button className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: C.green }}>
            <ArrowRight size={16} color="#fff" />
          </button>
        </div>
      </div>

      <BottomNav active="home" />
    </Shell>
  );
}
