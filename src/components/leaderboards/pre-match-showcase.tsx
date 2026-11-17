"use client";

import { Trophy, Target, Zap, Swords, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreMatchShowcaseProps {
  gameName?: string;
  teamCount?: number;
  format?: string;
  isProjector?: boolean;
  className?: string;
  campusName?: string;
  university?: string;
}

export function PreMatchShowcase({
  gameName = "Championship",
  teamCount = 0,
  format = "Official Tournament Stage",
  isProjector = false,
  className,
  campusName = "NIAT Arena",
  university = "NIAT Campus",
}: PreMatchShowcaseProps) {
  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto py-2 transition-all animate-in fade-in duration-300",
        isProjector && "max-w-5xl py-4",
        className
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 p-6 sm:p-8 text-center shadow-xl shadow-amber-500/5">
        {/* Decorative Ambient Glows */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing Live Badge - Arena Ready & Crown Must Be Earned */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-400 text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span>👑 ARENA READY • THE CROWN HAS TO BE EARNED</span>
        </div>

        {/* Headline */}
        <h2
          className={cn(
            "text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display",
            isProjector && "text-3xl md:text-4xl"
          )}
        >
          {gameName} Arena In Session
        </h2>

        {/* Broadcast Explanation */}
        <p
          className={cn(
            "text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed font-medium",
            isProjector && "text-sm sm:text-base max-w-xl"
          )}
        >
          Opening battles are underway on the esports stage. Live standings, verified scores, and the official 3-tier podium will activate immediately upon referee verification of Match 1.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>The Crown Has To Be Earned</span>
          </div>

          {teamCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 font-semibold flex items-center gap-1.5 shadow-xs">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>{teamCount} Registered Contenders</span>
            </div>
          )}

          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 font-semibold flex items-center gap-1.5 shadow-xs">
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>{format}</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 font-semibold flex items-center gap-1.5 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Real-Time Referee Portal</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 font-semibold flex items-center gap-1.5 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{university || campusName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
