"use client";

import { Trophy, Medal } from "lucide-react";
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
  const cards = [first, second, third].filter((card): card is PodiumCardData => Boolean(card));
  return <div className={cn("grid w-full gap-3 sm:gap-4", cards.length === 3 ? "md:grid-cols-3" : cards.length === 2 ? "sm:grid-cols-2" : "grid-cols-1", className)}>
    {cards.map(card => {
      const winner = card.rank === 1;
      return <article key={card.rank} className={cn("relative min-w-0 overflow-hidden rounded-[20px] border p-5 sm:p-6", winner ? "border-[#17211e] bg-[#17211e] text-white" : "border-[#dfe3dc] bg-white text-[#17211e]", isProjector && "p-8")}>
        <span aria-hidden="true" className={cn("pointer-events-none absolute -bottom-6 right-2 text-[130px] font-black leading-none tracking-[-0.1em]", winner ? "text-white/[0.04]" : "text-[#17211e]/[0.035]")}>0{card.rank}</span>
        <div className="relative flex items-center justify-between gap-3">
          <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", winner ? "text-[#ffad83]" : "text-[#7d867f]")}>{winner ? "First place" : card.rank === 2 ? "Second place" : "Third place"}</span>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", winner ? "bg-[#ff986b] text-[#17211e]" : "bg-[#f2f3ee] text-[#7d867f]")}>{winner ? <Trophy className="h-4 w-4" /> : <Medal className="h-4 w-4" />}</div>
        </div>
        <div className="relative mb-5 mt-5 min-w-0"><h3 className={cn("break-words text-xl font-extrabold tracking-tight", isProjector && "text-3xl")}>{card.name}</h3><p className={cn("mt-1.5 text-[11px] leading-relaxed", winner ? "text-[#b8c4bb]" : "text-[#7d867f]")}>{card.subtext}</p></div>
        <div className={cn("relative grid grid-cols-2 gap-4 border-t pt-4", winner ? "border-white/15" : "border-[#e9ece5]")}>
          {[{ value: card.stat1Value, label: card.stat1Label }, { value: card.stat2Value, label: card.stat2Label }].map((stat, index) => <div key={index}>
            <div className={cn("text-2xl font-bold leading-none tracking-tight tabular-nums", winner && index === 1 && "text-[#ffad83]", isProjector && "text-4xl")}>{stat.value}</div>
            <div className={cn("mt-2 text-[9px] font-semibold uppercase tracking-[0.12em]", winner ? "text-[#aebbb2]" : "text-[#7d867f]")}>{stat.label.replace(/\n/g, " ")}</div>
          </div>)}
        </div>
      </article>;
    })}
  </div>;
}
