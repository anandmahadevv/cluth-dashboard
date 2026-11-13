"use client";

import { useTournamentWinners } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { ShareModal } from "@/components/shared/share-modal";

export default function WinnersPage() {
  const { data: winners, lastUpdated, isRefreshing, refresh, isTabActive } =
    useTournamentWinners();

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 max-w-5xl mx-auto space-y-10 bg-white text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
            TOURNAMENT WINNERS
          </h1>
          <p className="text-xs text-slate-500">
            Official ratified champions across all 4 competitive arenas
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

      {/* Winners Section */}
      <div className="space-y-12">
        {winners?.map((gameWinner) => {
          const first = gameWinner.firstPlace
            ? {
                rank: 1 as const,
                name: gameWinner.firstPlace.name,
                subtext: "Champion (Gold)",
                stat1Value: "Rank 1",
                stat1Label: "podium",
                stat2Value: gameWinner.firstPlace.pointsOrScore,
                stat2Label: "score",
              }
            : undefined;

          const second = gameWinner.secondPlace
            ? {
                rank: 2 as const,
                name: gameWinner.secondPlace.name,
                subtext: "1st Runner-Up (Silver)",
                stat1Value: "Rank 2",
                stat1Label: "podium",
                stat2Value: gameWinner.secondPlace.pointsOrScore,
                stat2Label: "score",
              }
            : undefined;

          const third = gameWinner.thirdPlace
            ? {
                rank: 3 as const,
                name: gameWinner.thirdPlace.name,
                subtext: "2nd Runner-Up (Bronze)",
                stat1Value: "Rank 3",
                stat1Label: "podium",
                stat2Value: gameWinner.thirdPlace.pointsOrScore,
                stat2Label: "score",
              }
            : undefined;

          return (
            <div key={gameWinner.gameId} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight">
                  {gameWinner.gameName}
                </h2>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Approved
                </span>
              </div>
              <Podium first={first} second={second} third={third} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
