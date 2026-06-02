import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetSession, useGetLesson, useCompleteLessonInSession, useSubmitQuizAnswer,
  getGetSessionQueryKey, getGetLessonQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Zap, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

function SectionCard({ section, visible }: { section: any; visible: boolean }) {
  const colors: Record<string, string> = {
    insight: "border-primary/40 bg-primary/5",
    quote: "border-accent/40 bg-accent/5",
    challenge: "border-orange-500/40 bg-orange-500/5",
    reflection: "border-purple-500/40 bg-purple-500/5",
    visual: "border-cyan-500/40 bg-cyan-500/5",
    text: "border-border bg-card",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-2xl border p-5 space-y-2", colors[section.type] ?? "border-border bg-card")}
    >
      {section.type !== "text" && (
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{section.type}</span>
      )}
      {section.title && <h3 className="font-bold text-foreground">{section.title}</h3>}
      <p className={cn("text-sm leading-relaxed", section.type === "quote" ? "italic text-accent font-medium" : "text-foreground/90")}>
        {section.content}
      </p>
      {section.highlight && (
        <div className="mt-2 border-l-2 border-primary pl-3">
          <p className="text-xs text-primary font-semibold">{section.highlight}</p>
        </div>
      )}
    </motion.div>
  );
}

function QuizCard({
  quiz, sessionId, onComplete,
}: {
  quiz: any; sessionId: number; onComplete: (correct: boolean, xp: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; correctIndex: number; explanation: string; xpEarned: number } | null>(null);
  const submitAnswer = useSubmitQuizAnswer();

  async function handleSelect(idx: number) {
    if (result) return;
    setSelected(idx);
    const r = await submitAnswer.mutateAsync({ sessionId, data: { quizId: quiz.id, selectedIndex: idx } });
    setResult(r);
    setTimeout(() => onComplete(r.correct, r.xpEarned), 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Quick Check</span>
        <p className="font-semibold text-foreground">{quiz.question}</p>
      </div>
      <div className="space-y-2">
        {quiz.options.map((opt: string, i: number) => {
          const isSelected = selected === i;
          const isCorrect = result && i === result.correctIndex;
          const isWrong = result && isSelected && !result.correct;
          return (
            <button
              key={i}
              data-testid={`button-quiz-option-${i}`}
              disabled={!!result}
              onClick={() => handleSelect(i)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300",
                isCorrect ? "bg-green-500/15 border-green-500 text-green-400" :
                isWrong ? "bg-red-500/15 border-red-500 text-red-400" :
                isSelected ? "bg-primary/15 border-primary text-primary" :
                "bg-secondary border-border text-foreground hover:border-primary/40"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={cn("flex items-start gap-2 p-3 rounded-xl text-xs", result.correct ? "bg-green-500/10 text-green-400" : "bg-orange-500/10 text-orange-400")}
        >
          {result.correct ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <X className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <p>{result.explanation} <span className="font-bold">+{result.xpEarned} XP</span></p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function LearnSession() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const id = Number(sessionId);

  const { data: session } = useGetSession(id, { query: { enabled: !!id, queryKey: getGetSessionQueryKey(id) } });

  const currentLesson = session?.lessonsToComplete[session.currentLessonIndex ?? 0];
  const lessonId = currentLesson?.id ?? 0;
  const contentId = currentLesson?.contentId ?? 0;

  const { data: lessonDetail } = useGetLesson(contentId, lessonId, {
    query: { enabled: !!contentId && !!lessonId, queryKey: getGetLessonQueryKey(contentId, lessonId) },
  });

  const [quizComplete, setQuizComplete] = useState(false);
  const [xpAnimation, setXpAnimation] = useState<number | null>(null);
  const completeLesson = useCompleteLessonInSession();

  useEffect(() => { setQuizComplete(false); }, [lessonId]);

  const sections = lessonDetail?.content?.sections ?? [];
  const quiz = lessonDetail?.content?.quiz;
  const totalLessons = session?.lessonsToComplete.length ?? 1;
  const currentIdx = session?.currentLessonIndex ?? 0;
  const progress = ((currentIdx) / totalLessons) * 100;

  async function handleCompleteLesson() {
    if (!session || !currentLesson) return;
    const result = await completeLesson.mutateAsync({ sessionId: id, data: { lessonId: currentLesson.id } });
    setXpAnimation(result.xpEarned);
    await qc.invalidateQueries({ queryKey: getGetSessionQueryKey(id) });
    setTimeout(() => {
      setXpAnimation(null);
      if (result.sessionComplete) {
        setLocation(`/learn/${id}/summary`);
      }
    }, 1000);
  }

  if (!session) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border px-5 py-3 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button
            data-testid="button-exit-session"
            onClick={() => setLocation(`/content/${session.contentId}`)}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Lesson {currentIdx + 1} of {totalLessons}</p>
            <p className="text-sm font-semibold truncate">{currentLesson?.title ?? "Loading..."}</p>
          </div>
          <div className="flex items-center gap-1 text-primary text-sm font-bold">
            <Zap className="w-4 h-4" />
            <span>{session.xpEarned}</span>
          </div>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={lessonId}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {sections.map((section: any, i: number) => (
              <SectionCard key={i} section={section} visible={true} />
            ))}

            {quiz && (quizComplete || true) && (
              <QuizCard
                quiz={quiz}
                sessionId={id}
                onComplete={(_, xp) => setQuizComplete(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border p-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          data-testid="button-complete-lesson"
          onClick={handleCompleteLesson}
          disabled={completeLesson.isPending}
          className="w-full py-4 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition disabled:opacity-60 relative overflow-hidden"
        >
          {completeLesson.isPending ? "Saving..." : currentIdx + 1 >= totalLessons ? "Complete Session" : "Next Lesson"}

          <AnimatePresence>
            {xpAnimation !== null && (
              <motion.span
                initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }} exit={{ opacity: 0 }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-yellow-300 font-bold text-sm pointer-events-none"
              >
                +{xpAnimation} XP
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
