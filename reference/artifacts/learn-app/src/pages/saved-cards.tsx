import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListSavedCards, useDeleteSavedCard, getListSavedCardsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Bookmark } from "lucide-react";

function CardView({ card, onDelete }: { card: any; onDelete: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="rounded-2xl overflow-hidden border border-border"
    >
      <div
        className="p-4 relative"
        style={{ background: `linear-gradient(135deg, ${card.coverColor}cc, ${card.accentColor ?? card.coverColor}77)` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs text-white/60 font-medium mb-0.5">{card.contentTitle}</p>
            <p className="font-bold text-white text-sm line-clamp-1">{card.lessonTitle}</p>
          </div>
          <button
            data-testid={`button-delete-card-${card.id}`}
            onClick={onDelete}
            className="w-8 h-8 bg-black/30 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>
      </div>
      <div className="bg-card p-4 space-y-2">
        {(card.keyTakeaways as string[]).slice(0, 3).map((t, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">{t}</p>
          </div>
        ))}
        {card.coreInsight && (
          <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">"{card.coreInsight}"</p>
        )}
        <p className="text-[10px] text-muted-foreground pt-1">Saved {new Date(card.savedAt).toLocaleDateString()}</p>
      </div>
    </motion.div>
  );
}

export default function SavedCards() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: cards, isLoading } = useListSavedCards();
  const deleteCard = useDeleteSavedCard();

  async function handleDelete(id: number) {
    await deleteCard.mutateAsync({ cardId: id });
    await qc.invalidateQueries({ queryKey: getListSavedCardsQueryKey() });
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border px-5 py-4 flex items-center gap-3 z-10">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/profile")}
          className="w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-bold text-lg">Saved Cards</h1>
      </div>

      <div className="p-5 space-y-4 max-w-lg mx-auto">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-40 bg-card rounded-2xl animate-pulse" />)}
          </div>
        )}

        {!isLoading && (!cards || cards.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 space-y-3"
          >
            <div className="w-14 h-14 bg-card border border-border rounded-2xl flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground">No saved cards yet</h3>
            <p className="text-sm text-muted-foreground">Complete lessons and save summary cards to review later.</p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {cards?.map((card) => (
            <CardView key={card.id} card={card} onDelete={() => handleDelete(card.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
