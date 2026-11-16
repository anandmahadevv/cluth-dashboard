"use client";

import { Trophy, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PodiumCardData {
  rank: 1 | 2 | 3;
  name: string;
  subtext: string;
  stat1Value: number | string;
  stat1Label: string;
  stat2Value: number | string;
  stat2Label: string;
}

interface PodiumProps {
  first?: PodiumCardData;
  second?: PodiumCardData;
  third?: PodiumCardData;
  className?: string;
  isProjector?: boolean;
}

export function Podium({ first, second, third, className, isProjector = false }: PodiumProps) {
  if (!first) return null;

  return (
    <div className={cn("w-full py-4", className)}>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-end max-w-4xl mx-auto",
          isProjector && "max-w-5xl gap-8"
        )}
      >
        {/* 2nd Place (Left - Silver) */}
        {second ? (
          <div
            className={cn(
              "order-2 md:order-1 rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 p-6 flex flex-col items-center text-center shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
              isProjector && "p-8"
            )}
          >
            {/* Subtle metallic sheen */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-80" />

            <div className="flex items-center gap-1.5 mb-2.5">
              <span
                className={cn(
                  "text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-200/70 border border-slate-300 px-2.5 py-0.5 rounded-full",
                  isProjector && "text-sm"
                )}
              >
                2nd Place
              </span>
            </div>

            {/* Silver Medal Badge */}
            <div
              className={cn(
                "relative w-13 h-13 rounded-2xl border-2 border-slate-300 flex items-center justify-center text-slate-700 mb-3.5 bg-gradient-to-br from-white via-slate-100 to-slate-200 shadow-inner",
                isProjector && "w-16 h-16 mb-5"
              )}
            >
              <Medal className={cn("w-6 h-6 text-slate-500", isProjector && "w-8 h-8")} />
            </div>

            <h3
              className={cn(
                "text-lg sm:text-xl font-black text-slate-900 mb-1 tracking-tight truncate max-w-full font-display",
                isProjector && "text-2xl"
              )}
            >
              {second.name}
            </h3>
            <p
              className={cn(
                "text-xs text-slate-500 mb-5 font-semibold",
                isProjector && "text-sm mb-7"
              )}
            >
              {second.subtext}
            </p>

            {/* Stat Columns */}
            <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-slate-200/90">
              <div className="text-center bg-white/70 py-2 rounded-xl border border-slate-200/60 shadow-2xs">
                <div
                  className={cn(
                    "text-2xl font-black text-slate-900 tracking-tight",
                    isProjector && "text-3xl"
                  )}
                >
                  {second.stat1Value}
                </div>
                <div
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-pre-line mt-0.5",
                    isProjector && "text-xs"
                  )}
                >
                  {second.stat1Label}
                </div>
              </div>
              <div className="text-center bg-white/70 py-2 rounded-xl border border-slate-200/60 shadow-2xs">
                <div
                  className={cn(
                    "text-2xl font-black text-slate-800 tracking-tight",
                    isProjector && "text-3xl"
                  )}
                >
                  {second.stat2Value}
                </div>
                <div
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-pre-line mt-0.5",
                    isProjector && "text-xs"
                  )}
                >
                  {second.stat2Label}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1" />
        )}

        {/* 1st Place (Center - Gold Trophy) */}
        <div
          className={cn(
            "order-1 md:order-2 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/90 via-amber-50/30 to-white p-7 flex flex-col items-center text-center shadow-lg shadow-amber-500/10 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1.5 md:-mb-3 z-10 relative overflow-hidden",
            isProjector && "p-9 md:-mb-5 border-[3px]"
          )}
        >
          {/* Top Gold Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-1.5 mb-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-amber-900 bg-gradient-to-r from-amber-300 to-yellow-400 border border-amber-400 px-3 py-0.5 rounded-full shadow-xs",
                isProjector && "text-sm"
              )}
            >
              <Crown className="w-3.5 h-3.5 fill-amber-900" />
              <span>Champion • 1st</span>
            </span>
          </div>

          {/* Trophy Badge */}
          <div
            className={cn(
              "relative w-15 h-15 rounded-2xl border-2 border-amber-400 flex items-center justify-center text-amber-700 mb-3.5 bg-gradient-to-br from-amber-200 via-amber-100 to-yellow-200 shadow-md shadow-amber-500/20",
              isProjector && "w-20 h-20 mb-5"
            )}
          >
            <Trophy className={cn("w-7 h-7 text-amber-700 stroke-[2]", isProjector && "w-10 h-10")} />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-sm">
              ★
            </span>
          </div>

          <h3
            className={cn(
              "text-xl sm:text-2xl font-black text-slate-900 mb-1 tracking-tight truncate max-w-full font-display",
              isProjector && "text-3xl"
            )}
          >
            {first.name}
          </h3>
          <p
            className={cn(
              "text-xs text-amber-800/90 mb-5 font-bold",
              isProjector && "text-sm mb-7"
            )}
          >
            {first.subtext}
          </p>

          {/* Stat Columns */}
          <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-amber-200">
            <div className="text-center bg-white/80 py-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
              <div
                className={cn(
                  "text-3xl font-black text-slate-900 tracking-tight",
                  isProjector && "text-4xl"
                )}
              >
                {first.stat1Value}
              </div>
              <div
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-amber-800/80 whitespace-pre-line mt-0.5",
                  isProjector && "text-xs"
                )}
              >
                {first.stat1Label}
              </div>
            </div>
            <div className="text-center bg-white/80 py-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
              <div
                className={cn(
                  "text-3xl font-black text-amber-600 tracking-tight",
                  isProjector && "text-4xl"
                )}
              >
                {first.stat2Value}
              </div>
              <div
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-amber-800/80 whitespace-pre-line mt-0.5",
                  isProjector && "text-xs"
                )}
              >
                {first.stat2Label}
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place (Right - Bronze) */}
        {third ? (
          <div
            className={cn(
              "order-3 rounded-2xl border-2 border-amber-600/40 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 p-6 flex flex-col items-center text-center shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
              isProjector && "p-8"
            )}
          >
            {/* Top sheen */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-60" />

            <div className="flex items-center gap-1.5 mb-2.5">
              <span
                className={cn(
                  "text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-full",
                  isProjector && "text-sm"
                )}
              >
                3rd Place
              </span>
            </div>

            {/* Bronze Medal Badge */}
            <div
              className={cn(
                "w-13 h-13 rounded-2xl border-2 border-amber-600/40 flex items-center justify-center text-amber-800 mb-3.5 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 shadow-inner",
                isProjector && "w-16 h-16 mb-5"
              )}
            >
              <Medal className={cn("w-6 h-6 text-amber-700", isProjector && "w-8 h-8")} />
            </div>

            <h3
              className={cn(
                "text-lg sm:text-xl font-black text-slate-900 mb-1 tracking-tight truncate max-w-full font-display",
                isProjector && "text-2xl"
              )}
            >
              {third.name}
            </h3>
            <p
              className={cn(
                "text-xs text-slate-500 mb-5 font-semibold",
                isProjector && "text-sm mb-7"
              )}
            >
              {third.subtext}
            </p>

            {/* Stat Columns */}
            <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-amber-200/60">
              <div className="text-center bg-white/70 py-2 rounded-xl border border-amber-200/60 shadow-2xs">
                <div
                  className={cn(
                    "text-2xl font-black text-slate-900 tracking-tight",
                    isProjector && "text-3xl"
                  )}
                >
                  {third.stat1Value}
                </div>
                <div
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-pre-line mt-0.5",
                    isProjector && "text-xs"
                  )}
                >
                  {third.stat1Label}
                </div>
              </div>
              <div className="text-center bg-white/70 py-2 rounded-xl border border-amber-200/60 shadow-2xs">
                <div
                  className={cn(
                    "text-2xl font-black text-amber-700 tracking-tight",
                    isProjector && "text-3xl"
                  )}
                >
                  {third.stat2Value}
                </div>
                <div
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-pre-line mt-0.5",
                    isProjector && "text-xs"
                  )}
                >
                  {third.stat2Label}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-3" />
        )}
      </div>
    </div>
  );
}
