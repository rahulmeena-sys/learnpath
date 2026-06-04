import { PenSquare, Plus, ChevronRight } from "lucide-react";
import { C, serif, Shell, StatusBar, BottomNav } from "../warm-kit";

export const meta = { title: "App · Journal", note: "Warm mockup — reflections" };

const ENTRIES = [
  { date: "May 30", title: "On letting go of outcomes" },
  { date: "May 28", title: "Why small habits create big change" },
  { date: "May 26", title: "Designing my environment" },
];

export default function AppJournal() {
  return (
    <Shell>
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-3">
        <h1 className="text-[26px]" style={{ fontFamily: serif }}>
          Journal
        </h1>
        <PenSquare size={20} style={{ color: C.sub }} />
      </div>

      {/* new entry */}
      <div className="px-5 pt-5">
        <button
          className="flex w-full items-center justify-between rounded-3xl p-5 text-left"
          style={{ background: C.cream2, border: `1px solid ${C.line}` }}
        >
          <div>
            <p className="text-[15px] font-semibold" style={{ fontFamily: serif }}>
              New Entry
            </p>
            <p className="mt-1 text-xs" style={{ color: C.muted }}>
              What are you reflecting on today?
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: C.green }}>
            <Plus size={18} color="#fff" />
          </span>
        </button>
      </div>

      <div className="px-5 pt-7">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
          Recent Entries
        </p>
        <div className="mt-3 space-y-3">
          {ENTRIES.map((e) => (
            <div
              key={e.date}
              className="flex items-center justify-between rounded-2xl bg-white p-4"
              style={{ border: `1px solid ${C.line}` }}
            >
              <div>
                <p className="text-[11px]" style={{ color: C.gold }}>
                  {e.date}
                </p>
                <p className="mt-0.5 text-[15px]" style={{ fontFamily: serif }}>
                  {e.title}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: C.muted }} />
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="journal" />
    </Shell>
  );
}
