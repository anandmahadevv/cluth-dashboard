"use client";

import { useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import {
  FreeFireLeaderboardEntry,
  BgmiLeaderboardEntry,
  ValorantLeaderboardEntry,
  EfootballLeaderboardEntry,
  LeaderboardEntry,
} from "@/types";
import { cn } from "@/lib/utils";

type LeaderboardRow =
  | FreeFireLeaderboardEntry
  | BgmiLeaderboardEntry
  | ValorantLeaderboardEntry
  | EfootballLeaderboardEntry
  | LeaderboardEntry
  | any;

interface LeaderboardTableProps {
  entries: LeaderboardRow[];
  gameName?: string;
  gameColor?: string;
  className?: string;
  isProjector?: boolean;
}

export function LeaderboardTable({
  entries,
  className,
  isProjector = false,
}: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"total" | "placement" | "kills">("total");
  const [sortAsc, setSortAsc] = useState(false);

  const filteredEntries = entries
    .filter((entry) =>
      entry.teamName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a.totalPoints;
      let valB = b.totalPoints;
      if (sortField === "placement") {
        valA = a.placementPoints;
        valB = b.placementPoints;
      } else if (sortField === "kills") {
        valA = a.killPoints;
        valB = b.killPoints;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  const toggleSort = (field: "total" | "placement" | "kills") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-3", isProjector && "max-w-5xl", className)}>
      {/* Search Input - Hidden or simplified in projector mode */}
      {!isProjector && (
        <div className="flex items-center justify-between pb-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24] transition shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredEntries.length} Teams
          </span>
        </div>
      )}

      {/* Styled Table matching the exact reference layout */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
              <th className="py-3 pl-6 pr-3 w-16">Rank</th>
              <th className="py-3 px-4 font-bold">Team</th>
              <th className="py-3 px-4 text-center">Matches</th>
              <th
                onClick={() => toggleSort("placement")}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Placement</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("kills")}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Kills</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("total")}
                className="py-3 pl-4 pr-6 text-right cursor-pointer hover:text-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Points Earned</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntries.map((entry) => {
              const rank = entry.rank;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <tr
                  key={entry.teamName}
                  className={cn(
                    "transition-colors hover:bg-slate-50/80",
                    isFirst && "bg-[#fefce8]/40",
                    isSecond && "bg-[#f8fafc]/50",
                    isThird && "bg-[#fffbeb]/40",
                    isProjector && "text-base py-4"
                  )}
                >
                  {/* Circular Star Badges from reference image */}
                  <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
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
                        {rank}
                      </span>
                    )}
                  </td>

                  {/* Team Name colored per rank */}
                  <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                    <span
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        isFirst
                          ? "text-[#d97706]"
                          : isSecond
                          ? "text-[#64748b]"
                          : isThird
                          ? "text-[#b45309]"
                          : "text-slate-800",
                        isProjector && "text-base"
                      )}
                    >
                      {entry.teamName}
                    </span>
                  </td>

                  {/* Matches */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                    {entry.matchesPlayed}
                  </td>

                  {/* Placement Points */}
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-600">
                    {entry.placementPoints}
                  </td>

                  {/* Kill Points */}
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-600">
                    {entry.killPoints}
                  </td>

                  {/* Total Points */}
                  <td className="py-3.5 pl-4 pr-6 text-right font-mono text-sm font-black text-slate-900">
                    <span
                      className={cn(
                        isFirst && "text-[#d97706]",
                        isSecond && "text-[#64748b]",
                        isThird && "text-[#b45309]",
                        isProjector && "text-base"
                      )}
                    >
                      {entry.totalPoints}
                    </span>
                  </td>
                </tr>
              );
            })}

            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  No teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
