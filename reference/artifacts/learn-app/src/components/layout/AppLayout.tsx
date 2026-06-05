import React from "react";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative pb-20">
      <main className="flex-1 max-w-2xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
