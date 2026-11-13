"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { MatiksMatchResult } from "@/types";
import { cn } from "@/lib/utils";

interface MatiksTableProps {
  results: MatiksMatchResult[];
  className?: string;
  isProjector?: boolean;
}

export function MatiksTable({ results, className, isProjector = false }: MatiksTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = results
    .filter(
      (r) =>
        r.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.teamName && r.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.round.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.position - b.position);

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-3", isProjector && "max-w-5xl", className)}>
      {!isProjector && (
        <div className="flex items-center justify-between pb-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search MATIKS player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24] transition shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredResults.length} Participants
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
              <th className="py-3 pl-6 pr-3 w-16">Rank</th>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4">Round</th>
              <th className="py-3 px-4 text-right">Score</th>
              <th className="py-3 pl-4 pr-6 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResults.map((r) => {
              const isFirst = r.position === 1;
              const isSecond = r.position === 2;
              const isThird = r.position === 3;

              return (
                <tr
                  key={r.matchId}
                  className={cn(
                    "transition-colors hover:bg-slate-50/80",
                    isFirst && "bg-[#fefce8]/40",
                    isSecond && "bg-[#f8fafc]/50",
                    isThird && "bg-[#fffbeb]/40"
                  )}
                >
                  <td className="py-3.5 pl-6 pr-3">
                    {isFirst ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fbbf24] text-white text-xs font-black shadow-xs">
                        ★
                      </span>
                    ) : isSecond ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#94a3b8] text-white text-xs font-black shadow-xs">
                        ★
                      </span>
                    ) : isThird ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#d97706] text-white text-xs font-black shadow-xs">
                        ★
                      </span>
                    ) : (
                      <span className="inline-block pl-2 text-xs font-semibold text-slate-400 font-mono">
                        {r.position}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                    <div>{r.playerName}</div>
                    {r.teamName && <div className="text-[10px] text-slate-400 font-normal">{r.teamName}</div>}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {r.round}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-sm font-black text-purple-700">
                    {r.score}
                  </td>

                  <td className="py-3.5 pl-4 pr-6 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {r.matchResult}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
