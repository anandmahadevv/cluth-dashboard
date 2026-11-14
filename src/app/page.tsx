"use client";

import { useState } from "react";
import {
  Trophy,
  Flame,
  Crosshair,
  Target,
  Gamepad2,
  Brain,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { GameId } from "@/types";
import {
  useTournamentStatus,
  useGameLeaderboard,
  useGameMatches,
} from "@/hooks/use-tournament-data";
import { Podium } from "@/components/leaderboards/podium";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { FifaTable } from "@/components/games/fifa-table";
import { MatiksTable } from "@/components/games/matiks-table";
import { ShareModal } from "@/components/shared/share-modal";

export default function HomePage() {
  const [selectedGame, setSelectedGame] = useState<GameId>("FREE_FIRE");
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);

  const {
    lastUpdated: ffUpdated,
    isRefreshing: ffRefreshing,
    refresh: ffRefresh,
    isTabActive: ffActive,
  } = useTournamentStatus();

  const { data: ffLeaderboard } = useGameLeaderboard("FREE_FIRE");
  const { data: bgmiLeaderboard } = useGameLeaderboard("BGMI");
  const { data: valLeaderboard } = useGameLeaderboard("VALORANT");
  const { data: efLeaderboard } = useGameLeaderboard("EFOOTBALL");
  const { data: matiksLeaderboard } = useGameLeaderboard("MATIKS");

  // Determine current active leaderboard
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
  } else if (selectedGame === "VALORANT" && valLeaderboard && valLeaderboard.length >= 3) {
    first = {
      rank: 1 as const,
      name: valLeaderboard[0].teamName,
      subtext: "Valorant Champion",
      stat1Value: valLeaderboard[0].killPoints,
      stat1Label: "combat\nscore",
      stat2Value: valLeaderboard[0].totalPoints,
      stat2Label: "total\npoints",
    };
    second = {
      rank: 2 as const,
      name: valLeaderboard[1].teamName,
      subtext: "1st Runner-Up",
      stat1Value: valLeaderboard[1].killPoints,
      stat1Label: "combat\nscore",
      stat2Value: valLeaderboard[1].totalPoints,
      stat2Label: "total\npoints",
    };
    third = {
      rank: 3 as const,
      name: valLeaderboard[2].teamName,
      subtext: "2nd Runner-Up",
      stat1Value: valLeaderboard[2].killPoints,
      stat1Label: "combat\nscore",
      stat2Value: valLeaderboard[2].totalPoints,
      stat2Label: "total\npoints",
    };
  } else if (selectedGame === "EFOOTBALL" && efLeaderboard && efLeaderboard.length >= 3) {
    first = {
      rank: 1 as const,
      name: efLeaderboard[0].teamName,
      subtext: "eFootball Champion",
      stat1Value: efLeaderboard[0].killPoints,
      stat1Label: "goals\nscored",
      stat2Value: efLeaderboard[0].totalPoints,
      stat2Label: "total\npoints",
    };
    second = {
      rank: 2 as const,
      name: efLeaderboard[1].teamName,
      subtext: "1st Runner-Up",
      stat1Value: efLeaderboard[1].killPoints,
      stat1Label: "goals\nscored",
      stat2Value: efLeaderboard[1].totalPoints,
      stat2Label: "total\npoints",
    };
    third = {
      rank: 3 as const,
      name: efLeaderboard[2].teamName,
      subtext: "2nd Runner-Up",
      stat1Value: efLeaderboard[2].killPoints,
      stat1Label: "goals\nscored",
      stat2Value: efLeaderboard[2].totalPoints,
      stat2Label: "total\npoints",
    };
  } else if (selectedGame === "MATIKS" && matiksLeaderboard && matiksLeaderboard.length >= 3) {
    first = {
      rank: 1 as const,
      name: matiksLeaderboard[0].teamName,
      subtext: "MATIKS 1st Place",
      stat1Value: matiksLeaderboard[0].matchesPlayed,
      stat1Label: "rounds\nplayed",
      stat2Value: matiksLeaderboard[0].totalPoints,
      stat2Label: "matrix\nscore",
    };
    second = {
      rank: 2 as const,
      name: matiksLeaderboard[1].teamName,
      subtext: "1st Runner-Up",
      stat1Value: matiksLeaderboard[1].matchesPlayed,
      stat1Label: "rounds\nplayed",
      stat2Value: matiksLeaderboard[1].totalPoints,
      stat2Label: "matrix\nscore",
    };
    third = {
      rank: 3 as const,
      name: matiksLeaderboard[2].teamName,
      subtext: "2nd Runner-Up",
      stat1Value: matiksLeaderboard[2].matchesPlayed,
      stat1Label: "rounds\nplayed",
      stat2Value: matiksLeaderboard[2].totalPoints,
      stat2Label: "matrix\nscore",
    };
  }

  const toggleProjector = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsProjectorMode(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsProjectorMode(false);
      }
    } catch {
      setIsProjectorMode(!isProjectorMode);
    }
  };

  return (
    <div
      className={
        isProjectorMode
          ? "fixed inset-0 z-50 overflow-y-auto bg-white p-6 sm:p-10 flex flex-col justify-start items-center"
          : "min-h-screen px-4 pt-10 pb-20 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 bg-white text-slate-900"
      }
    >
      {/* Top Header matching reference image: THE LEADERBOARD */}
      <div className="w-full text-center max-w-2xl mx-auto space-y-2 relative">
        {/* Projector exit button if in fullscreen */}
        {isProjectorMode && (
          <button
            onClick={toggleProjector}
            className="absolute top-0 right-0 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Exit Projector Mode"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}

        <div className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-800">
          THE
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#1e293b] leading-none">
          LEADERBOARD
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium pt-1">
          CLUTCH – NIAT E-Sports Championship • Yenepoya University, Mangalore • 15 November 2026
        </p>

        {/* Toolbar: Game selector & Projector expander */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 shadow-xs">
            <button
              onClick={() => setSelectedGame("FREE_FIRE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                selectedGame === "FREE_FIRE"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Free Fire</span>
            </button>
            <button
              onClick={() => setSelectedGame("BGMI")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                selectedGame === "BGMI"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-500" />
              <span>BGMI</span>
            </button>
            <button
              onClick={() => setSelectedGame("VALORANT")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                selectedGame === "VALORANT"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>Valorant</span>
            </button>
            <button
              onClick={() => setSelectedGame("EFOOTBALL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                selectedGame === "EFOOTBALL"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>eFootball</span>
            </button>
            <button
              onClick={() => setSelectedGame("MATIKS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                selectedGame === "MATIKS"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span>MATIKS</span>
            </button>
          </div>

          {/* Projector Fullscreen Poster Toggle */}
          <button
            onClick={toggleProjector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            title="Expand to Projector Poster Mode"
          >
            {isProjectorMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Projector Poster Mode</span>
              </>
            )}
          </button>

          {!isProjectorMode && (
            <div className="flex items-center gap-2">
              <ShareModal label="Share" />
            </div>
          )}
        </div>
      </div>

      {/* The Iconic Reference 3-Box Podium */}
      <Podium
        first={first}
        second={second}
        third={third}
        isProjector={isProjectorMode}
      />

      {/* Clean Table Below */}
      <div className="w-full max-w-4xl mx-auto pt-2">
        {selectedGame === "FREE_FIRE" && (
          <LeaderboardTable
            entries={ffLeaderboard || []}
            isProjector={isProjectorMode}
          />
        )}

        {selectedGame === "BGMI" && (
          <LeaderboardTable
            entries={bgmiLeaderboard || []}
            isProjector={isProjectorMode}
          />
        )}

        {selectedGame === "VALORANT" && (
          <LeaderboardTable
            entries={valLeaderboard || []}
            gameName="Valorant"
            isProjector={isProjectorMode}
          />
        )}

        {selectedGame === "EFOOTBALL" && (
          <LeaderboardTable
            entries={(efLeaderboard as any[]) || []}
            gameName="eFootball"
            isProjector={isProjectorMode}
          />
        )}

        {selectedGame === "MATIKS" && (
          <LeaderboardTable
            entries={(matiksLeaderboard as any[]) || []}
            gameName="MATIKS"
            isProjector={isProjectorMode}
          />
        )}
      </div>


    </div>
  );
}
