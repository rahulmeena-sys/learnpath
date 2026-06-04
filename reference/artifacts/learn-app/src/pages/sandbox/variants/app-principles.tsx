import { ChevronLeft, Bookmark } from "lucide-react";
import { C, serif, Shell, StatusBar, Pill, useNav } from "../warm-kit";

export const meta = { title: "App · Summary / Principles", note: "Warm mockup — key principles" };

const PRINCIPLES = [
  { title: "Make it Obvious", desc: "Make the cues clear and visible." },
  { title: "Make it Attractive", desc: "Make the habit feel rewarding." },
  { title: "Make it Easy", desc: "Reduce friction and simplify." },
  { title: "Make it Satisfying", desc: "Get immediate satisfaction." },
];

export default function AppPrinciples() {
  const nav = useNav();
  return (
    <Shell pad={false}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2">
        <button onClick={() => nav?.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}>
          <ChevronLeft size={18} style={{ color: C.ink }} />
        </button>
        <span className="text-sm" style={{ color: C.sub }}>
          Summary / Principles
        </span>
      </div>

      <div className="px-5 pt-5">
        <h1 className="text-[26px] leading-tight" style={{ fontFamily: serif }}>
          Key Principles
          <br />
          from this book
        </h1>
      </div>

      <div className="px-5 pt-4">
        <Pill active>All</Pill>
      </div>

      <div className="space-y-3 px-5 pt-5">
        {PRINCIPLES.map((p, i) => (
          <div
            key={p.title}
            className="flex items-start gap-4 rounded-2xl bg-white p-4"
            style={{ border: `1px solid ${C.line}` }}
          >
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
              style={{ background: C.cream2, color: C.green, fontFamily: serif }}
            >
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold" style={{ fontFamily: serif }}>
                {p.title}
              </p>
              <p className="mt-0.5 text-[13px]" style={{ color: C.muted }}>
                {p.desc}
              </p>
            </div>
            <Bookmark size={16} style={{ color: C.muted }} className="mt-1" />
          </div>
        ))}
      </div>
    </Shell>
  );
}
