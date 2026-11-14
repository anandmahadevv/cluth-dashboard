"use client";

import Link from "next/link";
import { Brain, ShieldCheck, ArrowLeft, Trophy } from "lucide-react";
import { GAMES_CONFIG } from "@/lib/constants";
import { useGameLeaderboard, useGameMatches } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { ShareModal } from "@/components/shared/share-modal";

export default function MatiksPage() {
  const gameConfig = GAMES_CONFIG.MATIKS;
  const { data: leaderboard, lastUpdated, isRefreshing, refresh, isTabActive } =
    useGameLeaderboard("MATIKS");
  const { data: matches } = useGameMatches("MATIKS");

  const first = leaderboard?.[0]
    ? {
        rank: 1 as const,
        name: leaderboard[0].teamName,
        subtext: "MATIKS Champion",
        stat1Value: leaderboard[0].matchesPlayed,
        stat1Label: "rounds\nplayed",
        stat2Value: leaderboard[0].totalPoints,
        stat2Label: "matrix\nscore",
      }
    : undefined;

  const second = leaderboard?.[1]
    ? {
        rank: 2 as const,
        name: leaderboard[1].teamName,
        subtext: "1st Runner-Up",
        stat1Value: leaderboard[1].matchesPlayed,
        stat1Label: "rounds\nplayed",
        stat2Value: leaderboard[1].totalPoints,
        stat2Label: "matrix\nscore",
      }
    : undefined;

  const third = leaderboard?.[2]
    ? {
        rank: 3 as const,
        name: leaderboard[2].teamName,
        subtext: "2nd Runner-Up",
        stat1Value: leaderboard[2].matchesPlayed,
        stat1Label: "rounds\nplayed",
        stat2Value: leaderboard[2].totalPoints,
        stat2Label: "matrix\nscore",
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

      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-purple-950/30 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 font-display">
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
            {gameConfig.tagline}. Accuracy vs. reaction time coefficient computed dynamically from approved tournament rules.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1 font-mono">
            <div>Format: <span className="text-white font-sans">{gameConfig.format}</span></div>
            <div>Scoring: <span className="text-purple-400 font-sans">{gameConfig.scoringFormat}</span></div>
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

      {/* Podium based on reference theme */}
      <div className="py-2">
        <div className="text-center mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-purple-400 font-display">
            CHAMPIONSHIP PODIUM
          </span>
          <h2 className="text-2xl font-black text-white font-display">
            MATIKS Grand Finalists
          </h2>
        </div>
        <Podium first={first} second={second} third={third} />
      </div>

      {/* Standings Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
            Official Standings Table
          </h3>
          <span className="text-xs text-zinc-400">Live Tournament Store</span>
        </div>
        <LeaderboardTable entries={(leaderboard as any[]) || []} gameName="MATIKS" gameColor="#a855f7" />
      </div>
    </div>
  );
}
