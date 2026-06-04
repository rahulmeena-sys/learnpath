import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useListRoadmaps, useGetFeaturedContent, useCreateRoadmap, type RoadmapInputDurationDays } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListRoadmapsQueryKey } from "@workspace/api-client-react";
import { Map, Plus, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/feedback/states";

const DURATION_OPTIONS = [
  { days: 30, label: "30 Days", sub: "Foundation" },
  { days: 60, label: "60 Days", sub: "Deep Work" },
  { days: 90, label: "90 Days", sub: "Mastery" },
];

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  return (
    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <circle
        cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Roadmaps() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: roadmaps, isLoading, isError, refetch } = useListRoadmaps();
  const { data: featured } = useGetFeaturedContent();
  const createRoadmap = useCreateRoadmap();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedContent, setSelectedContent] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [creating, setCreating] = useState(false);

  const allContent = featured?.sections.flatMap((s) => s.items).filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  ) ?? [];

  async function handleCreate() {
    if (!selectedContent) return;
    setCreating(true);
    try {
      const roadmap = await createRoadmap.mutateAsync({ data: { contentId: selectedContent, durationDays: selectedDuration as RoadmapInputDurationDays } });
      await qc.invalidateQueries({ queryKey: getListRoadmapsQueryKey() });
      setShowCreate(false);
      setLocation(`/roadmaps/${roadmap.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="pt-6 pb-6 space-y-6">
      <div className="px-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roadmaps</h1>
          <p className="text-sm text-muted-foreground">Turn knowledge into habits</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          data-testid="button-create-roadmap"
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {isError && (
        <ErrorState message="We couldn't load your roadmaps." onRetry={() => refetch()} />
      )}

      {isLoading && (
        <div className="px-5 space-y-3">
          {[0, 1].map((i) => <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />)}
        </div>
      )}

      {!isLoading && (!roadmaps || roadmaps.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mx-5 bg-card border border-border rounded-2xl p-8 text-center space-y-3"
        >
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Map className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-foreground">No active roadmaps</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Finish a book and start a 30, 60, or 90-day implementation plan.
          </p>
          <button
            data-testid="button-start-first-roadmap"
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/25"
          >
            Start a Roadmap
          </button>
        </motion.div>
      )}

      <div className="px-5 space-y-3">
        {roadmaps?.map((r, i) => {
          const pct = Math.round((r.completedTasks / Math.max(r.totalTasks, 1)) * 100);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              data-testid={`card-roadmap-${r.id}`}
              onClick={() => setLocation(`/roadmaps/${r.id}`)}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="relative flex items-center justify-center flex-shrink-0">
                <ProgressRing pct={pct} color={r.coverColor ?? "#7c3aed"} />
                <span className="absolute text-xs font-bold text-foreground">{pct}%</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{r.contentTitle}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" /> Day {r.currentDay}/{r.durationDays}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold capitalize px-2 py-0.5 rounded-full",
                    r.status === "active" ? "bg-green-500/15 text-green-400" : "bg-secondary text-muted-foreground"
                  )}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.completedTasks}/{r.totalTasks} tasks · {r.xpEarned} XP</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>

      {/* Create modal */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 25 }}
            className="bg-card border border-border rounded-t-3xl p-6 w-full max-w-lg space-y-5 pb-10"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1" />
            <h2 className="font-bold text-lg">New Roadmap</h2>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Choose Content</p>
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                {allContent.map((c) => (
                  <button
                    key={c.id}
                    data-testid={`button-select-content-${c.id}`}
                    onClick={() => setSelectedContent(c.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition",
                      selectedContent === c.id ? "bg-primary/10 border-primary" : "bg-secondary border-border hover:border-primary/40"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: c.coverColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</p>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d.days}
                    data-testid={`button-roadmap-duration-${d.days}`}
                    onClick={() => setSelectedDuration(d.days)}
                    className={cn(
                      "py-3 rounded-xl border text-center transition",
                      selectedDuration === d.days ? "bg-primary/10 border-primary" : "bg-secondary border-border"
                    )}
                  >
                    <p className={cn("text-sm font-bold", selectedDuration === d.days ? "text-primary" : "text-foreground")}>{d.label}</p>
                    <p className="text-[10px] text-muted-foreground">{d.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              data-testid="button-confirm-create-roadmap"
              onClick={handleCreate}
              disabled={!selectedContent || creating}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 disabled:opacity-40 transition"
            >
              {creating ? "Creating..." : "Start Roadmap"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
