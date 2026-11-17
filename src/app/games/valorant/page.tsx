"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, ArrowLeft, MapPin } from "lucide-react";
import { GAMES_CONFIG } from "@/lib/constants";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";
import { useGameLeaderboard, useGameMatches } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { PreMatchShowcase } from "@/components/leaderboards/pre-match-showcase";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { ShareModal } from "@/components/shared/share-modal";

export default function ValorantPage() {
  const gameConfig = GAMES_CONFIG.VALORANT;
  const [currentCampusId, setCurrentCampusId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCampus = params.get("campus") || params.get("college");
      const stored = localStorage.getItem("clutch_selected_campus");
      return urlCampus || stored || "mangalore";
    }
    return "mangalore";
  });

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
    useGameLeaderboard("VALORANT", currentCampusId);
  const { data: matches } = useGameMatches("VALORANT", currentCampusId);

  const activeLeaderboard = leaderboard?.filter((t) => !t.hidden) || [];

  const hasMatchesPlayed = Boolean(
    activeLeaderboard.length > 0 &&
      activeLeaderboard.some(
        (t) => (t.matchesPlayed && t.matchesPlayed > 0) || (t.totalPoints && t.totalPoints > 0)
      )
  );

  const first = hasMatchesPlayed && activeLeaderboard[0]
    ? {
        rank: 1 as const,
        name: activeLeaderboard[0].teamName,
        subtext: "Valorant Champion",
        stat1Value: activeLeaderboard[0].matchesPlayed,
        stat1Label: "matches\nplayed",
        stat2Value: activeLeaderboard[0].totalPoints,
        stat2Label: "placement\npoints",
      }
    : undefined;

  const second = hasMatchesPlayed && activeLeaderboard[1]
    ? {
        rank: 2 as const,
        name: activeLeaderboard[1].teamName,
        subtext: "1st Runner-Up",
        stat1Value: activeLeaderboard[1].matchesPlayed,
        stat1Label: "matches\nplayed",
        stat2Value: activeLeaderboard[1].totalPoints,
        stat2Label: "placement\npoints",
      }
    : undefined;

  const third = hasMatchesPlayed && activeLeaderboard[2]
    ? {
        rank: 3 as const,
        name: activeLeaderboard[2].teamName,
        subtext: "2nd Runner-Up",
        stat1Value: activeLeaderboard[2].matchesPlayed,
        stat1Label: "matches\nplayed",
        stat2Value: activeLeaderboard[2].totalPoints,
        stat2Label: "placement\npoints",
      }
    : undefined;

  const backLink = currentCampusId && currentCampusId !== "mangalore"
    ? `/?campus=${currentCampusId}`
    : "/";

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-white text-slate-900">
      <div>
        <Link
          href={backLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tournament Overview ({activeCampusMeta.name})</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#17211e] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 font-display">
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
            {gameConfig.tagline}. Matches scored strictly by bracket placement finish: 1st Place = 10 pts, 2nd Place = 6 pts, 3rd = 4 pts.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
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

      {first ? (
        <div className="py-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black uppercase text-slate-800 font-display tracking-wide">
              Valorant Leaders
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

      {/* Leaderboard Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 font-display uppercase tracking-wide">
            Official Squad Standings
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {activeLeaderboard.length} Contenders
          </span>
        </div>
        <LeaderboardTable
          entries={activeLeaderboard}
          gameName="Valorant"
          gameColor="#ef4444"
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
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-rose-500/40 shadow-sm transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-mono font-bold text-slate-900">Match #{m.matchNumber || m.match_number}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      Approved
                    </span>
                  </div>
                  <div className="font-bold text-rose-700 text-sm">{m.teamName || m.team_name}</div>
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
