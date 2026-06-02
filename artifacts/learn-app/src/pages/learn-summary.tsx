import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetSessionSummary, useSaveCard, useGetSession, getGetSessionSummaryQueryKey, getGetSessionQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Map, RotateCcw, Home } from "lucide-react";

export default function LearnSummary() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const id = Number(sessionId);
  const qc = useQueryClient();

  const { data: summary } = useGetSessionSummary(id, { query: { enabled: !!id, queryKey: getGetSessionSummaryQueryKey(id) } });
  const { data: session } = useGetSession(id, { query: { enabled: !!id, queryKey: getGetSessionQueryKey(id) } });
  const saveCard = useSaveCard();
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!summary || saved) return;
    await saveCard.mutateAsync({ data: { contentId: summary.contentId, lessonId: summary.lessonId } });
    setSaved(true);
  }

  if (!summary) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Hero card */}
      <div
        className="relative overflow-hidden pt-16 pb-10 px-6"
        style={{ background: `linear-gradient(160deg, ${summary.coverColor}cc, ${summary.accentColor ?? summary.coverColor}77)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
            <span className="text-2xl font-black text-white">
              {summary.title.charAt(0)}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">{summary.title}</h1>
          <p className="text-white/70 text-sm">Session Complete</p>
        </motion.div>
      </div>

      {/* Key takeaways */}
      <div className="flex-1 p-5 space-y-5 max-w-lg mx-auto w-full">
        <div className="space-y-3">
          <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Key Takeaways</h2>
          {(summary.keyTakeaways as string[]).map((takeaway, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
              className="flex items-start gap-3 bg-card border border-border rounded-xl p-4"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs text-white"
                style={{ background: summary.coverColor }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{takeaway}</p>
            </motion.div>
          ))}
        </div>

        {summary.coreInsight && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-primary/10 border border-primary/30 rounded-2xl p-5"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Core Insight</p>
            <p className="text-foreground font-medium leading-relaxed italic">"{summary.coreInsight}"</p>
          </motion.div>
        )}

        {/* XP earned */}
        {session && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-4 text-center"
          >
            <p className="text-3xl font-black text-primary">+{session.xpEarned} XP</p>
            <p className="text-sm text-muted-foreground mt-1">Earned this session</p>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 space-y-3 pb-10 max-w-lg mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.97 }}
          data-testid="button-save-card"
          onClick={handleSave}
          disabled={saved || saveCard.isPending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-border text-sm font-semibold hover:border-primary/40 transition disabled:opacity-50"
        >
          {saved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
          {saved ? "Saved to your library" : "Save Summary Card"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          data-testid="button-start-roadmap"
          onClick={() => setLocation("/roadmaps")}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition"
        >
          <Map className="w-4 h-4" />
          Start 30-Day Implementation
        </motion.button>

        <button
          data-testid="button-go-home"
          onClick={() => setLocation("/home")}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
