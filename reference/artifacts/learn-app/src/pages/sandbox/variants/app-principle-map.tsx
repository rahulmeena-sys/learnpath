import { ChevronLeft } from "lucide-react";
import { C, serif, Shell, StatusBar, useNav } from "../warm-kit";

export const meta = { title: "App · Principle Map", note: "Warm mockup — idea connections" };

// nodes positioned in % within the map area
const NODES = [
  { label: "Atomic Habits", x: 18, y: 14 },
  { label: "The Almanack of Naval", x: 74, y: 20 },
  { label: "Deep Work", x: 12, y: 52 },
  { label: "The Psychology of Money", x: 78, y: 60 },
  { label: "Meditations", x: 30, y: 86 },
];
const CENTER = { x: 50, y: 48 };

export default function AppPrincipleMap() {
  const nav = useNav();
  return (
    <Shell pad={false}>
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pt-2">
        <button onClick={() => nav?.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}>
          <ChevronLeft size={18} style={{ color: C.ink }} />
        </button>
        <span className="text-sm" style={{ color: C.sub }}>
          Principle Map
        </span>
      </div>

      <div className="px-5 pt-4">
        <h1 className="text-[24px]" style={{ fontFamily: serif }}>
          See how ideas connect
        </h1>
      </div>

      {/* map */}
      <div className="relative mx-4 mt-4 flex-1" style={{ minHeight: 420 }}>
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {NODES.map((n) => (
            <line
              key={n.label}
              x1={`${CENTER.x}%`}
              y1={`${CENTER.y}%`}
              x2={`${n.x}%`}
              y2={`${n.y}%`}
              stroke={C.line}
              strokeWidth={1.5}
            />
          ))}
        </svg>

        {NODES.map((n) => (
          <div
            key={n.label}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-center text-[11px] font-medium shadow-sm"
            style={{ left: `${n.x}%`, top: `${n.y}%`, border: `1px solid ${C.line}`, maxWidth: 120 }}
          >
            {n.label}
          </div>
        ))}

        <div
          className="absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-center text-[13px] font-semibold text-white"
          style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%`, background: C.green, fontFamily: serif }}
        >
          Discipline
        </div>
      </div>

      <div className="px-6 pb-10 pt-4 text-center">
        <p className="text-sm leading-relaxed" style={{ color: C.sub }}>
          Discipline is the foundation that connects every great idea.
        </p>
      </div>
    </Shell>
  );
}
