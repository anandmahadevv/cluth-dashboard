"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, ArrowLeft, MapPin } from "lucide-react";
import { GAMES_CONFIG } from "@/lib/constants";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";
import { useGameLeaderboard, useGameMatches, useGameAwards } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { PreMatchShowcase } from "@/components/leaderboards/pre-match-showcase";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { SpecialAwardsCard } from "@/components/games/special-awards-card";
import { ShareModal } from "@/components/shared/share-modal";

export default function FreeFirePage() {
  const gameConfig = GAMES_CONFIG.FREE_FIRE;
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

  const { data: leaderboard, lastUpdated, isRefreshing, refresh, isTabActive } =
    useGameLeaderboard("FREE_FIRE", currentCampusId);
  const { data: matches } = useGameMatches("FREE_FIRE", currentCampusId);
  const { data: awards } = useGameAwards("FREE_FIRE", currentCampusId);

  const activeLeaderboard = leaderboard?.filter((t) => !t.hidden) || [];

  const hasMatchesPlayed = Boolean(
    activeLeaderboard.length > 0 &&
      activeLeaderboard.some(
        (t) => (t.matchesPlayed && t.matchesPlayed > 0) || (t.totalPoints && t.totalPoints > 0)
      )
  );

  let first, second, third;

  if (awards?.winnerTeam && awards.winnerTeam.trim()) {
    first = {
      rank: 1 as const,
      name: awards.winnerTeam,
      subtext: "Free Fire Champion (Winner Cup)",
      stat1Value: awards.winnerScore || "53",
      stat1Label: "final\nscore",
      stat2Value: "1st",
      stat2Label: "rank",
    };
    if (awards.runnerUpTeam && awards.runnerUpTeam.trim()) {
      second = {
        rank: 2 as const,
        name: awards.runnerUpTeam,
        subtext: "1st Runner-Up (Runner-Up Cup)",
        stat1Value: awards.runnerUpScore || "52",
        stat1Label: "final\nscore",
        stat2Value: "2nd",
        stat2Label: "rank",
      };
    }
  } else if (hasMatchesPlayed && activeLeaderboard[0]) {
    first = {
      rank: 1 as const,
      name: activeLeaderboard[0].teamName,
      subtext: "Free Fire Tournament Leader",
      stat1Value: activeLeaderboard[0].killPoints,
      stat1Label: "kill\npoints",
      stat2Value: activeLeaderboard[0].totalPoints,
      stat2Label: "total\npoints",
    };
    if (activeLeaderboard[1]) {
      second = {
        rank: 2 as const,
        name: activeLeaderboard[1].teamName,
        subtext: "1st Runner-Up",
        stat1Value: activeLeaderboard[1].killPoints,
        stat1Label: "kill\npoints",
        stat2Value: activeLeaderboard[1].totalPoints,
        stat2Label: "total\npoints",
      };
    }
    if (activeLeaderboard[2]) {
      third = {
        rank: 3 as const,
        name: activeLeaderboard[2].teamName,
        subtext: "2nd Runner-Up",
        stat1Value: activeLeaderboard[2].killPoints,
        stat1Label: "kill\npoints",
        stat2Value: activeLeaderboard[2].totalPoints,
        stat2Label: "total\npoints",
      };
    }
  }

  const backLink = currentCampusId && currentCampusId !== "mangalore"
    ? `/?campus=${currentCampusId}`
    : "/";

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-white text-slate-900">
      {/* Back button */}
      <div>
        <Link
          href={backLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tournament Overview ({activeCampusMeta.name})</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-[#17211e] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 font-display">
              {gameConfig.badge}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-semibold uppercase">
              {currentCampusId === "mangalore" ? "Concluded · Ratified" : "Live Arena"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
            {gameConfig.name} · {activeCampusMeta.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {gameConfig.tagline}. Scoring based on official placement points matrix + 1 point per confirmed elimination.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {activeCampusMeta.university}, {activeCampusMeta.location}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
          <LiveIndicator
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
            isTabActive={isTabActive}
          />
          <ShareModal label="Share Standings" />
        </div>
      </div>

      {/* Podium or Arena Ready Showcase */}
      {first ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black uppercase text-slate-800 font-display tracking-wide">
              Podium Standings
            </h2>
          </div>
          <Podium first={first} second={second} third={third} />
        </div>
      ) : (
        <PreMatchShowcase
          gameName={gameConfig.name}
          teamCount={activeLeaderboard.length}
          format={gameConfig.format}
          campusName={activeCampusMeta.name}
          university={activeCampusMeta.university}
        />
      )}

      {/* Special Accolades (MVP & Top Fragger) */}
      <SpecialAwardsCard awards={awards} />

      {/* Leaderboard Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-wide">
            Official Squad Standings
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {currentCampusId === "mangalore" ? "4 Matches Concluded" : `${activeLeaderboard.length} Contenders`}
          </span>
        </div>
        <LeaderboardTable
          entries={activeLeaderboard}
          gameName="Free Fire"
          gameColor="#f59e0b"
        />
      </div>

      {/* Match History Cards */}
      {matches && matches.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-wide">
            Verified Match Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m: any) => (
              <div
                key={m.id || m.result_id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-amber-500/40 shadow-sm transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-mono font-bold text-slate-900">Match #{m.matchNumber || m.match_number}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Approved
                    </span>
                  </div>
                  <div className="font-bold text-amber-700 text-sm">{m.teamName || m.team_name}</div>
                  <p className="text-xs text-slate-600 mt-1">{m.result_text || `Rank #${m.teamResults?.[0]?.placement || 1}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
