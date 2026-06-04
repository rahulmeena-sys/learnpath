import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedContent, useGetProfile } from "@workspace/api-client-react";
import { BookOpen, Zap, Flame, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/feedback/states";

function ContentTile({ item, index }: { item: any; index: number }) {
  const [, setLocation] = useLocation();
  const progress = item.userProgress ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      data-testid={`card-content-${item.id}`}
      onClick={() => setLocation(`/content/${item.id}`)}
      className="relative flex-shrink-0 w-44 rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: `linear-gradient(135deg, ${item.coverColor}cc, ${item.accentColor ?? item.coverColor}88)` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative p-4 flex flex-col h-56 justify-between">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70 bg-black/30 px-2 py-0.5 rounded-full">
            {item.type}
          </span>
          {progress > 0 && (
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                <circle
                  cx="16" cy="16" r="13" fill="none" stroke="white" strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 13}`}
                  strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">{progress}%</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{item.title}</p>
          <p className="text-white/60 text-xs mb-3">{item.author}</p>
          <button
            data-testid={`button-start-${item.id}`}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full transition group-hover:bg-white/30"
          >
            <Play className="w-3 h-3 fill-white" />
            {item.isStarted ? "Continue" : "Begin"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Section({ section, startIndex }: { section: any; startIndex: number }) {
  return (
    <div className="space-y-3">
      <div className="px-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">{section.title}</h2>
          <p className="text-xs text-muted-foreground">{section.subtitle}</p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
        {section.items.map((item: any, i: number) => (
          <ContentTile key={item.id} item={item} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featured, isLoading, isError, refetch } = useGetFeaturedContent();
  const { data: profile } = useGetProfile();

  const dailyGoal = profile?.dailyMinutes ? profile.dailyMinutes * 2 : 20;
  const xpToday = 0;
  const xpPct = Math.min((xpToday / dailyGoal) * 100, 100);

  return (
    <div className="pb-6 space-y-8 pt-6">
      {/* Header */}
      <div className="px-5 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-sm text-muted-foreground">Good morning</p>
          <h1 className="text-2xl font-bold tracking-tight">{profile?.name ?? "Learner"}</h1>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="flex gap-3"
        >
          <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{profile?.streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
          </div>
          <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{profile?.xp ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
        </motion.div>

        {/* XP progress */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-4 space-y-2"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Today's goal</span>
            <span className="font-semibold text-primary">{xpToday}/{dailyGoal} XP</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Continue Reading */}
      {featured?.continueReading && featured.continueReading.length > 0 && (
        <div className="space-y-3">
          <div className="px-5 flex items-center justify-between">
            <h2 className="font-bold text-foreground">Continue Learning</h2>
            <button onClick={() => setLocation("/library")} className="text-xs text-primary font-medium flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5">
            {featured.continueReading.map((item, i) => (
              <ContentTile key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <ErrorState message="We couldn't load your feed." onRetry={() => refetch()} />
      )}

      {/* Featured sections */}
      {isLoading && (
        <div className="px-5 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-32 bg-card rounded-lg animate-pulse" />
              <div className="flex gap-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex-shrink-0 w-44 h-56 bg-card rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {featured?.sections.map((section, si) => (
        <Section key={si} section={section} startIndex={si * 8} />
      ))}

      {/* Library shortcut */}
      <div className="px-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocation("/library")}
          className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Full Library</p>
              <p className="text-xs text-muted-foreground">Books, podcasts, frameworks & more</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.button>
      </div>
    </div>
  );
}
