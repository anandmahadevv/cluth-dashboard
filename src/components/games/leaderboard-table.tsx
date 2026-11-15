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
import { getFreeFireGroupInfo } from "@/lib/tournament-constants";

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
  gameName,
  className,
  isProjector = false,
}: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"total" | "placement" | "kills">("total");
  const [sortAsc, setSortAsc] = useState(false);

  const isValorant = gameName?.toLowerCase().includes("valorant");
  const isFreeFire =
    Boolean(gameName?.toLowerCase().includes("free fire")) ||
    entries.some(
      (e) =>
        e.gameId === "FREE_FIRE" ||
        e.id?.toLowerCase().includes("free_fire") ||
        e.teamName?.toLowerCase().includes("khopdi phodu") ||
        e.teamName?.toLowerCase().includes("brotherhood")
    );
  const [groupFilter, setGroupFilter] = useState<"ALL" | "A" | "B" | "QUALIFIED">("ALL");
  const qualifiedCount = entries.filter((e) => !e.hidden && e.qualified).length;

  const hasLiveScores = entries.some(
    (e) => !e.hidden && ((e.matchesPlayed && e.matchesPlayed > 0) || (e.totalPoints && e.totalPoints > 0))
  );

  const filteredEntries = entries
    .filter((entry) => {
      if (entry.hidden) return false;
      const matchesSearch = entry.teamName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (isFreeFire && groupFilter !== "ALL") {
        if (groupFilter === "QUALIFIED") {
          if (!entry.qualified) return false;
        } else {
          const grp = getFreeFireGroupInfo(entry.teamName);
          if (grp.group !== groupFilter) return false;
        }
      }
      return true;
    })
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
      {/* Search & Group Filters - Hidden or simplified in projector mode */}
      {!isProjector && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24] transition shadow-xs"
              />
            </div>

            {/* Free Fire Group A & B Fast Switcher */}
            {isFreeFire && (
              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setGroupFilter("ALL")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition font-semibold text-xs",
                    groupFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  All (17)
                </button>
                <button
                  type="button"
                  onClick={() => setGroupFilter("A")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5",
                    groupFilter === "A"
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-blue-700 hover:bg-slate-200/60"
                  )}
                >
                  <span>Group A</span>
                  <span
                    className={cn(
                      "text-[10px] px-1 py-0.5 rounded font-mono font-bold leading-none",
                      groupFilter === "A" ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-700"
                    )}
                  >
                    LH18
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setGroupFilter("B")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5",
                    groupFilter === "B"
                      ? "bg-purple-600 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-purple-700 hover:bg-slate-200/60"
                  )}
                >
                  <span>Group B</span>
                  <span
                    className={cn(
                      "text-[10px] px-1 py-0.5 rounded font-mono font-bold leading-none",
                      groupFilter === "B" ? "bg-purple-800 text-purple-100" : "bg-purple-100 text-purple-700"
                    )}
                  >
                    LH19
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setGroupFilter("QUALIFIED")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5",
                    groupFilter === "QUALIFIED"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
                  )}
                >
                  <span>⭐ Qualifiers (Q)</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold leading-none",
                      groupFilter === "QUALIFIED"
                        ? "bg-emerald-800 text-emerald-100"
                        : "bg-emerald-100 text-emerald-800"
                    )}
                  >
                    {qualifiedCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          <span className="text-xs font-semibold text-slate-400 self-end sm:self-center">
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
              {!isValorant && (
                <>
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
                </>
              )}
              <th
                onClick={() => toggleSort("total")}
                className="py-3 pl-4 pr-6 text-right cursor-pointer hover:text-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{isValorant ? "Placement Points" : "Points Earned"}</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntries.map((entry) => {
              const rank = entry.rank;
              const isFirst = hasLiveScores && rank === 1;
              const isSecond = hasLiveScores && rank === 2;
              const isThird = hasLiveScores && rank === 3;

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
                        #{rank}
                      </span>
                    )}
                  </td>

                  {/* Team Name colored per rank + Free Fire Group & Venue Badge */}
                  <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {isFreeFire && (() => {
                        const grp = getFreeFireGroupInfo(entry.teamName);
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border shadow-2xs",
                              grp.group === "A"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            )}
                            title={`Assigned Room: ${grp.venue}`}
                          >
                            <span>{grp.group === "A" ? "Group A" : "Group B"}</span>
                            <span className="opacity-40">•</span>
                            <span className="font-mono">{grp.venue}</span>
                          </span>
                        );
                      })()}
                      {entry.qualified && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs shrink-0"
                          title="Qualified for Grand Finals!"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black leading-none">
                            Q
                          </span>
                          <span>QUALIFIED</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Matches */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                    {entry.matchesPlayed}
                  </td>

                  {!isValorant && (
                    <>
                      {/* Placement Points */}
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-600">
                        {entry.placementPoints}
                      </td>

                      {/* Kill Points */}
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-600">
                        {entry.killPoints}
                      </td>
                    </>
                  )}

                  {/* Total Points */}
                  <td className="py-3.5 pl-4 pr-6 text-right font-mono text-sm font-black text-slate-900">
                    {hasLiveScores ? (
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
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        0 pts • Ready
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={isValorant ? 4 : 6} className="py-8 text-center text-sm text-slate-400">
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
