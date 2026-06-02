import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, Library as LibIcon, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/today", icon: Compass, label: "Today" },
    { href: "/home", icon: Home, label: "Home" },
    { href: "/library", icon: LibIcon, label: "Library" },
    { href: "/roadmaps", icon: Map, label: "Roadmaps" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-4 max-w-md mx-auto">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-1 rounded-full transition-all duration-300",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="font-medium tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
