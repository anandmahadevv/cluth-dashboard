"use client";

import { UniversityBadge } from "./university-badge";
import { useState } from "react";
import { Search, ArrowUpDown, Trophy, Medal, Award, Crown, Sparkles } from "lucide-react";
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

  const isValorant = Boolean(gameName?.toLowerCase().includes("valorant"));
  const isEfootball = Boolean(gameName?.toLowerCase().includes("efootball"));
  const isMatiks = Boolean(gameName?.toLowerCase().includes("matiks"));
  const isFreeFire =
    Boolean(gameName?.toLowerCase().includes("free fire")) ||
    entries.some(
      (e) =>
        e.gameId === "FREE_FIRE" ||
        e.id?.toLowerCase().includes("free_fire") ||
        e.teamName?.toLowerCase().includes("khopdi phodu") ||
        e.teamName?.toLowerCase().includes("brotherhood")
    );

  // Dynamic game-specific column labels
  const matchColLabel = isMatiks ? "Rounds" : "Matches";
  const placementColLabel = isValorant
    ? "Placement Points"
    : isEfootball
    ? "Match Pts"
    : isMatiks
    ? "Rank Pts"
    : "Placement";

  const statColLabel = isEfootball
    ? "Goals"
    : isMatiks
    ? "Matiks Score"
    : "Kills";

  const totalColLabel = isValorant
    ? "Placement Points"
    : isMatiks
    ? "Total Score"
    : "Total Points";
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
    <div className={cn("standings-table w-full mx-auto space-y-4", isProjector && "text-base", className)}>
      {/* Search & Group Filters */}
      {!isProjector && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams…"
                aria-label="Search teams or players"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#e0e3dc] bg-[#f8f9f5] pl-10 pr-3.5 py-3 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition shadow-xs"
              />
            </div>

            {/* Free Fire Category Filters */}
            {isFreeFire && (
              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs flex-wrap">
                <button
                  type="button"
                  aria-pressed={groupFilter === "ALL"}
                  onClick={() => setGroupFilter("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition font-bold text-xs",
                    groupFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  All ({entries.filter((e) => !e.hidden).length})
                </button>
                <button
                  type="button"
                  aria-pressed={groupFilter === "A"}
                  onClick={() => setGroupFilter("A")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition font-bold text-xs flex items-center gap-1.5",
                    groupFilter === "A"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-blue-700 hover:bg-slate-200/70"
                  )}
                >
                  <span>Group A</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold leading-none",
                      groupFilter === "A" ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-700"
                    )}
                  >
                    LH18
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={groupFilter === "B"}
                  onClick={() => setGroupFilter("B")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition font-bold text-xs flex items-center gap-1.5",
                    groupFilter === "B"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-purple-700 hover:bg-slate-200/70"
                  )}
                >
                  <span>Group B</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold leading-none",
                      groupFilter === "B" ? "bg-purple-800 text-purple-100" : "bg-purple-100 text-purple-700"
                    )}
                  >
                    LH19
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={groupFilter === "QUALIFIED"}
                  onClick={() => setGroupFilter("QUALIFIED")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition font-bold text-xs flex items-center gap-1.5",
                    groupFilter === "QUALIFIED"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-slate-200/70"
                  )}
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Grand Finalists</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold leading-none",
                      groupFilter === "QUALIFIED" ? "bg-emerald-800 text-emerald-100" : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {qualifiedCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-end sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{filteredEntries.length} Teams Listed</span>
          </div>
        </div>
      )}

      {/* Styled Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e4e7e0] bg-white">
        <table className="w-full min-w-[570px] text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-[#7d867f] bg-[#f5f6f1]">
              <th className="py-3.5 pl-6 pr-3 w-18">Rank</th>
              <th className="py-3.5 px-4 font-black">
                {isEfootball ? "Player" : isMatiks ? "Participant" : "Team / Squad"}
              </th>
              <th className="py-3.5 px-4 text-center">{matchColLabel}</th>
              {!isValorant && (
                <>
                  <th
                    onClick={() => toggleSort("placement")}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-800 transition select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{placementColLabel}</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort("kills")}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-800 transition select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{statColLabel}</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                </>
              )}
              <th
                onClick={() => toggleSort("total")}
                className="py-3.5 pl-4 pr-6 text-right cursor-pointer hover:text-slate-800 transition select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{totalColLabel}</span>
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
                    "transition-all hover:bg-slate-50/90 group",
                    isFirst && "bg-amber-50/40 hover:bg-amber-50/70",
                    isSecond && "bg-slate-50/60 hover:bg-slate-100/60",
                    isThird && "bg-orange-50/30 hover:bg-orange-50/60",
                    isProjector && "text-base py-4"
                  )}
                >
                  {/* Rank Badges */}
                  <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                    {isFirst ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#ff986b] text-slate-950 font-black text-xs shadow-sm shadow-amber-500/20">
                        1
                      </span>
                    ) : isSecond ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 font-black text-xs shadow-xs border border-slate-300">
                        2
                      </span>
                    ) : isThird ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 text-amber-900 font-black text-xs shadow-xs border border-amber-300">
                        3
                      </span>
                    ) : (
                      <span className="inline-block pl-2 text-xs font-bold text-slate-400 font-mono">
                        #{rank}
                      </span>
                    )}
                  </td>

                  {/* Team Name */}
                  <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-sm font-bold tracking-tight",
                          isFirst
                            ? "text-amber-950 font-black"
                            : isSecond
                            ? "text-slate-900 font-bold"
                            : isThird
                            ? "text-amber-900 font-bold"
                            : "text-slate-800",
                          isProjector && "text-base"
                        )}
                      >
                        {entry.teamName}
                      </span>

                      <UniversityBadge university={entry.university}/>
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
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs shrink-0"
                          title="Qualified for Grand Finals!"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black leading-none">
                            Q
                          </span>
                          <span>GRAND FINALIST</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Matches Played */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-slate-500">
                    {entry.matchesPlayed}
                  </td>

                  {!isValorant && (
                    <>
                      {/* Placement Points */}
                      <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold text-slate-600">
                        {entry.placementPoints}
                      </td>

                      {/* Kill Points */}
                      <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold text-slate-600">
                        {entry.killPoints}
                      </td>
                    </>
                  )}

                  {/* Total Points */}
                  <td className="py-3.5 pl-4 pr-6 text-right font-mono text-sm font-black text-slate-900">
                    {hasLiveScores ? (
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg inline-block",
                          isFirst
                            ? "bg-amber-400/20 text-amber-950 font-black border border-amber-300"
                            : isSecond
                            ? "bg-slate-200/60 text-slate-900 font-bold"
                            : isThird
                            ? "bg-amber-100/60 text-amber-900 font-bold"
                            : "text-slate-800",
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
                <td colSpan={isValorant ? 4 : 6} className="py-12 px-4 text-center">
                  <div className="max-w-md mx-auto space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                      {entries.length ? "No teams match these filters" : "Roster awaiting publication"}
                    </p>
                    <div className="text-xs text-slate-500">
                      {searchQuery
                        ? `No contenders found matching "${searchQuery}".`
                        : entries.length ? "Try another group, or clear your filters." : "Registered teams will appear here once added by the event admin."}
                      {(searchQuery || groupFilter!=="ALL") && <button type="button" onClick={()=>{setSearchQuery("");setGroupFilter("ALL");}} className="mx-auto mt-4 block rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Clear filters</button>}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
