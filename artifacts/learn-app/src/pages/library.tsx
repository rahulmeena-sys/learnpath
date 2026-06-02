import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useListContent } from "@workspace/api-client-react";
import { Search, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  { value: undefined, label: "All" },
  { value: "book", label: "Books" },
  { value: "podcast", label: "Podcasts" },
  { value: "philosophy", label: "Philosophy" },
  { value: "framework", label: "Frameworks" },
  { value: "course", label: "Courses" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-green-400",
  intermediate: "text-yellow-400",
  advanced: "text-red-400",
};

export default function Library() {
  const [, setLocation] = useLocation();
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data: content, isLoading } = useListContent({ type: typeFilter });

  const filtered = content?.filter((c) =>
    search.trim() === "" ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.author.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="pt-6 pb-6 space-y-5">
      <div className="px-5 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-testid="input-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, authors..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>

        {/* Type filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.label}
              data-testid={`button-filter-${f.label.toLowerCase()}`}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200",
                typeFilter === f.value
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-5">
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No results found</p>
            <p className="text-sm text-muted-foreground">Try a different search or filter</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              data-testid={`card-library-${item.id}`}
              onClick={() => setLocation(`/content/${item.id}`)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{ background: `linear-gradient(135deg, ${item.coverColor}cc, ${item.accentColor ?? item.coverColor}77)` }}
            >
              <div className="absolute inset-0 bg-black/35" />
              <div className="relative p-4 flex flex-col h-52 justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/70 bg-black/30 px-2 py-0.5 rounded-full">
                    {item.type}
                  </span>
                  {item.userProgress != null && item.userProgress > 0 && (
                    <div className="relative w-7 h-7">
                      <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                        <circle
                          cx="14" cy="14" r="11" fill="none" stroke="white" strokeWidth="2.5"
                          strokeDasharray={`${2 * Math.PI * 11}`}
                          strokeDashoffset={`${2 * Math.PI * 11 * (1 - (item.userProgress ?? 0) / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-0.5">{item.title}</p>
                  <p className="text-white/60 text-xs mb-1">{item.author}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-semibold capitalize", DIFFICULTY_COLORS[item.difficulty])}>
                      {item.difficulty}
                    </span>
                    <span className="text-white/50 text-[10px]">{item.estimatedMinutes}m</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
