"use client";

import Link from "next/link";
import { Crosshair, ShieldCheck, ArrowLeft, Trophy } from "lucide-react";
import { GAMES_CONFIG } from "@/lib/constants";
import { useGameLeaderboard, useGameMatches } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { PreMatchShowcase } from "@/components/leaderboards/pre-match-showcase";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { ShareModal } from "@/components/shared/share-modal";

export default function BgmiPage() {
  const gameConfig = GAMES_CONFIG.BGMI;
  const { data: leaderboard, lastUpdated, isRefreshing, refresh, isTabActive } =
    useGameLeaderboard("BGMI");
  const { data: matches } = useGameMatches("BGMI");

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
        subtext: "BGMI Tournament Leader",
        stat1Value: leaderboard[0].killPoints,
        stat1Label: "kill\npoints",
        stat2Value: leaderboard[0].totalPoints,
        stat2Label: "total\npoints",
      }
    : undefined;

  const second = leaderboard?.[1]
    ? {
        rank: 2 as const,
        name: leaderboard[1].teamName,
        subtext: "1st Runner-Up",
        stat1Value: leaderboard[1].killPoints,
        stat1Label: "kill\npoints",
        stat2Value: leaderboard[1].totalPoints,
        stat2Label: "total\npoints",
      }
    : undefined;

  const third = leaderboard?.[2]
    ? {
        rank: 3 as const,
        name: leaderboard[2].teamName,
        subtext: "2nd Runner-Up",
        stat1Value: leaderboard[2].killPoints,
        stat1Label: "kill\npoints",
        stat2Value: leaderboard[2].totalPoints,
        stat2Label: "total\npoints",
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
          <span>Back to Tournament Overview</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-blue-950/30 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 font-display">
              {gameConfig.badge}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
              Super Admin Approved
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
            {gameConfig.name}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            {gameConfig.tagline}. Official 10-point standard BGIS scoring table ratified by Super Admin.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1 font-mono">
            <div>Format: <span className="text-white font-sans">{gameConfig.format}</span></div>
            <div>Scoring: <span className="text-blue-400 font-sans">{gameConfig.scoringFormat}</span></div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <LiveIndicator
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
            isTabActive={isTabActive}
          />
          <ShareModal label="Share Standings" />
        </div>
      </div>

      {/* Podium OR Pre-Match Arena Live Showcase */}
      {hasMatchesPlayed && first && second && third ? (
        <div className="py-2">
          <div className="text-center mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400 font-display">
              TOP THREE RANKING
            </span>
            <h2 className="text-2xl font-black text-white font-display">
              BGMI Leaders
            </h2>
          </div>
          <Podium first={first} second={second} third={third} />
        </div>
      ) : (
        <PreMatchShowcase
          gameId="BGMI"
          gameName="BGMI"
          teamCount={leaderboard?.length || 0}
          format={gameConfig.format}
          contenders={leaderboard?.map((t) => t.teamName) || []}
        />
      )}

      {/* Leaderboard Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
            Official Squad Standings
          </h3>
          <span className="text-xs text-zinc-400">4 Matches Concluded</span>
        </div>
        <LeaderboardTable
          entries={leaderboard || []}
          gameName="BGMI"
          gameColor="#3b82f6"
        />
      </div>

      {/* Match History Cards */}
      <div className="pt-8 border-t border-zinc-800 space-y-4">
        <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
          Verified Match Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches?.map((m: any) => (
            <div
              key={m.result_id}
              className="rounded-xl border border-zinc-800 bg-[#0d1117]/80 p-5 flex flex-col justify-between hover:border-blue-500/40 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="font-mono font-bold text-white">Match #{m.match_number}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                    Approved
                  </span>
                </div>
                <div className="font-bold text-blue-400 text-sm">{m.team_name}</div>
                <p className="text-xs text-zinc-300 mt-1">{m.result_text}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Placement: {m.score_data?.placement_points} Pts</span>
                <span>Kills: {m.score_data?.kill_points} Pts</span>
                <span className="text-white font-bold">Total: {m.score_data?.total_points} Pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
