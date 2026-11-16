"use client";

import { useState } from "react";
import { Search, Flame, Crosshair, Gamepad2, Brain, CheckCircle2 } from "lucide-react";
import { GameId } from "@/types";
import { useGameMatches, useGameAwards } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { ShareModal } from "@/components/shared/share-modal";
import { SpecialAwardsCard } from "@/components/games/special-awards-card";

export default function MatchResultsPage() {
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allMatches, lastUpdated, isRefreshing, refresh, isTabActive } =
    useGameMatches();
  const { data: ffAwards } = useGameAwards("FREE_FIRE");

  const matchesList = (allMatches as any[]) || [];

  const filteredMatches = matchesList.filter((m) => {
    if (selectedGameFilter !== "ALL" && m.game_id !== selectedGameFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (m.team_name || m.player_name || "").toLowerCase();
      const opp = (m.opponent_name || "").toLowerCase();
      const res = (m.result_text || "").toLowerCase();
      return name.includes(q) || opp.includes(q) || res.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 max-w-5xl mx-auto space-y-6 bg-white text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
            MATCH RESULTS
          </h1>
          <p className="text-xs text-slate-500">
            Certified tournament match results ratified by Super Admin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LiveIndicator
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
            isTabActive={isTabActive}
          />
          <ShareModal label="Share" />
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 flex-wrap">
          {["ALL", "FREE_FIRE", "BGMI", "VALORANT", "EFOOTBALL", "MATIKS"].map((key) => {
            const isSelected = selectedGameFilter === key;
            const label =
              key === "ALL"
                ? "All Games"
                : key === "FREE_FIRE"
                ? "Free Fire"
                : key === "BGMI"
                ? "BGMI"
                : key === "VALORANT"
                ? "Valorant"
                : key === "EFOOTBALL"
                ? "eFootball"
                : "MATIKS";

            return (
              <button
                key={key}
                onClick={() => setSelectedGameFilter(key)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#fbbf24] shadow-xs"
          />
        </div>
      </div>

      {/* Official Grand Finals Showcase on Results Page */}
      {(selectedGameFilter === "ALL" || selectedGameFilter === "FREE_FIRE") && (
        <SpecialAwardsCard awards={ffAwards} />
      )}

      {/* Clean Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
              <th className="py-3 pl-6 pr-3">Game</th>
              <th className="py-3 px-4">Match</th>
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Outcome</th>
              <th className="py-3 px-4 text-right">Points / Score</th>
              <th className="py-3 pl-4 pr-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMatches.map((m: any) => {
              const gameId: GameId = m.game_id;
              const isFF = gameId === "FREE_FIRE";
              const isBGMI = gameId === "BGMI";
              const isVAL = gameId === "VALORANT";
              const isEF = gameId === "EFOOTBALL";

              return (
                <tr key={m.result_id} className="transition-colors hover:bg-slate-50/80">
                  <td className="py-3.5 pl-6 pr-3 font-semibold text-xs whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFF
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : isBGMI
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : isVAL
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : isEF
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {isFF
                        ? "Free Fire"
                        : isBGMI
                        ? "BGMI"
                        : isVAL
                        ? "Valorant"
                        : isEF
                        ? "eFootball"
                        : "MATIKS"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600">
                    {m.match_id || `M#${m.match_number}`}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 text-xs">
                      {m.team_name || m.player_name}
                    </span>
                    {m.opponent_name && (
                      <span className="text-slate-400 text-xs ml-1">vs {m.opponent_name}</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {m.result_text || "Match Completed"}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-slate-900">
                    {m.score_data?.total_points !== undefined && (
                      <span>{m.score_data.total_points} Pts ({m.score_data.kill_points} kills)</span>
                    )}
                    {m.score_data?.goals_for !== undefined && (
                      <span>{m.score_data.goals_for} - {m.score_data.goals_against}</span>
                    )}
                    {m.score_data?.score !== undefined && (
                      <span>{m.score_data.score}</span>
                    )}
                  </td>

                  <td className="py-3.5 pl-4 pr-6 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Published
                    </span>
                  </td>
                </tr>
              );
            })}

            {filteredMatches.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  No match results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
