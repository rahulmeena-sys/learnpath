import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";

/**
 * Example sandbox variant. Copy this file, rename it, and paste a
 * ChatGPT-generated design into the default export.
 *
 * Optional `meta` export controls how it shows in the gallery.
 */
export const meta = {
  title: "Example — Home header",
  note: "Template / reference variant",
};

export default function ExampleHome() {
  return (
    <div className="px-5 pt-6 pb-6 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-muted-foreground">Good morning</p>
        <h1 className="text-2xl font-bold tracking-tight">Sandbox Demo</h1>
      </motion.div>

      <div className="flex gap-3">
        <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">7</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </div>
        </div>
        <div className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">1,240</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground pt-2">
        This is a reference variant. Real variants can import API hooks from
        <code className="text-primary"> @workspace/api-client-react</code> to render
        with live seeded data.
      </p>
    </div>
  );
}
