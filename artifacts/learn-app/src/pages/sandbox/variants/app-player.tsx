import { RotateCcw, RotateCw, Play, Moon, ListMusic } from "lucide-react";
import { C, serif, StatusBar } from "../warm-kit";

export const meta = { title: "App · Audio Player", note: "Warm mockup — Meditations (dark)" };

const BG = "#2F3B2C";
const BG2 = "#3C4A38";

export default function AppPlayer() {
  return (
    <div className="flex min-h-screen justify-center" style={{ background: C.outside }}>
      <div
        className="relative flex w-full max-w-[390px] flex-col"
        style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${BG2}, ${BG})`, color: "#fff" }}
      >
        {/* scenic backdrop */}
        <svg viewBox="0 0 390 300" className="absolute inset-x-0 top-0 h-[300px] w-full opacity-40" preserveAspectRatio="xMidYMid slice">
          <circle cx="300" cy="70" r="34" fill="#cdbb86" opacity="0.5" />
          <path d="M0 230 Q120 180 240 220 T390 205 V300 H0 Z" fill="#566B55" opacity="0.6" />
          <rect x="60" y="150" width="10" height="80" fill="#1f291d" opacity="0.5" />
          <polygon points="65,140 56,156 74,156" fill="#1f291d" opacity="0.5" />
        </svg>

        <div className="relative">
          <StatusBar light />
        </div>

        {/* album art */}
        <div className="relative mt-6 flex justify-center px-6">
          <div
            className="flex h-56 w-44 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(160deg, #EFE8D6, #D9CFB4)", boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}
          >
            <span className="select-none text-[80px] leading-none">🌿</span>
          </div>
        </div>

        {/* meta */}
        <div className="relative px-6 pt-7 text-center">
          <h1 className="text-[28px] leading-tight" style={{ fontFamily: serif }}>
            Meditations
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            Marcus Aurelius
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Chapter 4 · Stoic Wisdom
          </p>
        </div>

        {/* progress */}
        <div className="relative px-7 pt-7">
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            <div className="h-1.5 rounded-full" style={{ width: "50%", background: "#E4DCC4" }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            <span>06:24</span>
            <span>12:45</span>
          </div>
        </div>

        {/* controls */}
        <div className="relative flex items-center justify-center gap-9 px-6 pt-7">
          <button className="opacity-85">
            <RotateCcw size={26} />
          </button>
          <button
            className="flex h-[68px] w-[68px] items-center justify-center rounded-full"
            style={{ background: "#EDE6D3" }}
          >
            <Play size={26} fill={BG} color={BG} className="ml-0.5" />
          </button>
          <button className="opacity-85">
            <RotateCw size={26} />
          </button>
        </div>

        {/* bottom bar */}
        <div className="relative mt-auto flex items-center justify-between px-10 pb-10 pt-10" style={{ color: "rgba(255,255,255,0.7)" }}>
          <button className="text-sm font-semibold">1.0x</button>
          <button>
            <Moon size={20} />
          </button>
          <button>
            <ListMusic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
