"use client";

import { useState } from "react";
import {
  Trophy,
  Flame,
  Crosshair,
  Gamepad2,
  Brain,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GameId } from "@/types";
import { GAMES_CONFIG } from "@/lib/constants";
import {
  useGameLeaderboard,
  useGameMatches,
  useTournamentStatus,
} from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { FifaTable } from "@/components/games/fifa-table";
import { MatiksTable } from "@/components/games/matiks-table";
import { ShareModal } from "@/components/shared/share-modal";

export default function LeaderboardsPage() {
  const [selectedGame, setSelectedGame] = useState<GameId>("FREE_FIRE");

  const {
    data: ffLeaderboard,
    lastUpdated: ffUpdated,
    isRefreshing: ffRefreshing,
    refresh: ffRefresh,
    isTabActive: ffActive,
  } = useGameLeaderboard("FREE_FIRE");

  const {
    data: bgmiLeaderboard,
    lastUpdated: bgmiUpdated,
    isRefreshing: bgmiRefreshing,
    refresh: bgmiRefresh,
    isTabActive: bgmiActive,
  } = useGameLeaderboard("BGMI");

  const {
    data: fifaMatches,
    lastUpdated: fifaUpdated,
    isRefreshing: fifaRefreshing,
    refresh: fifaRefresh,
    isTabActive: fifaActive,
  } = useGameMatches("FIFA");

  const {
    data: matiksResults,
    lastUpdated: matiksUpdated,
    isRefreshing: matiksRefreshing,
    refresh: matiksRefresh,
    isTabActive: matiksActive,
  } = useGameMatches("MATIKS");

  // Determine current active game's polling metadata
  let currentLastUpdated = ffUpdated;
  let currentIsRefreshing = ffRefreshing;
  let currentRefresh = ffRefresh;
  let currentIsTabActive = ffActive;

  if (selectedGame === "BGMI") {
    currentLastUpdated = bgmiUpdated;
    currentIsRefreshing = bgmiRefreshing;
    currentRefresh = bgmiRefresh;
    currentIsTabActive = bgmiActive;
  } else if (selectedGame === "FIFA") {
    currentLastUpdated = fifaUpdated;
    currentIsRefreshing = fifaRefreshing;
    currentRefresh = fifaRefresh;
    currentIsTabActive = fifaActive;
  } else if (selectedGame === "MATIKS") {
    currentLastUpdated = matiksUpdated;
    currentIsRefreshing = matiksRefreshing;
    currentRefresh = matiksRefresh;
    currentIsTabActive = matiksActive;
  }

  // Build top-3 for podium based on selected game
  let first, second, third;

  if (selectedGame === "FREE_FIRE" && ffLeaderboard && ffLeaderboard.length >= 3) {
    first = {
      rank: 1 as const,
      name: ffLeaderboard[0].teamName,
      subtext: "Free Fire 1st Place",
      stat1Value: ffLeaderboard[0].killPoints,
      stat1Label: "kill\npoints",
      stat2Value: ffLeaderboard[0].totalPoints,
      stat2Label: "total\npoints",
    };
    second = {
      rank: 2 as const,
      name: ffLeaderboard[1].teamName,
      subtext: "1st Runner-Up",
      stat1Value: ffLeaderboard[1].killPoints,
      stat1Label: "kill\npoints",
      stat2Value: ffLeaderboard[1].totalPoints,
      stat2Label: "total\npoints",
    };
    third = {
      rank: 3 as const,
      name: ffLeaderboard[2].teamName,
      subtext: "2nd Runner-Up",
      stat1Value: ffLeaderboard[2].killPoints,
      stat1Label: "kill\npoints",
      stat2Value: ffLeaderboard[2].totalPoints,
      stat2Label: "total\npoints",
    };
  } else if (selectedGame === "BGMI" && bgmiLeaderboard && bgmiLeaderboard.length >= 3) {
    first = {
      rank: 1 as const,
      name: bgmiLeaderboard[0].teamName,
      subtext: "BGMI 1st Place",
      stat1Value: bgmiLeaderboard[0].killPoints,
      stat1Label: "kill\npoints",
      stat2Value: bgmiLeaderboard[0].totalPoints,
      stat2Label: "total\npoints",
    };
    second = {
      rank: 2 as const,
      name: bgmiLeaderboard[1].teamName,
      subtext: "1st Runner-Up",
      stat1Value: bgmiLeaderboard[1].killPoints,
      stat1Label: "kill\npoints",
      stat2Value: bgmiLeaderboard[1].totalPoints,
      stat2Label: "total\npoints",
    };
    third = {
      rank: 3 as const,
      name: bgmiLeaderboard[2].teamName,
      subtext: "2nd Runner-Up",
      stat1Value: bgmiLeaderboard[2].killPoints,
      stat1Label: "kill\npoints",
      stat2Value: bgmiLeaderboard[2].totalPoints,
      stat2Label: "total\npoints",
    };
  } else if (selectedGame === "FIFA") {
    first = {
      rank: 1 as const,
      name: "Zayd 'Apex' Khan",
      subtext: "Real Madrid • Champion",
      stat1Value: 6,
      stat1Label: "matches\nwon",
      stat2Value: "Gold",
      stat2Label: "final\ntrophy",
    };
    second = {
      rank: 2 as const,
      name: "Rohit 'Striker' Shetty",
      subtext: "Manchester City • Finalist",
      stat1Value: 5,
      stat1Label: "matches\nwon",
      stat2Value: "Silver",
      stat2Label: "finalist\nmedal",
    };
    third = {
      rank: 3 as const,
      name: "Neil 'Maestro' D'Souza",
      subtext: "Bayern Munich • 3rd Place",
      stat1Value: 4,
      stat1Label: "matches\nwon",
      stat2Value: "Bronze",
      stat2Label: "3rd place\nmedal",
    };
  } else if (selectedGame === "MATIKS" && matiksResults && matiksResults.length >= 3) {
    const mList = matiksResults as unknown as import("@/types").MatiksMatchResult[];
    first = {
      rank: 1 as const,
      name: mList[0].playerName,
      subtext: mList[0].teamName || "Championship Rank 1",
      stat1Value: "98.8%",
      stat1Label: "accuracy\nrate",
      stat2Value: mList[0].score,
      stat2Label: "matrix\nscore",
    };
    second = {
      rank: 2 as const,
      name: mList[1].playerName,
      subtext: mList[1].teamName || "Championship Rank 2",
      stat1Value: "96.4%",
      stat1Label: "accuracy\nrate",
      stat2Value: mList[1].score,
      stat2Label: "matrix\nscore",
    };
    third = {
      rank: 3 as const,
      name: mList[2].playerName,
      subtext: mList[2].teamName || "Championship Rank 3",
      stat1Value: "94.0%",
      stat1Label: "accuracy\nrate",
      stat2Value: mList[2].score,
      stat2Label: "matrix\nscore",
    };
  }

  const currentGameConfig = GAMES_CONFIG[selectedGame];

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header matching reference styling */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-[#f59e0b] font-display">
            CLUTCH 2026 STANDINGS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display mt-0.5">
            THE LEADERBOARD
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Displaying real-time Super Admin authorized rankings and approved point tables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LiveIndicator
            lastUpdated={currentLastUpdated}
            isRefreshing={currentIsRefreshing}
            onRefresh={currentRefresh}
            isTabActive={currentIsTabActive}
          />
          <ShareModal label="Share Leaderboard" />
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 border-b border-zinc-800/80 pb-4">
        {(Object.keys(GAMES_CONFIG) as GameId[]).map((gId) => {
          const config = GAMES_CONFIG[gId];
          const isSelected = selectedGame === gId;
          return (
            <button
              key={gId}
              onClick={() => setSelectedGame(gId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isSelected
                  ? "bg-white text-slate-950 shadow-md font-black"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              {gId === "FREE_FIRE" && <Flame className="w-4 h-4 text-amber-500" />}
              {gId === "BGMI" && <Crosshair className="w-4 h-4 text-blue-500" />}
              {gId === "FIFA" && <Gamepad2 className="w-4 h-4 text-emerald-500" />}
              {gId === "MATIKS" && <Brain className="w-4 h-4 text-purple-500" />}
              <span>{config.name}</span>
            </button>
          );
        })}
      </div>

      {/* Game Summary Note */}
      <div className="rounded-xl border border-zinc-800 bg-[#0d1117]/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-white text-sm block">
            {currentGameConfig.name} • {currentGameConfig.format}
          </span>
          <span className="text-zinc-400">{currentGameConfig.rulesOverview}</span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 border border-zinc-700/60 font-mono text-[11px] text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Rules Configured & Approved</span>
        </div>
      </div>

      {/* Podium using the exact reference design */}
      <Podium first={first} second={second} third={third} />

      {/* Tables based on game type */}
      <div className="pt-4">
        {selectedGame === "FREE_FIRE" && (
          <LeaderboardTable
            entries={ffLeaderboard || []}
            gameName="Free Fire"
            gameColor="#f59e0b"
          />
        )}

        {selectedGame === "BGMI" && (
          <LeaderboardTable
            entries={bgmiLeaderboard || []}
            gameName="BGMI"
            gameColor="#3b82f6"
          />
        )}

        {selectedGame === "FIFA" && (
          <FifaTable matches={(fifaMatches as any[]) || []} />
        )}

        {selectedGame === "MATIKS" && (
          <MatiksTable results={(matiksResults as any[]) || []} />
        )}
      </div>
    </div>
  );
}
