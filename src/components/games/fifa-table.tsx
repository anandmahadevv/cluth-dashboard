"use client";

import { useState } from "react";
import { Search, Trophy } from "lucide-react";
import { FifaMatchResult } from "@/types";
import { cn } from "@/lib/utils";

interface FifaTableProps {
  matches: FifaMatchResult[];
  className?: string;
  isProjector?: boolean;
}

export function FifaTable({ matches, className, isProjector = false }: FifaTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatches = matches.filter(
    (m) =>
      m.player1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.player2.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.roundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.winner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-3", isProjector && "max-w-5xl", className)}>
      {!isProjector && (
        <div className="flex items-center justify-between pb-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search FIFA match..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24] transition shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredMatches.length} Fixtures
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
              <th className="py-3 pl-6 pr-3 w-16">Match</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4 text-right">Player 1</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-left">Player 2</th>
              <th className="py-3 pl-4 pr-6 text-right">Winner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMatches.map((m) => {
              const isP1Winner = m.goals1 > m.goals2 || m.winner.includes(m.player1);
              const isP2Winner = m.goals2 > m.goals1 || m.winner.includes(m.player2);

              return (
                <tr key={m.matchId} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-3.5 pl-6 pr-3 font-mono text-xs font-semibold text-slate-400">
                    M#{m.matchNumber}
                  </td>

                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                    {m.roundName}
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium">
                    <span className={cn("text-xs font-bold", isP1Winner ? "text-emerald-600" : "text-slate-700")}>
                      {m.player1}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-mono text-xs font-black text-slate-900">
                      <span>{m.goals1}</span>
                      <span className="text-slate-400">-</span>
                      <span>{m.goals2}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-left font-medium">
                    <span className={cn("text-xs font-bold", isP2Winner ? "text-emerald-600" : "text-slate-700")}>
                      {m.player2}
                    </span>
                  </td>

                  <td className="py-3.5 pl-4 pr-6 text-right text-xs font-bold">
                    {m.isDraw ? (
                      <span className="text-amber-600">Draw</span>
                    ) : (
                      <span className="inline-flex items-center justify-end gap-1 text-emerald-600">
                        <Trophy className="w-3.5 h-3.5 shrink-0" />
                        <span>{m.winner}</span>
                      </span>
                    )}
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
