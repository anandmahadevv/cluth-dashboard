"use client";

import Link from "next/link";
import { Target, ShieldCheck, ArrowLeft, Trophy } from "lucide-react";
import { GAMES_CONFIG } from "@/lib/constants";
import { useGameLeaderboard, useGameMatches } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { PreMatchShowcase } from "@/components/leaderboards/pre-match-showcase";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { ShareModal } from "@/components/shared/share-modal";

export default function ValorantPage() {
  const gameConfig = GAMES_CONFIG.VALORANT;
  const { data: leaderboard, lastUpdated, isRefreshing, refresh, isTabActive } =
    useGameLeaderboard("VALORANT");
  const { data: matches } = useGameMatches("VALORANT");

  const hasMatchesPlayed = Boolean(
    leaderboard &&
      leaderboard.some(
        (t) => (t.matchesPlayed && t.matchesPlayed > 0) || (t.totalPoints && t.totalPoints > 0)
      )
  );

  const first = leaderboard?.[0]
    ? {
        rank: 1 as const,
        name: leaderboard[0].teamName,
        subtext: "Valorant Champion",
        stat1Value: leaderboard[0].matchesPlayed,
        stat1Label: "matches\nplayed",
        stat2Value: leaderboard[0].totalPoints,
        stat2Label: "placement\npoints",
      }
    : undefined;

  const second = leaderboard?.[1]
    ? {
        rank: 2 as const,
        name: leaderboard[1].teamName,
        subtext: "1st Runner-Up",
        stat1Value: leaderboard[1].matchesPlayed,
        stat1Label: "matches\nplayed",
        stat2Value: leaderboard[1].totalPoints,
        stat2Label: "placement\npoints",
      }
    : undefined;

  const third = leaderboard?.[2]
    ? {
        rank: 3 as const,
        name: leaderboard[2].teamName,
        subtext: "2nd Runner-Up",
        stat1Value: leaderboard[2].matchesPlayed,
        stat1Label: "matches\nplayed",
        stat2Value: leaderboard[2].totalPoints,
        stat2Label: "placement\npoints",
      }
    : undefined;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 font-display">
                {gameConfig.badge}
              </span>
              <span className="text-xs text-zinc-400">• {gameConfig.format}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-display mt-1">
              {gameConfig.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LiveIndicator
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
            isTabActive={isTabActive}
          />
          <ShareModal label={`Share ${gameConfig.name}`} />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-[#0d1117]/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-white text-sm block">Rules & Point Structure</span>
          <span className="text-zinc-400">{gameConfig.rulesOverview}</span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-700/60 font-mono text-[11px] text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Scoring Matrix</span>
        </div>
      </div>

      {hasMatchesPlayed && first && second && third ? (
        <Podium first={first} second={second} third={third} />
      ) : (
        <PreMatchShowcase
          gameId="VALORANT"
          gameName={gameConfig.name}
          teamCount={leaderboard?.length || 0}
          format={gameConfig.format}
          contenders={leaderboard?.map((t) => t.teamName) || []}
        />
      )}

      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
              Tournament Standings
            </h2>
            <p className="text-xs text-zinc-400">
              Authorized live table for Valorant squads.
            </p>
          </div>
        </div>

        <LeaderboardTable
          entries={leaderboard || []}
          gameName="Valorant"
          gameColor="#ef4444"
        />
      </div>
    </div>
  );
}

