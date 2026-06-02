import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetProfile, useGetProfileStats, useListAchievements, getGetProfileQueryKey, getGetProfileStatsQueryKey } from "@workspace/api-client-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from "recharts";
import { Bookmark, Zap, Flame, Trophy, BookOpen, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-[${color}]/15`)}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const { data: profile } = useGetProfile();
  const { data: stats } = useGetProfileStats();
  const { data: achievements } = useListAchievements();

  const xpToNextLevel = profile ? ((profile.level) * (profile.level) * 50) - profile.xp : 0;
  const xpForLevel = profile ? ((profile.level - 1) * (profile.level - 1) * 50) : 0;
  const xpForNextLevel = profile ? (profile.level * profile.level * 50) : 100;
  const levelPct = profile ? Math.min(((profile.xp - xpForLevel) / (xpForNextLevel - xpForLevel)) * 100, 100) : 0;

  const chartData = stats?.xpHistory?.map((h) => ({
    date: h.date.slice(5),
    xp: h.xp,
  })) ?? [];

  const unlockedAchievements = achievements?.filter((a) => a.unlocked) ?? [];
  const lockedAchievements = achievements?.filter((a) => !a.unlocked) ?? [];

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Header */}
      <div className="px-5 space-y-4">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
            style={{ background: profile?.avatarColor ?? "#7c3aed" }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() ?? "L"}
          </motion.div>
          <div>
            <h1 className="text-xl font-bold">{profile?.name ?? "Learner"}</h1>
            <p className="text-sm text-muted-foreground capitalize">{profile?.role ?? "Learner"}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(profile?.goals as string[] ?? []).slice(0, 3).map((g) => (
                <span key={g} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium capitalize">{g}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Level + XP */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary font-black text-sm">{profile?.level ?? 1}</span>
              </div>
              <span className="font-bold">Level {profile?.level ?? 1}</span>
            </div>
            <span className="text-xs text-muted-foreground">{profile?.xp ?? 0} XP total</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${levelPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">{xpToNextLevel > 0 ? `${xpToNextLevel} XP to level ${(profile?.level ?? 1) + 1}` : "Max level!"}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{stats?.streak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{stats?.contentCompleted ?? 0}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Target className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{stats?.lessonsCompleted ?? 0}</p>
            <p className="text-xs text-muted-foreground">Lessons done</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{stats?.totalMinutesLearned ?? 0}m</p>
            <p className="text-xs text-muted-foreground">Time learned</p>
          </div>
        </div>
      </div>

      {/* XP Chart */}
      {chartData.length > 0 && (
        <div className="px-5">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm">XP This Week</h2>
              <span className="text-primary font-bold text-sm flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />{stats?.xpThisWeek ?? 0}
              </span>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f0f14", border: "1px solid #1e1e2a", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#9ca3af" }}
                    itemStyle={{ color: "#7c3aed" }}
                  />
                  <Area dataKey="xp" stroke="#7c3aed" strokeWidth={2} fill="url(#xpGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="px-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">Achievements</h2>
          <span className="text-xs text-muted-foreground">{unlockedAchievements.length}/{achievements?.length ?? 0} unlocked</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {achievements?.slice(0, 9).map((a) => (
            <motion.div
              key={a.id}
              data-testid={`badge-achievement-${a.id}`}
              className={cn(
                "bg-card border rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center",
                a.unlocked ? "border-primary/30 bg-primary/5" : "border-border opacity-50"
              )}
            >
              <span className="text-2xl">{a.icon}</span>
              <p className={cn("text-[10px] font-semibold leading-tight", a.unlocked ? "text-foreground" : "text-muted-foreground")}>{a.title}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Saved cards shortcut */}
      <div className="px-5">
        <button
          data-testid="button-saved-cards"
          onClick={() => setLocation("/saved")}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">Saved Summary Cards</p>
            <p className="text-xs text-muted-foreground">Review your saved insights</p>
          </div>
        </button>
      </div>

      <div className="pb-4" />
    </div>
  );
}
