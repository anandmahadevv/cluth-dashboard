"use client";

import { useState, useMemo, Fragment } from "react";
import { Search, ArrowUpDown, Trophy, Crown, Flame, ShieldCheck, CheckCircle2 } from "lucide-react";
import {
  FreeFireLeaderboardEntry,
  BgmiLeaderboardEntry,
  ValorantLeaderboardEntry,
  EfootballLeaderboardEntry,
  LeaderboardEntry,
} from "@/types";
import { cn } from "@/lib/utils";
import { FREE_FIRE_GROUPS, getFreeFireGroup } from "@/lib/tournament-constants";

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
  const [stageTab, setStageTab] = useState<"ALL" | "GROUP_A" | "GROUP_B" | "FINALS">("ALL");

  const isValorant = gameName?.toLowerCase().includes("valorant");
  const isFreeFire = gameName?.toLowerCase().includes("free fire") || entries.some((e) => e.game_id === "FREE_FIRE");

  const hasLiveScores = entries.some(
    (e) => (e.matchesPlayed && e.matchesPlayed > 0) || (e.totalPoints && e.totalPoints > 0)
  );

  // Compute Group Stage data for Free Fire
  const groupAEntries = useMemo(() => {
    if (!isFreeFire) return [];
    return entries
      .filter((e) => (e.group === "A" || getFreeFireGroup(e.teamName) === "A"))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        const bBooyah = b.booyahs || 0;
        const aBooyah = a.booyahs || 0;
        if (bBooyah !== aBooyah) return bBooyah - aBooyah;
        if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
        if (b.killPoints !== a.killPoints) return b.killPoints - a.killPoints;
        return (a.lastMatchRank || 999) - (b.lastMatchRank || 999);
      })
      .map((item, idx) => ({ ...item, displayRank: idx + 1, stageGroup: "A" as const }));
  }, [entries, isFreeFire]);

  const groupBEntries = useMemo(() => {
    if (!isFreeFire) return [];
    return entries
      .filter((e) => (e.group === "B" || getFreeFireGroup(e.teamName) === "B"))
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        const bBooyah = b.booyahs || 0;
        const aBooyah = a.booyahs || 0;
        if (bBooyah !== aBooyah) return bBooyah - aBooyah;
        if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
        if (b.killPoints !== a.killPoints) return b.killPoints - a.killPoints;
        return (a.lastMatchRank || 999) - (b.lastMatchRank || 999);
      })
      .map((item, idx) => ({ ...item, displayRank: idx + 1, stageGroup: "B" as const }));
  }, [entries, isFreeFire]);

  // Grand Finalists: Top 6 of Group A + Top 6 of Group B (12 squads total)
  const grandFinalists = useMemo(() => {
    if (!isFreeFire) return [];
    const topA = groupAEntries.slice(0, 6);
    const topB = groupBEntries.slice(0, 6);
    const combined = [...topA, ...topB];

    // Re-rank combined finalists
    return combined
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        const bBooyah = b.booyahs || 0;
        const aBooyah = a.booyahs || 0;
        if (bBooyah !== aBooyah) return bBooyah - aBooyah;
        if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
        if (b.killPoints !== a.killPoints) return b.killPoints - a.killPoints;
        return (a.lastMatchRank || 999) - (b.lastMatchRank || 999);
      })
      .map((item, idx) => ({ ...item, displayRank: idx + 1 }));
  }, [groupAEntries, groupBEntries, isFreeFire]);

  // Active dataset based on stage tab
  const activeEntries = useMemo(() => {
    if (!isFreeFire) return entries.map((e, idx) => ({ ...e, displayRank: e.rank || idx + 1 }));

    if (stageTab === "GROUP_A") return groupAEntries;
    if (stageTab === "GROUP_B") return groupBEntries;
    if (stageTab === "FINALS") return grandFinalists;

    // Default "ALL"
    return entries.map((e, idx) => ({
      ...e,
      displayRank: e.rank || idx + 1,
      stageGroup: e.group || getFreeFireGroup(e.teamName) || undefined,
    }));
  }, [entries, isFreeFire, stageTab, groupAEntries, groupBEntries, grandFinalists]);

  const filteredEntries = useMemo(() => {
    return activeEntries
      .filter((entry) =>
        entry.teamName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (searchQuery.trim() === "" && (stageTab === "GROUP_A" || stageTab === "GROUP_B" || stageTab === "FINALS")) {
          // Keep display rank order when looking at stages unless user clicked sort headers
        }
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
  }, [activeEntries, searchQuery, sortField, sortAsc, stageTab]);

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
      {/* Free Fire Tournament Roadmap Stage Tabs */}
      {isFreeFire && !isProjector && (
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <button
            type="button"
            onClick={() => setStageTab("ALL")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 select-none",
              stageTab === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <span>All 17 Squads</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                stageTab === "ALL" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300"
              )}
            >
              17
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStageTab("GROUP_A")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 select-none",
              stageTab === "GROUP_A"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Group A Qualifiers</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                stageTab === "GROUP_A" ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-300"
              )}
            >
              9
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStageTab("GROUP_B")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 select-none",
              stageTab === "GROUP_B"
                ? "bg-blue-600 text-white shadow-md font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Group B Qualifiers</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                stageTab === "GROUP_B" ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-300"
              )}
            >
              8
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStageTab("FINALS")}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 select-none ml-auto",
              stageTab === "FINALS"
                ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                : "text-emerald-400 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20"
            )}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Grand Finals (Top 12)</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                stageTab === "FINALS" ? "bg-emerald-700 text-white" : "bg-emerald-950 text-emerald-300"
              )}
            >
              12
            </span>
          </button>
        </div>
      )}

      {/* Stage Explainer Banner for Free Fire */}
      {isFreeFire && !isProjector && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          {stageTab === "ALL" && (
            <div className="text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-800">Round 1 Qualifiers:</span>
              <span>17 squads competing across Group A (9) & Group B (8) • Top 6 from each group advance to Grand Finals</span>
            </div>
          )}
          {stageTab === "GROUP_A" && (
            <div className="text-amber-800 flex items-center gap-2">
              <span className="font-bold text-amber-900">Group A Qualifiers:</span>
              <span>9 Squads • B2B 2 Matches • Top 6 qualify for Grand Finals</span>
            </div>
          )}
          {stageTab === "GROUP_B" && (
            <div className="text-blue-800 flex items-center gap-2">
              <span className="font-bold text-blue-900">Group B Qualifiers:</span>
              <span>8 Squads • B2B 2 Matches • Top 6 qualify for Grand Finals</span>
            </div>
          )}
          {stageTab === "FINALS" && (
            <div className="text-emerald-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-900">Round 2 Grand Finals:</span>
              <span>Top 6 (Group A) + Top 6 (Group B) = 12 Grand Finalists • 🏆 Winner Cup & 🥈 Runner-Up Cup</span>
            </div>
          )}
          <span className="text-[11px] font-mono font-bold text-slate-400">
            {filteredEntries.length} Squads
          </span>
        </div>
      )}

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
            Showing {filteredEntries.length} Teams
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
              {isFreeFire && (
                <th className="py-3 px-3 text-center">Booyahs</th>
              )}
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
            {filteredEntries.map((entry, index) => {
              const rank = entry.displayRank || entry.rank || index + 1;
              const isFirst = hasLiveScores && rank === 1;
              const isSecond = hasLiveScores && rank === 2;
              const isThird = hasLiveScores && rank === 3;

              const isQualifyingStage = stageTab === "GROUP_A" || stageTab === "GROUP_B";
              const isQualified = isQualifyingStage && rank <= 6;
              const isEliminated = isQualifyingStage && rank > 6;
              const isCutoffLine = isQualifyingStage && index === 6;

              const isFinalsStage = stageTab === "FINALS";

              return (
                <Fragment key={entry.id || entry.teamName}>
                  {/* Qualification Divider Line between Rank 6 and Rank 7 */}
                  {isCutoffLine && (
                    <tr className="bg-emerald-500/10 border-y-2 border-emerald-500/40">
                      <td
                        colSpan={isFreeFire ? 7 : (isValorant ? 4 : 6)}
                        className="py-2.5 px-6 text-center"
                      >
                        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>▲ TOP 6 QUALIFY FOR GRAND FINALS ▲</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  <tr
                    className={cn(
                      "transition-colors hover:bg-slate-50/80",
                      isFirst && "bg-[#fefce8]/40",
                      isSecond && "bg-[#f8fafc]/50",
                      isThird && "bg-[#fffbeb]/40",
                      isEliminated && "opacity-65 bg-slate-50/40",
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

                    {/* Team Name colored per rank + Qualification Tag */}
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-2">
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

                        {/* Stage / Group Indicator Badges */}
                        {isFreeFire && stageTab === "ALL" && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase font-mono",
                              (entry.group === "A" || getFreeFireGroup(entry.teamName) === "A")
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-blue-100 text-blue-800 border border-blue-300"
                            )}
                          >
                            Grp {entry.group || getFreeFireGroup(entry.teamName) || "A"}
                          </span>
                        )}

                        {/* Group Stage Qualification Tag */}
                        {isQualifyingStage && isQualified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Finals Bound</span>
                          </span>
                        )}

                        {isQualifyingStage && isEliminated && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                            Below Cutoff
                          </span>
                        )}

                        {/* Grand Finals Trophy Badges */}
                        {isFinalsStage && rank === 1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-amber-400 text-slate-950 border border-amber-500 shadow-xs inline-flex items-center gap-1">
                            🏆 WINNER CUP
                          </span>
                        )}

                        {isFinalsStage && rank === 2 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-slate-200 text-slate-800 border border-slate-300 shadow-xs inline-flex items-center gap-1">
                            🥈 RUNNER-UP CUP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Matches */}
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                      {entry.matchesPlayed || 0}
                    </td>

                    {/* Booyahs (Free Fire MAX) */}
                    {isFreeFire && (
                      <td className="py-3.5 px-3 text-center font-mono text-xs font-bold text-amber-600">
                        {entry.booyahs && entry.booyahs > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>{entry.booyahs}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {!isValorant && (
                      <>
                        {/* Placement Points */}
                        <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-600">
                          {entry.placementPoints || 0}
                        </td>

                        {/* Kill Points */}
                        <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-600">
                          {entry.killPoints || 0}
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
                          {entry.totalPoints || 0}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          0 pts • Ready
                        </span>
                      )}
                    </td>
                  </tr>
                </Fragment>
              );
            })}

            {filteredEntries.length === 0 && (
              <tr>
                <td
                  colSpan={isFreeFire ? 7 : (isValorant ? 4 : 6)}
                  className="py-8 text-center text-sm text-slate-400"
                >
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
