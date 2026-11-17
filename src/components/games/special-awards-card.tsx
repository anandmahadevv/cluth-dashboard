"use client";

import { Trophy, Crosshair, Crown, Medal, ShieldCheck } from "lucide-react";
import type { IndividualAwards } from "@/types";
import { cn } from "@/lib/utils";

interface SpecialAwardsCardProps {
  awards?: IndividualAwards;
  className?: string;
  isProjector?: boolean;
}
export function SpecialAwardsCard({ awards, className, isProjector = false }: SpecialAwardsCardProps) {
  const honours = [
    { label: "Champion", name: awards?.winnerTeam, team: "Winner cup", stat: awards?.winnerScore ? `${awards.winnerScore} pts` : "", icon: Trophy },
    { label: "Runner-up", name: awards?.runnerUpTeam, team: "Runner-up cup", stat: awards?.runnerUpScore ? `${awards.runnerUpScore} pts` : "", icon: Medal },
    { label: "Tournament MVP", name: awards?.mvp?.playerName, team: awards?.mvp?.teamName, stat: awards?.mvp?.stats, icon: Crown },
    { label: "Top fragger", name: awards?.topFragger?.playerName, team: awards?.topFragger?.teamName, stat: awards?.topFragger?.kills !== undefined && awards.topFragger.kills !== "" ? `${awards.topFragger.kills} kills` : "", icon: Crosshair },
  ];
  const hasHonours = honours.some(honour => honour.name?.trim());
  return <section className={cn("w-full", className)} aria-label="Official championship awards">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-base font-bold tracking-tight text-[#17211e]">Championship honours</h3>
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#7d867f]"><ShieldCheck className="h-3.5 w-3.5" />Official awards</span>
    </div>
    {hasHonours ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {honours.map(({ label, name, team, stat, icon: Icon }) => <article key={label} className={cn("min-w-0 rounded-2xl border border-[#e0e3dc] bg-white p-5", isProjector && "p-7")}>
        <div className="mb-4 flex items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff0e6] text-[#b45a32]"><Icon className="h-4 w-4" /></div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#7d867f]">{label}</p></div>
        <h4 className="break-words text-sm font-extrabold leading-snug text-[#17211e]">{name?.trim() || "To be announced"}</h4>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#7d867f]">{name?.trim() ? team : "Awaiting official results"}</p>
        {stat && <p className="mt-4 border-t border-[#eef0eb] pt-3 text-sm font-bold tabular-nums text-[#a94c26]">{stat}</p>}
      </article>)}
    </div> : <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[#d6dbd1] bg-white/60 p-5"><Trophy className="h-5 w-5 shrink-0 text-[#a87559]" /><div><p className="text-xs font-semibold text-[#3f4b43]">The next champions are being decided.</p><p className="mt-1 text-[11px] leading-relaxed text-[#7d867f]">Official winners and individual awards will appear here once published.</p></div></div>}
  </section>;
}
