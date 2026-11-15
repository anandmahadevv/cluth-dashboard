"use client";

import { Trophy, Crosshair, Crown, Flame, Award, Sparkles } from "lucide-react";
import { IndividualAwards } from "@/types";
import { cn } from "@/lib/utils";

interface SpecialAwardsCardProps {
  awards?: IndividualAwards;
  className?: string;
  isProjector?: boolean;
}

export function SpecialAwardsCard({
  awards,
  className,
  isProjector = false,
}: SpecialAwardsCardProps) {
  const mvp = awards?.mvp;
  const topFragger = awards?.topFragger;

  const hasMvp = Boolean(mvp?.playerName && mvp.playerName.trim());
  const hasTopFragger = Boolean(topFragger?.playerName && topFragger.playerName.trim());

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-3", isProjector && "max-w-5xl", className)}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 font-display">
            Special Tournament Accolades
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          Official Awards
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: TOURNAMENT MVP */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 transition-all p-4 sm:p-5 flex flex-col justify-between shadow-sm",
            hasMvp
              ? "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-100/50 shadow-md shadow-amber-500/10"
              : "border-slate-200 bg-slate-50/70"
          )}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center font-bold",
                    hasMvp
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                    CLUTCH TOURNAMENT
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight font-display">
                    MOST VALUABLE PLAYER (MVP)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-300">
                MVP AWARD
              </span>
            </div>

            {hasMvp ? (
              <div className="space-y-1 my-2">
                <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-display flex items-center gap-1.5">
                  <span>{mvp?.playerName}</span>
                  <span className="text-amber-500 text-base">★</span>
                </div>
                <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-white border border-amber-200 shadow-2xs">
                    {mvp?.teamName || "Qualified Squad"}
                  </span>
                  {mvp?.stats && (
                    <span className="text-slate-600 font-medium">({mvp.stats})</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-2.5">
                <div className="text-sm font-bold text-slate-700">Contender Selection In Progress</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Awarded to the player with the highest overall impact & clutch plays across Grand Finals.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Criteria: High Kills • Survival • Clutch</span>
            <span className="font-bold text-amber-700">Official Trophy</span>
          </div>
        </div>

        {/* Card 2: TOP FRAGGER / HIGHEST INDIVIDUAL KILLS */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 transition-all p-4 sm:p-5 flex flex-col justify-between shadow-sm",
            hasTopFragger
              ? "border-rose-400 bg-gradient-to-br from-rose-50 via-white to-amber-50/60 shadow-md shadow-rose-500/10"
              : "border-slate-200 bg-slate-50/70"
          )}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center font-bold",
                    hasTopFragger
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 block">
                    HIGHEST INDIVIDUAL KILL
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight font-display">
                    TOP FRAGGER CHAMPION
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-800 border border-rose-300">
                MAX ELIMINATIONS
              </span>
            </div>

            {hasTopFragger ? (
              <div className="space-y-1 my-2">
                <div className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-display flex items-center justify-between gap-2">
                  <span className="truncate">{topFragger?.playerName}</span>
                  {topFragger?.kills !== undefined && (
                    <span className="inline-flex items-center gap-1 text-sm sm:text-base font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs shrink-0 font-mono">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{topFragger.kills} KILLS</span>
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-rose-800">
                  <span className="px-2 py-0.5 rounded bg-white border border-rose-200 shadow-2xs">
                    {topFragger?.teamName || "Qualified Squad"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2.5">
                <div className="text-sm font-bold text-slate-700">Tracking Individual Eliminations</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Awarded to the single player securing the highest total confirmed kills in the tournament.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Criteria: Most Confirmed Eliminations</span>
            <span className="font-bold text-rose-700">Official Accolade</span>
          </div>
        </div>
      </div>
    </div>
  );
}
