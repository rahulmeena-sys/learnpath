import { ChevronLeft, ChevronRight, Type } from "lucide-react";
import { C, serif, Shell, StatusBar, useNav } from "../warm-kit";

export const meta = { title: "App · Learn / Session", note: "Warm mockup — reading view" };

export default function AppReader() {
  const nav = useNav();
  return (
    <Shell pad={false}>
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-2">
        <button onClick={() => nav?.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}>
          <ChevronLeft size={18} style={{ color: C.ink }} />
        </button>
        <span className="text-xs" style={{ color: C.muted }}>
          Chapter 3 of 7
        </span>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}>
          <Type size={16} style={{ color: C.ink }} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-8">
        <h1 className="text-[30px] leading-tight" style={{ fontFamily: serif }}>
          Make It Easy
        </h1>

        <div className="mt-6 rounded-[24px] p-6" style={{ background: C.cream2, border: `1px solid ${C.line}` }}>
          <p className="text-4xl leading-none" style={{ color: C.gold, fontFamily: serif }}>
            “
          </p>
          <p className="text-[22px] leading-snug" style={{ fontFamily: serif }}>
            Make it easy to do right and hard to do wrong.
          </p>
        </div>

        <p className="mt-6 text-[15px] leading-relaxed" style={{ color: C.sub }}>
          The environment often matters more than willpower. Design your surroundings to make good
          habits easier and bad habits harder. When the right choice is the easy choice, consistency
          takes care of itself.
        </p>
      </div>

      {/* footer controls */}
      <div className="flex items-center justify-between px-8 pb-10 pt-6">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}>
          <ChevronLeft size={20} style={{ color: C.sub }} />
        </button>
        <span className="text-sm" style={{ color: C.muted }}>
          3 / 12
        </span>
        <button onClick={() => nav?.go("principles")} className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: C.green }}>
          <ChevronRight size={20} color="#fff" />
        </button>
      </div>
    </Shell>
  );
}
