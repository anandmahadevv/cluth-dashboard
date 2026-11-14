"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  ShieldCheck,
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Target,
  Award,
  ChevronRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { GAMES_CONFIG, EVENT_DETAILS } from "@/lib/constants";
import { useGameLeaderboard, useGameMatches } from "@/hooks/use-tournament-data";
import { LiveIndicator } from "@/components/layout/live-indicator";
import { Podium } from "@/components/leaderboards/podium";
import { PreMatchShowcase } from "@/components/leaderboards/pre-match-showcase";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { ShareModal } from "@/components/shared/share-modal";
import { FREE_FIRE_GROUPS } from "@/lib/tournament-constants";

export default function FreeFirePage() {
  const gameConfig = GAMES_CONFIG.FREE_FIRE;
  const { data: leaderboard, lastUpdated, isRefreshing, refresh, isTabActive } =
    useGameLeaderboard("FREE_FIRE");
  const { data: matches } = useGameMatches("FREE_FIRE");
  const [roadmapTab, setRoadmapTab] = useState<"flow" | "points" | "rules" | "groups">("flow");

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
        subtext: "Free Fire Tournament Leader",
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
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tournament Overview</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-zinc-950 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 font-display">
              {gameConfig.badge}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
              Super Admin Approved
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30 font-semibold uppercase font-mono">
              17 Squads • 2 Rounds
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
            {gameConfig.name}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
            {gameConfig.tagline}. Mangalore Edition featuring 17 competitive teams across Group A & Group B qualifiers advancing to the 12-squad Grand Finals.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1 font-mono">
            <div>
              Format: <span className="text-white font-sans">{gameConfig.format}</span>
            </div>
            <div>
              Scoring: <span className="text-amber-400 font-sans">{gameConfig.scoringFormat}</span>
            </div>
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

      {/* TOURNAMENT ROADMAP SECTION */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0c1017] p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-display">
                OFFICIAL ROADMAP
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-display mt-0.5">
              Mangalore Clutch – Free Fire Tournament Structure
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Organized by CLUTCH ESPORTS • 17 Teams • 2 Tournament Rounds • Top 2 Trophies
            </p>
          </div>

          {/* Roadmap Nav Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
            {[
              { id: "flow" as const, label: "Tournament Flow" },
              { id: "points" as const, label: "Point System" },
              { id: "groups" as const, label: "Group Distribution" },
              { id: "rules" as const, label: "Tie-Breakers & Awards" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoadmapTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  roadmapTab === tab.id
                    ? "bg-amber-500 text-zinc-950 font-extrabold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Tournament Flow */}
        {roadmapTab === "flow" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Round 1 Card */}
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-zinc-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  STAGE 1
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">17 Squads Total</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">
                  Round 1 – Qualifiers
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  17 teams divided into 2 groups competing in back-to-back 2 matches each.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-zinc-300">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="font-semibold text-white">Group A</span>
                  <span className="font-mono text-amber-400 font-bold">9 Teams • B2B 2 Matches</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="font-semibold text-white">Group B</span>
                  <span className="font-mono text-blue-400 font-bold">8 Teams • B2B 2 Matches</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Qualification Cutoff:</strong> Top 6 from Group A + Top 6 from Group B qualify for Grand Finals (<strong>12 Finalists</strong>).
                </span>
              </div>
            </div>

            {/* Round 2 Card */}
            <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-zinc-950 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STAGE 2
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400">12 Grand Finalists</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">
                  Round 2 – Grand Finals
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  12 qualified squads compete together. Accumulated placement + kill points determine the final championship standings.
                </p>
              </div>

              {/* Awards Preview */}
              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <div>
                      <div className="font-black text-amber-400 uppercase">1st Place – WINNER CUP</div>
                      <div className="text-[11px] text-zinc-400">Official CLUTCH Championship Winner Cup</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-zinc-950">CHAMPION</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥈</span>
                    <div>
                      <div className="font-black text-slate-300 uppercase">2nd Place – RUNNER-UP CUP</div>
                      <div className="text-[11px] text-zinc-400">Official CLUTCH Runner-up Cup</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-300 text-zinc-950">RUNNER-UP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Point System */}
        {roadmapTab === "points" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {[
                { place: "1st (Booyah)", pts: "12 Pts", highlight: true },
                { place: "2nd Place", pts: "9 Pts" },
                { place: "3rd Place", pts: "8 Pts" },
                { place: "4th Place", pts: "7 Pts" },
                { place: "5th Place", pts: "6 Pts" },
                { place: "6th Place", pts: "5 Pts" },
                { place: "7th Place", pts: "4 Pts" },
                { place: "8th Place", pts: "3 Pts" },
                { place: "9th Place", pts: "2 Pts" },
                { place: "10th Place", pts: "1 Pt" },
                { place: "11th–12th", pts: "0 Pts" },
                { place: "Kill Point", pts: "+1 Pt / Elim", kill: true },
              ].map((item) => (
                <div
                  key={item.place}
                  className={`p-3 rounded-xl border text-center transition ${
                    item.highlight
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : item.kill
                      ? "bg-red-500/15 border-red-500/40 text-red-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300"
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase text-zinc-400">{item.place}</div>
                  <div className="text-base font-black font-mono mt-0.5">{item.pts}</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
              <span><strong>Total Match Points Formula:</strong> Placement Points + Total Confirmed Eliminations (Kills).</span>
              <span className="font-mono text-amber-400">Every kill = 1 pt</span>
            </div>
          </div>
        )}

        {/* Tab 3: Group Distribution */}
        {roadmapTab === "groups" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group A Card */}
            <div className="rounded-xl border border-amber-500/30 bg-zinc-950 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h4 className="font-bold text-white text-sm">Group A (9 Squads)</h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Top 6 Advance
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {FREE_FIRE_GROUPS.GROUP_A.map((t, idx) => (
                  <div
                    key={t}
                    className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-semibold text-zinc-200 flex items-center gap-2"
                  >
                    <span className="text-[10px] font-mono text-zinc-500 w-4">#{idx + 1}</span>
                    <span className="truncate">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group B Card */}
            <div className="rounded-xl border border-blue-500/30 bg-zinc-950 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <h4 className="font-bold text-white text-sm">Group B (8 Squads)</h4>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Top 6 Advance
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {FREE_FIRE_GROUPS.GROUP_B.map((t, idx) => (
                  <div
                    key={t}
                    className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-semibold text-zinc-200 flex items-center gap-2"
                  >
                    <span className="text-[10px] font-mono text-zinc-500 w-4">#{idx + 1}</span>
                    <span className="truncate">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tie-Breakers & Rules */}
        {roadmapTab === "rules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Official Tie-Breaker Protocol</span>
              </h4>
              <p className="text-xs text-zinc-400">
                If two or more teams finish with equal points, rankings are strictly decided by:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span><strong>Higher number of Booyahs</strong> (1st place finishes)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span><strong>Higher placement points</strong></span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span><strong>Higher total kill points</strong></span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-zinc-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                    4
                  </span>
                  <span><strong>Better placement in the last match</strong></span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Championship Trophies</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Official awards presented at the conclusion of the Grand Finals:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-black text-amber-400">WINNER CUP</div>
                    <div className="text-[11px] text-zinc-300">Official CLUTCH Championship Winner Cup — Awarded to the tournament champions.</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-400/10 border border-slate-400/30 flex items-center gap-3">
                  <span className="text-2xl">🥈</span>
                  <div>
                    <div className="font-black text-slate-300">RUNNER-UP CUP</div>
                    <div className="text-[11px] text-zinc-300">Official CLUTCH Runner-up Cup — Awarded to the 2nd place team.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Podium OR Pre-Match Arena Live Showcase */}
      {hasMatchesPlayed && first && second && third ? (
        <div className="py-2">
          <div className="text-center mb-4">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-display">
              TOP THREE RANKING
            </span>
            <h2 className="text-2xl font-black text-white font-display">
              Free Fire Leaders
            </h2>
          </div>
          <Podium first={first} second={second} third={third} />
        </div>
      ) : (
        <PreMatchShowcase
          gameName="Free Fire"
          teamCount={leaderboard?.length || 0}
          format={GAMES_CONFIG.FREE_FIRE.format}
        />
      )}

      {/* Leaderboard Table with Stage Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
              Official Free Fire Standings
            </h3>
            <p className="text-xs text-zinc-400">
              Switch between All 17 Squads, Group A Qualifiers, Group B Qualifiers, or Grand Finals
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {matches?.length || 0} Matches Concluded
          </span>
        </div>

        <LeaderboardTable
          entries={leaderboard || []}
          gameName="Free Fire"
          gameColor="#f59e0b"
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
              key={m.result_id || m.id}
              className="rounded-xl border border-zinc-800 bg-[#0d1117]/80 p-5 flex flex-col justify-between hover:border-amber-500/40 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="font-mono font-bold text-white">Match #{m.matchNumber || m.match_number}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                    Approved
                  </span>
                </div>
                <div className="font-bold text-amber-400 text-sm">{m.team_name || m.teamName || "Match Results"}</div>
                {m.notes && <p className="text-xs text-zinc-300 mt-1">{m.notes}</p>}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Placement: {m.score_data?.placement_points || m.teamResults?.[0]?.placementPoints || 0} Pts</span>
                <span>Kills: {m.score_data?.kill_points || m.teamResults?.[0]?.kills || 0} Pts</span>
                <span className="text-white font-bold">Total: {m.score_data?.total_points || m.teamResults?.[0]?.matchPoints || 0} Pts</span>
              </div>
            </div>
          ))}
          {(!matches || matches.length === 0) && (
            <div className="col-span-full p-8 rounded-xl border border-zinc-800 text-center text-xs text-zinc-500 font-mono">
              No matches recorded yet. Once Super Admin approves matches, verified match cards will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
