import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetRoadmap, useCompleteRoadmapTask, getGetRoadmapQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, CheckCircle, Calendar, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TASK_TYPE_COLORS: Record<string, string> = {
  habit: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  challenge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  reflection: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "mini-game": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  action: "bg-green-500/15 text-green-400 border-green-500/30",
  review: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

function TaskCard({ task, onComplete }: { task: any; onComplete: (id: number) => void }) {
  const [completing, setCompleting] = useState(false);
  const [justDone, setJustDone] = useState(task.completed);

  async function handle() {
    if (justDone) return;
    setCompleting(true);
    await onComplete(task.id);
    setJustDone(true);
    setCompleting(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card border rounded-2xl p-4 space-y-3 transition", justDone ? "border-green-500/30 bg-green-500/5" : "border-border")}
    >
      <div className="flex items-start gap-3">
        <button
          data-testid={`button-complete-task-${task.id}`}
          onClick={handle}
          disabled={justDone || completing}
          className={cn(
            "w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
            justDone ? "bg-green-500 border-green-500" : "border-border hover:border-primary bg-transparent"
          )}
        >
          {justDone && <CheckCircle className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border capitalize", TASK_TYPE_COLORS[task.type])}>
              {task.type}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" /> {task.xpReward} XP
            </span>
          </div>
          <p className={cn("font-semibold text-sm", justDone && "line-through text-muted-foreground")}>{task.title}</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function RoadmapDetail() {
  const { roadmapId } = useParams();
  const [, setLocation] = useLocation();
  const id = Number(roadmapId);
  const qc = useQueryClient();

  const { data: roadmap, isLoading } = useGetRoadmap(id, { query: { enabled: !!id, queryKey: getGetRoadmapQueryKey(id) } });
  const completeTask = useCompleteRoadmapTask();

  async function handleComplete(taskId: number) {
    await completeTask.mutateAsync({ roadmapId: id, taskId });
    await qc.invalidateQueries({ queryKey: getGetRoadmapQueryKey(id) });
  }

  if (isLoading || !roadmap) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const pct = Math.round((roadmap.completedTasks / Math.max(roadmap.totalTasks, 1)) * 100);

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <div
        className="relative p-5 pt-12 pb-8"
        style={{ background: `linear-gradient(160deg, ${roadmap.coverColor ?? "#7c3aed"}cc, rgba(0,0,0,0.8))` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        <div className="relative">
          <button
            data-testid="button-back"
            onClick={() => setLocation("/roadmaps")}
            className="w-9 h-9 bg-black/30 rounded-full flex items-center justify-center mb-5"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white line-clamp-2">{roadmap.contentTitle}</h1>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-white/70 text-sm">
              <Calendar className="w-4 h-4" /> Day {roadmap.currentDay}/{roadmap.durationDays}
            </span>
            <span className="flex items-center gap-1.5 text-white/70 text-sm">
              <Zap className="w-4 h-4" /> {roadmap.xpEarned} XP
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-white/60">
              <span>{roadmap.completedTasks} tasks done</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="p-5 space-y-6 max-w-lg mx-auto">
        {roadmap.todaysTasks && roadmap.todaysTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Today — Day {roadmap.currentDay}</h2>
            {(roadmap.todaysTasks as any[]).map((task) => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} />
            ))}
          </div>
        )}

        {roadmap.upcomingTasks && (roadmap.upcomingTasks as any[]).length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Coming Up</h2>
            {(roadmap.upcomingTasks as any[]).map((task) => (
              <div key={task.id} className="bg-card/50 border border-border/50 rounded-2xl p-4 opacity-60">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Day {task.day}</span>
                </div>
                <p className="font-semibold text-sm text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
              </div>
            ))}
          </div>
        )}

        {roadmap.recentlyCompleted && (roadmap.recentlyCompleted as any[]).length > 0 && (
          <div className="space-y-2">
            <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Recently Completed</h2>
            {(roadmap.recentlyCompleted as any[]).slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-3 bg-card/40 border border-border/40 rounded-xl px-4 py-3 opacity-60">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-muted-foreground line-through truncate">{task.title}</p>
              </div>
            ))}
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  );
}
