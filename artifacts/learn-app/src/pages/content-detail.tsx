import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetContent, useStartSession, getGetSessionQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Zap, BookOpen, Map, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DURATIONS = [
  { minutes: 2, label: "2 min", desc: "Core insight only" },
  { minutes: 5, label: "5 min", desc: "Key ideas" },
  { minutes: 10, label: "10 min", desc: "Deep dive" },
  { minutes: 20, label: "20 min", desc: "Full session" },
];

const TYPE_ICON = { concept: "C", story: "S", framework: "F", reflection: "R", challenge: "X" };

export default function ContentDetail() {
  const { contentId } = useParams();
  const [, setLocation] = useLocation();
  const [selectedDuration, setSelectedDuration] = useState(10);
  const qc = useQueryClient();

  const id = Number(contentId);
  const { data: content, isLoading } = useGetContent(id, { query: { enabled: !!id, queryKey: getGetContentQueryKey(id) } });
  const startSession = useStartSession();

  async function handleBegin() {
    const session = await startSession.mutateAsync({ data: { contentId: id, durationMinutes: selectedDuration } });
    setLocation(`/learn/${session.id}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Content not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Cover header */}
      <div
        className="relative h-72 overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${content.coverColor}dd, ${content.accentColor ?? content.coverColor}88)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        <div className="relative p-5 pt-12 flex flex-col h-full justify-between">
          <button
            data-testid="button-back"
            onClick={() => setLocation("/library")}
            className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70 bg-black/30 px-2 py-0.5 rounded-full">
              {content.type}
            </span>
            <h1 className="text-3xl font-bold text-white mt-2 leading-tight">{content.title}</h1>
            <p className="text-white/70 text-sm mt-1">{content.author}</p>
          </motion.div>
        </div>
      </div>

      <div className="p-5 space-y-6 max-w-lg mx-auto">
        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="w-4 h-4" /> {content.totalLessons} lessons
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" /> {content.estimatedMinutes}m
          </span>
          <span className="flex items-center gap-1.5 text-primary font-semibold">
            <Zap className="w-4 h-4" /> {content.xpReward} XP
          </span>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed">{content.description}</p>

        {/* Key insights */}
        {content.keyInsights && content.keyInsights.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Key Insights</h2>
            <div className="space-y-2">
              {(content.keyInsights as string[]).map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Lessons preview */}
        {content.lessonPreviews && content.lessonPreviews.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Lessons</h2>
            <div className="space-y-2">
              {(content.lessonPreviews as any[]).map((lesson: any, i: number) => (
                <div key={lesson.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{lesson.type} · {lesson.durationMinutes}m</p>
                  </div>
                  <span className="text-xs text-primary font-semibold">{lesson.xpReward} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duration selector */}
        <div className="space-y-3">
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Session Length</h2>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                data-testid={`button-duration-${d.minutes}`}
                onClick={() => setSelectedDuration(d.minutes)}
                className={cn(
                  "flex flex-col items-center py-3 rounded-xl border text-center transition-all duration-200",
                  selectedDuration === d.minutes
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border hover:border-primary/40"
                )}
              >
                <span className={cn("text-sm font-bold", selectedDuration === d.minutes ? "text-primary" : "text-foreground")}>
                  {d.label}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3 pb-8">
          <motion.button
            whileTap={{ scale: 0.97 }}
            data-testid="button-begin-learning"
            onClick={handleBegin}
            disabled={startSession.isPending}
            className="w-full py-4 rounded-xl font-bold text-base bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition disabled:opacity-50"
          >
            {startSession.isPending ? "Starting..." : "Begin Learning"}
          </motion.button>

          {content.hasRoadmap && (
            <button
              data-testid="button-view-roadmap"
              onClick={() => setLocation("/roadmaps")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-primary/40 transition"
            >
              <Map className="w-4 h-4" />
              Start 30-Day Implementation
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
