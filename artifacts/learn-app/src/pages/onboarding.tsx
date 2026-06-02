import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const ROLES = ["Student", "Professional", "Entrepreneur", "Creator", "Researcher", "Other"];

const GOALS = [
  { id: "productivity", label: "Productivity" },
  { id: "focus", label: "Focus & Deep Work" },
  { id: "confidence", label: "Confidence" },
  { id: "leadership", label: "Leadership" },
  { id: "relationships", label: "Relationships" },
  { id: "creativity", label: "Creativity" },
  { id: "mindset", label: "Mindset" },
  { id: "health", label: "Health & Habits" },
  { id: "finance", label: "Finance" },
  { id: "communication", label: "Communication" },
];

const DURATIONS = [
  { value: 5, label: "5 min / day", sub: "Quick wins" },
  { value: 10, label: "10 min / day", sub: "Steady progress" },
  { value: 20, label: "20 min / day", sub: "Deep learner" },
  { value: 30, label: "30 min / day", sub: "Committed" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [dailyMinutes, setDailyMinutes] = useState(10);
  const qc = useQueryClient();
  const onboard = useCompleteOnboarding();

  const steps = [
    { title: "What should we call you?", subtitle: "Personalize your experience" },
    { title: "What best describes you?", subtitle: "We'll tailor your content" },
    { title: "What do you want to improve?", subtitle: "Select all that apply" },
    { title: "How much time can you commit?", subtitle: "We'll design your daily sessions" },
  ];

  const canProceed = [
    name.trim().length > 0,
    role.length > 0,
    goals.length > 0,
    true,
  ];

  function toggleGoal(id: string) {
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  }

  async function handleFinish() {
    await onboard.mutateAsync({
      data: { name: name.trim(), role: role.toLowerCase(), goals, learningStyle: "mixed", dailyMinutes },
    });
    await qc.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    setLocation("/home");
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-between px-6 py-12 overflow-hidden">
      {/* Progress dots */}
      <div className="flex gap-2 mt-4">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === step ? 24 : 8, opacity: i <= step ? 1 : 0.3 }}
            transition={{ duration: 0.3 }}
            className={cn("h-2 rounded-full", i <= step ? "bg-primary" : "bg-border")}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{steps[step].title}</h1>
            <p className="text-muted-foreground text-sm">{steps[step].subtitle}</p>
          </div>

          {step === 0 && (
            <input
              data-testid="input-name"
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r}
                  data-testid={`button-role-${r.toLowerCase()}`}
                  onClick={() => setRole(r)}
                  className={cn(
                    "py-3.5 px-4 rounded-xl border text-sm font-medium transition-all duration-200",
                    role === r
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                      : "bg-card border-border text-foreground hover:border-primary/50"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-2.5">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  data-testid={`button-goal-${g.id}`}
                  onClick={() => toggleGoal(g.id)}
                  className={cn(
                    "px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200",
                    goals.includes(g.id)
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/25"
                      : "bg-card border-border text-foreground hover:border-primary/40"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  data-testid={`button-duration-${d.value}`}
                  onClick={() => setDailyMinutes(d.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200",
                    dailyMinutes === d.value
                      ? "bg-primary/10 border-primary text-foreground shadow-md shadow-primary/20"
                      : "bg-card border-border text-foreground hover:border-primary/40"
                  )}
                >
                  <span className="font-semibold">{d.label}</span>
                  <span className="text-sm text-muted-foreground">{d.sub}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-sm space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          data-testid="button-next"
          disabled={!canProceed[step] || onboard.isPending}
          onClick={() => {
            if (step < steps.length - 1) setStep((s) => s + 1);
            else handleFinish();
          }}
          className="w-full py-4 rounded-xl font-semibold text-base bg-primary text-white disabled:opacity-40 transition-all duration-200 shadow-lg shadow-primary/30 hover:bg-primary/90"
        >
          {onboard.isPending ? "Setting up..." : step < steps.length - 1 ? "Continue" : "Start Learning"}
        </motion.button>
        {step > 0 && (
          <button
            data-testid="button-back"
            onClick={() => setStep((s) => s - 1)}
            className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
