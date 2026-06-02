import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetDailyFeed, useCompleteRoadmapTask, getGetDailyFeedQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Zap, CheckCircle, Play, Target, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEM_TYPE_STYLES: Record<string, string> = {
  task: "border-primary/30 bg-primary/5",
  challenge: "border-orange-500/30 bg-orange-500/5",
  reflection: "border-blue-500/30 bg-blue-500/5",
  "new-content": "border-accent/30 bg-accent/5",
  "streak-reminder": "border-orange-500/40 bg-orange-500/8",
  achievement: "border-yellow-500/30 bg-yellow-500/5",
};

const ITEM_ICONS: Record<string, any> = {
  task: Target,
  challenge: Zap,
  reflection: BookOpen,
  "new-content": Play,
  "streak-reminder": Flame,
  achievement: CheckCircle,
};

export default function Today() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: feed, isLoading } = useGetDailyFeed();
  const completeTask = useCompleteRoadmapTask();

  async function handleCompleteTask(item: any) {
    if (!item.roadmapId || !item.taskId) return;
    await completeTask.mutateAsync({ roadmapId: item.roadmapId, taskId: item.taskId });
    await qc.invalidateQueries({ queryKey: getGetDailyFeedQueryKey() });
  }

  const xpPct = feed ? Math.min((feed.xpEarnedToday / feed.dailyXpGoal) * 100, 100) : 0;

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Header */}
      <div className="px-5 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            {feed?.date ?? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-2xl font-bold mt-0.5">{feed?.greeting ?? "Good morning"}</h1>
        </motion.div>

        {/* Streak + XP */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold">{feed?.streakData.current ?? 0} day streak</span>
            </div>
            <div className="flex gap-1.5">
              {(feed?.streakData.daysThisWeek ?? Array(7).fill(false)).map((active: boolean, i: number) => {
                const days = ["M", "T", "W", "T", "F", "S", "S"];
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold",
                      active ? "bg-orange-500 text-white" : "bg-secondary text-muted-foreground"
                    )}>
                      {days[i]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* XP progress */}
        {feed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> Daily XP Goal
              </span>
              <span className="font-bold text-primary">{feed.xpEarnedToday}/{feed.dailyXpGoal}</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Feed items */}
      <div className="px-5 space-y-3">
        <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Today's Agenda</h2>

        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />)}
          </div>
        )}

        {feed?.items.map((item: any, i: number) => {
          const Icon = ITEM_ICONS[item.type] ?? Target;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 + 0.2 }}
              className={cn("rounded-2xl border p-4 space-y-2 cursor-pointer hover:border-primary/40 transition-colors", ITEM_TYPE_STYLES[item.type] ?? "border-border bg-card")}
              onClick={() => {
                if (item.type === "new-content" && item.contentId) setLocation(`/content/${item.contentId}`);
                else if (item.roadmapId) setLocation(`/roadmaps/${item.roadmapId}`);
              }}
              data-testid={`card-feed-${i}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                </div>
                {item.xpReward > 0 && (
                  <span className="text-xs font-bold text-primary flex items-center gap-1 flex-shrink-0">
                    <Zap className="w-3 h-3" />{item.xpReward}
                  </span>
                )}
              </div>
              {item.type === "task" && item.taskId && (
                <button
                  data-testid={`button-complete-feed-task-${item.taskId}`}
                  onClick={(e) => { e.stopPropagation(); handleCompleteTask(item); }}
                  className="w-full py-2 rounded-lg bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition"
                >
                  Mark Complete
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Suggested content */}
      {feed?.suggestedContent && feed.suggestedContent.length > 0 && (
        <div className="space-y-3">
          <div className="px-5">
            <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Discover</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5">
            {feed.suggestedContent.map((c: any, i: number) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.3 }}
                onClick={() => setLocation(`/content/${c.id}`)}
                data-testid={`card-suggested-${c.id}`}
                className="relative flex-shrink-0 w-36 h-48 rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${c.coverColor}cc, ${c.accentColor ?? c.coverColor}77)` }}
              >
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-3 flex flex-col h-full justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/60 bg-black/30 px-1.5 py-0.5 rounded-full w-fit">{c.type}</span>
                  <div>
                    <p className="text-white font-bold text-xs leading-tight line-clamp-2">{c.title}</p>
                    <p className="text-white/50 text-[10px] mt-0.5">{c.author}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
