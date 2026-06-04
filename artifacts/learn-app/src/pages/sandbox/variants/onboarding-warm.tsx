import { useState } from "react";
import {
  ChevronLeft,
  GraduationCap,
  Briefcase,
  Lightbulb,
  PenLine,
  Microscope,
  MoreHorizontal,
  Clock,
  Check,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";
import { useNav } from "../warm-kit";

export const meta = {
  title: "Onboarding — warm/serif (5 steps)",
  note: "Reproduction of the 'Onboarding screen' mockup",
};

/* ---- palette (warm/cream theme) ---- */
const CREAM = "#F4F1EA";
const CARD = "#FFFFFF";
const GREEN = "#566B55";
const GREEN_DK = "#46583F";
const INK = "#26261F";
const MUTED = "#8C887E";
const LINE = "#E4DECF";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-medium" style={{ color: INK }}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={18} />
      </div>
    </div>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-3 px-6 pt-2">
      <span className="text-xs" style={{ color: MUTED }}>
        {step + 1} of {total}
      </span>
      <div className="flex flex-1 items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-[3px] rounded-full transition-all"
            style={{
              width: i === step ? 26 : 16,
              background: i <= step ? GREEN : LINE,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center" style={{ background: "#1c1c1c" }}>
      <div
        className="flex w-full max-w-[390px] flex-col"
        style={{ background: CREAM, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}
      >
        {children}
      </div>
    </div>
  );
}

function Title({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-7 pt-8 text-center">
      <h1 className="text-[28px] leading-tight" style={{ color: INK, fontFamily: "Georgia, serif" }}>
        {title}
      </h1>
      <p className="mt-2 text-sm" style={{ color: MUTED }}>
        {subtitle}
      </p>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full py-4 text-[15px] font-semibold text-white transition active:scale-[0.98]"
      style={{ background: GREEN }}
    >
      {children}
    </button>
  );
}

const ROLES = [
  { id: "student", label: "Student", Icon: GraduationCap },
  { id: "professional", label: "Professional", Icon: Briefcase },
  { id: "entrepreneur", label: "Entrepreneur", Icon: Lightbulb },
  { id: "creator", label: "Creator", Icon: PenLine },
  { id: "researcher", label: "Researcher", Icon: Microscope },
  { id: "other", label: "Other", Icon: MoreHorizontal },
];

const GOALS = [
  "Productivity",
  "Focus & Deep Work",
  "Confidence",
  "Leadership",
  "Relationships",
  "Creativity",
  "Mindset",
  "Health & Habits",
  "Finance",
  "Communication",
];

const DURATIONS = [
  { label: "5 min / day", sub: "Quick wins" },
  { label: "10 min / day", sub: "Steady progress" },
  { label: "20 min / day", sub: "Deep learner" },
  { label: "30 min / day", sub: "Committed" },
];

export default function OnboardingWarm() {
  const TOTAL = 5;
  const nav = useNav();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("professional");
  const [goals, setGoals] = useState<string[]>([
    "Productivity",
    "Focus & Deep Work",
    "Confidence",
    "Health & Habits",
  ]);
  const [minutes, setMinutes] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const toggleGoal = (g: string) =>
    setGoals((p) => (p.includes(g) ? p.filter((x) => x !== g) : [...p, g]));

  /* ---------- STEP 3: Philosophy profile (interstitial result) ---------- */
  if (step === 3) {
    return (
      <Shell>
        <StatusBar />
        <div className="flex items-center px-5 pt-2">
          <button onClick={back} style={{ color: INK }}>
            <ChevronLeft size={22} />
          </button>
        </div>
        <div className="px-7 pt-2 text-center">
          <p className="text-xs tracking-wide" style={{ color: MUTED }}>
            Your Philosophy Profile
          </p>
          <h1 className="mt-1 text-[30px]" style={{ color: INK, fontFamily: "Georgia, serif" }}>
            Stoic Builder
          </h1>
          <p className="mx-auto mt-2 max-w-[260px] text-sm" style={{ color: MUTED }}>
            You value discipline, clarity and consistent action.
          </p>
        </div>

        {/* statue illustration placeholder */}
        <div className="mx-7 mt-5 overflow-hidden rounded-3xl" style={{ background: "#ECE6D8" }}>
          <div className="flex h-44 items-end justify-center">
            <span className="text-[88px] leading-none">🏛️</span>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {["Disciplined", "Practical", "Focused"].map((t) => (
            <span
              key={t}
              className="rounded-full px-3 py-1 text-xs"
              style={{ background: CARD, color: INK, border: `1px solid ${LINE}` }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="space-y-3 px-7 pt-5">
          <div className="flex items-start gap-3">
            <TrendingUp size={18} style={{ color: GREEN }} className="mt-0.5" />
            <div>
              <p className="text-sm font-semibold" style={{ color: INK }}>
                Strength
              </p>
              <p className="text-sm" style={{ color: MUTED }}>
                Turn ideas into routines.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} style={{ color: "#B9893E" }} className="mt-0.5" />
            <div>
              <p className="text-sm font-semibold" style={{ color: INK }}>
                Blind spot
              </p>
              <p className="text-sm" style={{ color: MUTED }}>
                Overthink reflection while chasing progress.
              </p>
            </div>
          </div>
        </div>

        <div className="px-7 pt-5">
          <p className="text-[11px] uppercase tracking-widest" style={{ color: MUTED }}>
            Recommended for you
          </p>
          <p className="mt-1 text-sm" style={{ color: INK }}>
            Atomic Habits · Deep Work · Meditations
          </p>
        </div>

        <div className="mt-auto px-6 pb-8 pt-6">
          <PrimaryButton onClick={next}>See My Path</PrimaryButton>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <StatusBar />
      <Progress step={step} total={TOTAL} />

      {step === 0 && (
        <>
          <Title title="What should we call you?" subtitle="Personalize your experience" />
          <div className="flex flex-1 flex-col items-center justify-center px-7">
            <div className="mb-8 flex h-40 w-full items-end justify-center rounded-3xl" style={{ background: "transparent" }}>
              <span className="text-[96px] leading-none">🌿</span>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl bg-transparent px-4 py-4 text-[15px] outline-none"
              style={{ border: `1px solid ${LINE}`, color: INK }}
            />
          </div>
          <div className="px-6 pb-8 pt-4">
            <PrimaryButton onClick={next}>Continue</PrimaryButton>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <Title title="What best describes you?" subtitle="We'll tailor your content" />
          <div className="grid grid-cols-2 gap-3 px-6 pt-7">
            {ROLES.map(({ id, label, Icon }) => {
              const active = role === id;
              return (
                <button
                  key={id}
                  onClick={() => setRole(id)}
                  className="flex flex-col items-center gap-3 rounded-2xl py-6 transition"
                  style={{
                    background: active ? GREEN : CARD,
                    color: active ? "#fff" : INK,
                    border: `1px solid ${active ? GREEN : LINE}`,
                  }}
                >
                  <Icon size={22} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex items-center gap-4 px-6 pb-8 pt-6">
            <button onClick={back} className="text-sm" style={{ color: MUTED }}>
              Back
            </button>
            <div className="flex-1">
              <PrimaryButton onClick={next}>Continue</PrimaryButton>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Title title="What do you want to improve?" subtitle="Select all that apply" />
          <div className="flex flex-wrap gap-2.5 px-6 pt-7">
            {GOALS.map((g) => {
              const active = goals.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm transition"
                  style={{
                    background: active ? GREEN : CARD,
                    color: active ? "#fff" : INK,
                    border: `1px solid ${active ? GREEN : LINE}`,
                  }}
                >
                  {g}
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex items-center gap-4 px-6 pb-8 pt-6">
            <button onClick={back} className="text-sm" style={{ color: MUTED }}>
              Back
            </button>
            <div className="flex-1">
              <PrimaryButton onClick={next}>Continue</PrimaryButton>
            </div>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <Title title="How much time can you commit?" subtitle="We'll design your daily sessions" />
          <div className="space-y-3 px-6 pt-7">
            {DURATIONS.map((d, i) => {
              const active = minutes === i;
              return (
                <button
                  key={d.label}
                  onClick={() => setMinutes(i)}
                  className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left transition"
                  style={{
                    background: CARD,
                    border: `1px solid ${active ? GREEN : LINE}`,
                  }}
                >
                  <Clock size={18} style={{ color: active ? GREEN : MUTED }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: INK }}>
                      {d.label}
                    </p>
                    <p className="text-xs" style={{ color: MUTED }}>
                      {d.sub}
                    </p>
                  </div>
                  {active && (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: GREEN }}
                    >
                      <Check size={13} color="#fff" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex items-center gap-4 px-6 pb-8 pt-6">
            <button onClick={back} className="text-sm" style={{ color: MUTED }}>
              Back
            </button>
            <div className="flex-1">
              <PrimaryButton onClick={() => (nav ? nav.go("home") : setStep(0))}>
                <span className="inline-flex items-center gap-2">
                  <Sparkles size={16} /> Start Learning
                </span>
              </PrimaryButton>
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
