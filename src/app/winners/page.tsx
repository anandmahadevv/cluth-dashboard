"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { useTournamentWinners, useGameAwards } from "@/hooks/use-tournament-data";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { ShareModal } from "@/components/shared/share-modal";
import { SpecialAwardsCard } from "@/components/games/special-awards-card";

export default function WinnersPage() {
  const [currentCampusId, setCurrentCampusId] = useState<string>("mangalore");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCampus = params.get("campus") || params.get("college");
      if (urlCampus) {
        localStorage.setItem("clutch_selected_campus", urlCampus);
        setCurrentCampusId(urlCampus);
      } else {
        const stored = localStorage.getItem("clutch_selected_campus");
        if (stored) setCurrentCampusId(stored);
      }
      const handler = (e: any) => {
        if (e.detail) {
          setCurrentCampusId(e.detail);
          localStorage.setItem("clutch_selected_campus", e.detail);
        }
      };
      window.addEventListener("clutch_campus_change", handler);
      return () => window.removeEventListener("clutch_campus_change", handler);
    }
  }, []);

  const activeCampusMeta = CAMPUSES_REGISTRY[currentCampusId] || CAMPUSES_REGISTRY["mangalore"];

  const { data: winners, lastUpdated, isRefreshing, refresh, isTabActive } =
    useTournamentWinners(currentCampusId);
  const { data: ffAwards } = useGameAwards("FREE_FIRE", currentCampusId);

  const isMangalore = currentCampusId === "mangalore";
  const hasAwards = Boolean(ffAwards?.winnerTeam || ffAwards?.mvp?.playerName);
  const hasWinners = Boolean(winners && winners.length > 0);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 max-w-5xl mx-auto space-y-10 bg-white text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">
            TOURNAMENT WINNERS
          </h1>
          <p className="text-xs text-slate-500">
            Official ratified champions across all competitive arenas · {activeCampusMeta.name}
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
        {/* If no concluded winners yet for this campus */}
        {!isMangalore && !hasAwards && !hasWinners && (
          <div className="py-14 px-6 rounded-3xl bg-[#f7f8f4] border border-[#dfe4db] text-center max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>ARENA READY • THE CROWN HAS TO BE EARNED</span>
            </div>
            <h2 className="text-xl font-black text-[#17211e] uppercase tracking-tight">
              {activeCampusMeta.name} Championship In Progress
            </h2>
            <p className="text-xs text-[#69776d] leading-relaxed">
              Teams and solo gladiators are currently battling on stage. Official champions, runner-up cups, MVP, and kill leader accolades will appear here live once Grand Finals conclude and are ratified by Super Admin.
            </p>
          </div>
        )}

        {/* Free Fire Grand Finals Showcase */}
        {(isMangalore || hasAwards) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-lg font-black uppercase text-slate-800 tracking-tight">
                Free Fire (Grand Finals)
              </h2>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                Official Ratified
              </span>
            </div>
            <SpecialAwardsCard awards={ffAwards} />
          </div>
        )}

        {(isMangalore || hasWinners) && winners?.map((gameWinner) => {
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

              {/* Special Awards (MVP & Top Fragger) for Free Fire */}
              {gameWinner.gameId === "FREE_FIRE" && (
                <div className="pt-2">
                  <SpecialAwardsCard awards={ffAwards} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
