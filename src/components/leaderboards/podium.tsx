import { Trophy } from "lucide-react";
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
    <div className={cn("w-full py-2", className)}>
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-end max-w-4xl mx-auto", isProjector && "max-w-5xl gap-8")}>
        {/* 2nd Place (Left) */}
        {second ? (
          <div className={cn(
            "order-2 md:order-1 rounded-xl border-2 border-[#cbd5e1] bg-[#f8fafc] p-6 flex flex-col items-center text-center shadow-sm transition-all hover:shadow-md",
            isProjector && "p-8"
          )}>
            <span className={cn("text-sm font-bold text-[#64748b] mb-2 tracking-wide", isProjector && "text-base")}>
              2nd
            </span>

            {/* Silver Icon Outline */}
            <div className={cn(
              "w-12 h-12 rounded-full border-2 border-[#cbd5e1] flex items-center justify-center text-[#64748b] mb-3 text-lg font-bold bg-white",
              isProjector && "w-16 h-16 text-xl mb-4"
            )}>
              2
            </div>

            <h3 className={cn("text-xl font-bold text-slate-900 mb-1 tracking-tight truncate max-w-full", isProjector && "text-2xl")}>
              {second.name}
            </h3>
            <p className={cn("text-xs text-slate-500 mb-6 font-medium", isProjector && "text-sm mb-8")}>
              {second.subtext}
            </p>

            {/* Stat Columns */}
            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-slate-200">
              <div className="text-center">
                <div className={cn("text-2xl font-black text-slate-900", isProjector && "text-3xl")}>{second.stat1Value}</div>
                <div className={cn("text-[11px] font-medium text-slate-500 leading-tight whitespace-pre-line mt-0.5", isProjector && "text-xs")}>
                  {second.stat1Label}
                </div>
              </div>
              <div className="text-center">
                <div className={cn("text-2xl font-black text-slate-900", isProjector && "text-3xl")}>{second.stat2Value}</div>
                <div className={cn("text-[11px] font-medium text-slate-500 leading-tight whitespace-pre-line mt-0.5", isProjector && "text-xs")}>
                  {second.stat2Label}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1" />
        )}

        {/* 1st Place (Center - Taller & Gold) */}
        <div className={cn(
          "order-1 md:order-2 rounded-xl border-2 border-[#fbbf24] bg-[#fffdf0] p-7 flex flex-col items-center text-center shadow-md transition-all hover:shadow-lg md:-mb-2 z-10",
          isProjector && "p-9 md:-mb-4 border-[3px]"
        )}>
          <span className={cn("text-base font-extrabold text-[#d97706] mb-2 tracking-wide", isProjector && "text-lg")}>
            1st
          </span>

          {/* Trophy Outline with Star */}
          <div className={cn(
            "relative w-14 h-14 rounded-full border-2 border-[#fbbf24] flex items-center justify-center text-[#d97706] mb-3 bg-white shadow-sm",
            isProjector && "w-20 h-20 mb-5"
          )}>
            <Trophy className={cn("w-7 h-7 stroke-[2]", isProjector && "w-10 h-10")} />
            <span className="absolute -top-1.5 -right-1.5 text-xs text-[#d97706] font-bold">★</span>
          </div>

          <h3 className={cn("text-2xl font-black text-slate-900 mb-1 tracking-tight truncate max-w-full", isProjector && "text-3xl")}>
            {first.name}
          </h3>
          <p className={cn("text-xs text-slate-500 mb-6 font-medium", isProjector && "text-sm mb-8")}>
            {first.subtext}
          </p>

          {/* Stat Columns */}
          <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-amber-200/80">
            <div className="text-center">
              <div className={cn("text-3xl font-black text-slate-900", isProjector && "text-4xl")}>{first.stat1Value}</div>
              <div className={cn("text-[11px] font-semibold text-slate-600 leading-tight whitespace-pre-line mt-0.5", isProjector && "text-xs")}>
                {first.stat1Label}
              </div>
            </div>
            <div className="text-center">
              <div className={cn("text-3xl font-black text-[#d97706]", isProjector && "text-4xl")}>{first.stat2Value}</div>
              <div className={cn("text-[11px] font-semibold text-slate-600 leading-tight whitespace-pre-line mt-0.5", isProjector && "text-xs")}>
                {first.stat2Label}
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place (Right - Bronze) */}
        {third ? (
          <div className={cn(
            "order-3 rounded-xl border-2 border-[#f59e0b] bg-[#fffaf0] p-6 flex flex-col items-center text-center shadow-sm transition-all hover:shadow-md",
            isProjector && "p-8"
          )}>
            <span className={cn("text-sm font-bold text-[#b45309] mb-2 tracking-wide", isProjector && "text-base")}>
              3rd
            </span>

            {/* Bronze Medal Outline */}
            <div className={cn(
              "w-12 h-12 rounded-full border-2 border-[#f59e0b] flex items-center justify-center text-[#b45309] mb-3 text-lg font-bold bg-white",
              isProjector && "w-16 h-16 text-xl mb-4"
            )}>
              3
            </div>

            <h3 className={cn("text-xl font-bold text-slate-900 mb-1 tracking-tight truncate max-w-full", isProjector && "text-2xl")}>
              {third.name}
            </h3>
            <p className={cn("text-xs text-slate-500 mb-6 font-medium", isProjector && "text-sm mb-8")}>
              {third.subtext}
            </p>

            {/* Stat Columns */}
            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-amber-200/60">
              <div className="text-center">
                <div className={cn("text-2xl font-black text-slate-900", isProjector && "text-3xl")}>{third.stat1Value}</div>
                <div className={cn("text-[11px] font-medium text-slate-500 leading-tight whitespace-pre-line mt-0.5", isProjector && "text-xs")}>
                  {third.stat1Label}
                </div>
              </div>
              <div className="text-center">
                <div className={cn("text-2xl font-black text-slate-900", isProjector && "text-3xl")}>{third.stat2Value}</div>
                <div className={cn("text-[11px] font-medium text-slate-500 leading-tight whitespace-pre-line mt-0.5", isProjector && "text-xs")}>
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
