"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Trophy,
  Flame,
  Crosshair,
  Target,
  Gamepad2,
  Brain,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { GameId } from "@/types";
import { GAMES_CONFIG } from "@/lib/constants";
import { COLLEGES_DATA } from "@/lib/colleges-data";
import {
  useGameLeaderboard,
  useGameMatches,
  useTournamentStatus,
} from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { PreMatchShowcase } from "@/components/leaderboards/pre-match-showcase";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { FifaTable } from "@/components/games/fifa-table";
import { MatiksTable } from "@/components/games/matiks-table";
import { ShareModal } from "@/components/shared/share-modal";

function LeaderboardsContent() {
  const searchParams = useSearchParams();
  const collegeParam = searchParams.get("college");
  const activeCollege =
    COLLEGES_DATA.find((c) => c.slug === collegeParam) || COLLEGES_DATA[0];

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
    data: valLeaderboard,
    lastUpdated: valUpdated,
    isRefreshing: valRefreshing,
    refresh: valRefresh,
    isTabActive: valActive,
  } = useGameLeaderboard("VALORANT");

  const {
    data: efLeaderboard,
    lastUpdated: efUpdated,
    isRefreshing: efRefreshing,
    refresh: efRefresh,
    isTabActive: efActive,
  } = useGameLeaderboard("EFOOTBALL");

  const {
    data: matiksLeaderboard,
    lastUpdated: matiksUpdated,
    isRefreshing: matiksRefreshing,
    refresh: matiksRefresh,
    isTabActive: matiksActive,
  } = useGameLeaderboard("MATIKS");

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
  } else if (selectedGame === "VALORANT") {
    currentLastUpdated = valUpdated;
    currentIsRefreshing = valRefreshing;
    currentRefresh = valRefresh;
    currentIsTabActive = valActive;
  } else if (selectedGame === "EFOOTBALL") {
    currentLastUpdated = efUpdated;
    currentIsRefreshing = efRefreshing;
    currentRefresh = efRefresh;
    currentIsTabActive = efActive;
  } else if (selectedGame === "MATIKS") {
    currentLastUpdated = matiksUpdated;
    currentIsRefreshing = matiksRefreshing;
    currentRefresh = matiksRefresh;
    currentIsTabActive = matiksActive;
  }

  // Build top-3 for podium based on selected game
  let first, second, third;

  const currentLeaderboard =
    selectedGame === "FREE_FIRE"
      ? ffLeaderboard
      : selectedGame === "BGMI"
      ? bgmiLeaderboard
      : selectedGame === "VALORANT"
      ? valLeaderboard
      : selectedGame === "EFOOTBALL"
      ? (efLeaderboard as any[])
      : (matiksLeaderboard as any[]);

  const hasMatchesPlayed = Boolean(
    currentLeaderboard &&
      currentLeaderboard.some(
        (t) => (t.matchesPlayed && t.matchesPlayed > 0) || (t.totalPoints && t.totalPoints > 0)
      )
  );

  if (hasMatchesPlayed) {
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
  } else if (selectedGame === "VALORANT" && valLeaderboard && valLeaderboard.length >= 3) {
    first = {
      rank: 1 as const,
      name: valLeaderboard[0].teamName,
      subtext: "Valorant Champion",
      stat1Value: valLeaderboard[0].matchesPlayed,
      stat1Label: "matches\nplayed",
      stat2Value: valLeaderboard[0].totalPoints,
      stat2Label: "placement\npoints",
    };
    second = {
      rank: 2 as const,
      name: valLeaderboard[1].teamName,
      subtext: "1st Runner-Up",
      stat1Value: valLeaderboard[1].matchesPlayed,
      stat1Label: "matches\nplayed",
      stat2Value: valLeaderboard[1].totalPoints,
      stat2Label: "placement\npoints",
    };
    third = {
      rank: 3 as const,
      name: valLeaderboard[2].teamName,
      subtext: "2nd Runner-Up",
      stat1Value: valLeaderboard[2].matchesPlayed,
      stat1Label: "matches\nplayed",
      stat2Value: valLeaderboard[2].totalPoints,
      stat2Label: "placement\npoints",
    };
  } else if (selectedGame === "EFOOTBALL" && efLeaderboard && efLeaderboard.length >= 1) {
    first = efLeaderboard[0]
      ? {
          rank: 1 as const,
          name: efLeaderboard[0].teamName,
          subtext: "eFootball Champion",
          stat1Value: efLeaderboard[0].killPoints,
          stat1Label: "goals\nscored",
          stat2Value: efLeaderboard[0].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
    second = efLeaderboard[1]
      ? {
          rank: 2 as const,
          name: efLeaderboard[1].teamName,
          subtext: "1st Runner-Up",
          stat1Value: efLeaderboard[1].killPoints,
          stat1Label: "goals\nscored",
          stat2Value: efLeaderboard[1].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
    third = efLeaderboard[2]
      ? {
          rank: 3 as const,
          name: efLeaderboard[2].teamName,
          subtext: "2nd Runner-Up",
          stat1Value: efLeaderboard[2].killPoints,
          stat1Label: "goals\nscored",
          stat2Value: efLeaderboard[2].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
  } else if (selectedGame === "MATIKS" && matiksLeaderboard && matiksLeaderboard.length >= 1) {
    first = matiksLeaderboard[0]
      ? {
          rank: 1 as const,
          name: matiksLeaderboard[0].teamName,
          subtext: "MATIKS 1st Place",
          stat1Value: matiksLeaderboard[0].killPoints,
          stat1Label: "matiks\nscore",
          stat2Value: matiksLeaderboard[0].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
    second = matiksLeaderboard[1]
      ? {
          rank: 2 as const,
          name: matiksLeaderboard[1].teamName,
          subtext: "1st Runner-Up",
          stat1Value: matiksLeaderboard[1].killPoints,
          stat1Label: "matiks\nscore",
          stat2Value: matiksLeaderboard[1].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
    third = matiksLeaderboard[2]
      ? {
          rank: 3 as const,
          name: matiksLeaderboard[2].teamName,
          subtext: "2nd Runner-Up",
          stat1Value: matiksLeaderboard[2].killPoints,
          stat1Label: "matiks\nscore",
          stat2Value: matiksLeaderboard[2].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
  }
}

  const currentGameConfig = GAMES_CONFIG[selectedGame];

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header matching reference styling */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            title="Return to College Selection"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black border border-zinc-700/80 shadow-sm overflow-hidden flex items-center justify-center p-1.5 shrink-0 group hover:border-orange-500/50 transition"
          >
            <img
              src="/brand/clutch-logo-320.webp"
              alt="CLUTCH"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-[#f59e0b] font-display">
              <span>CLUTCH 2026 STANDINGS</span>
              {activeCollege && (
                <>
                  <span className="text-zinc-600">//</span>
                  <span className="text-zinc-200 font-mono bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-orange-400" />
                    {activeCollege.name} ({activeCollege.city})
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display mt-0.5">
              THE LEADERBOARD
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <p className="text-xs text-zinc-400">
                Displaying real-time Super Admin authorized rankings and approved point tables.
              </p>
              <Link
                href="/"
                className="text-xs font-mono text-orange-400 hover:text-orange-300 font-bold transition underline underline-offset-2 flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Switch College
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 max-w-[44px] max-h-[44px] rounded-xl bg-[#7a1c22] border border-zinc-700/80 shadow-sm overflow-hidden flex items-center justify-center p-1 shrink-0" title="NIAT">
            <img
              src="/images/niat-logo.jpg"
              alt="NIAT Crest"
              width={44}
              height={44}
              className="w-full h-full max-w-full max-h-full object-contain"
            />
          </div>
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
              {gId === "VALORANT" && <Target className="w-4 h-4 text-rose-500" />}
              {gId === "EFOOTBALL" && <Gamepad2 className="w-4 h-4 text-emerald-500" />}
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

      {/* Podium OR Pre-Match Arena Live Showcase */}
      {selectedGame === "MATIKS" || selectedGame === "EFOOTBALL" ? (
        first ? (
          <Podium first={first} second={second} third={third} />
        ) : null
      ) : hasMatchesPlayed && first ? (
        <Podium first={first} second={second} third={third} />
      ) : (
        <PreMatchShowcase
          gameName={currentGameConfig?.name || "Championship"}
          teamCount={currentLeaderboard?.length || 0}
          format={currentGameConfig?.format}
        />
      )}

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

        {selectedGame === "VALORANT" && (
          <LeaderboardTable
            entries={valLeaderboard || []}
            gameName="Valorant"
            gameColor="#ef4444"
          />
        )}

        {selectedGame === "EFOOTBALL" && (
          <LeaderboardTable
            entries={(efLeaderboard as any[]) || []}
            gameName="eFootball"
            gameColor="#10b981"
          />
        )}

        {selectedGame === "MATIKS" && (
          <LeaderboardTable
            entries={(matiksLeaderboard as any[]) || []}
            gameName="MATIKS"
            gameColor="#a855f7"
          />
        )}
      </div>
    </div>
  );
}

export default function LeaderboardsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050608] flex items-center justify-center">
          <div className="font-mono text-xs uppercase tracking-widest text-orange-400">
            LOADING CLUTCH LEADERBOARD...
          </div>
        </div>
      }
    >
      <LeaderboardsContent />
    </Suspense>
  );
}
