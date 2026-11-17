"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Crosshair,
  Target,
  Gamepad2,
  Brain,
  Maximize2,
  Minimize2,
  MapPin,
  CalendarDays,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { GameId } from "@/types";
import { GAMES_CONFIG } from "@/lib/constants";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";
import {
  useTournamentStatus,
  useGameLeaderboard,
  useGameAwards,
} from "@/hooks/use-tournament-data";
import { Podium } from "@/components/leaderboards/podium";
import { PreMatchShowcase } from "@/components/leaderboards/pre-match-showcase";
import { LeaderboardTable } from "@/components/games/leaderboard-table";
import { SpecialAwardsCard } from "@/components/games/special-awards-card";
import { ShareModal } from "@/components/shared/share-modal";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId>("FREE_FIRE");
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);
  const [currentCampusId, setCurrentCampusId] = useState<string>("mangalore");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCampus = params.get("campus") || params.get("college");
      const stored = localStorage.getItem("clutch_selected_campus");
      if (urlCampus || stored) {
        setCurrentCampusId(urlCampus || stored || "mangalore");
      }

      const handler = (e: any) => {
        if (e.detail) setCurrentCampusId(e.detail);
      };
      window.addEventListener("clutch_campus_change", handler);
      return () => window.removeEventListener("clutch_campus_change", handler);
    }
  }, []);

  const {
    data: tournament,
    lastUpdated: ffUpdated,
    isRefreshing: ffRefreshing,
    refresh: ffRefresh,
    isTabActive: ffActive,
  } = useTournamentStatus();

  const { data: ffLeaderboard } = useGameLeaderboard("FREE_FIRE", currentCampusId);
  const { data: bgmiLeaderboard } = useGameLeaderboard("BGMI", currentCampusId);
  const { data: valLeaderboard } = useGameLeaderboard("VALORANT", currentCampusId);
  const { data: efLeaderboard } = useGameLeaderboard("EFOOTBALL", currentCampusId);
  const { data: matiksLeaderboard } = useGameLeaderboard("MATIKS", currentCampusId);
  const { data: awards } = useGameAwards(selectedGame, currentCampusId);

  const activeCampusMeta = CAMPUSES_REGISTRY[currentCampusId] || CAMPUSES_REGISTRY["mangalore"];

  // Determine current active leaderboard
  let first, second, third;

  const rawLeaderboard =
    selectedGame === "FREE_FIRE"
      ? ffLeaderboard
      : selectedGame === "BGMI"
      ? bgmiLeaderboard
      : selectedGame === "VALORANT"
      ? valLeaderboard
      : selectedGame === "EFOOTBALL"
      ? (efLeaderboard as any[])
      : (matiksLeaderboard as any[]);

  const currentLeaderboard = (rawLeaderboard || []).filter((t: any) => !t.hidden);

  const hasMatchesPlayed = Boolean(
    currentLeaderboard.length > 0 &&
      currentLeaderboard.some(
        (t) => (t.matchesPlayed && t.matchesPlayed > 0) || (t.totalPoints && t.totalPoints > 0)
      )
  );

  const currentGameConfig = GAMES_CONFIG[selectedGame];

  if (selectedGame === "FREE_FIRE") {
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
    } else if (hasMatchesPlayed && ffLeaderboard && ffLeaderboard.length >= 1) {
      first = ffLeaderboard[0]
        ? {
            rank: 1 as const,
            name: ffLeaderboard[0].teamName,
            subtext: "Free Fire 1st Place",
            stat1Value: ffLeaderboard[0].killPoints,
            stat1Label: "kill\npoints",
            stat2Value: ffLeaderboard[0].totalPoints,
            stat2Label: "total\npoints",
          }
        : undefined;
      second = ffLeaderboard[1]
        ? {
            rank: 2 as const,
            name: ffLeaderboard[1].teamName,
            subtext: "1st Runner-Up",
            stat1Value: ffLeaderboard[1].killPoints,
            stat1Label: "kill\npoints",
            stat2Value: ffLeaderboard[1].totalPoints,
            stat2Label: "total\npoints",
          }
        : undefined;
      third = ffLeaderboard[2]
        ? {
            rank: 3 as const,
            name: ffLeaderboard[2].teamName,
            subtext: "2nd Runner-Up",
            stat1Value: ffLeaderboard[2].killPoints,
            stat1Label: "kill\npoints",
            stat2Value: ffLeaderboard[2].totalPoints,
            stat2Label: "total\npoints",
          }
        : undefined;
    }
  } else if (selectedGame === "BGMI" && bgmiLeaderboard && bgmiLeaderboard.length >= 1) {
    first = bgmiLeaderboard[0]
      ? {
          rank: 1 as const,
          name: bgmiLeaderboard[0].teamName,
          subtext: "BGMI 1st Place",
          stat1Value: bgmiLeaderboard[0].killPoints,
          stat1Label: "kill\npoints",
          stat2Value: bgmiLeaderboard[0].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
    second = bgmiLeaderboard[1]
      ? {
          rank: 2 as const,
          name: bgmiLeaderboard[1].teamName,
          subtext: "1st Runner-Up",
          stat1Value: bgmiLeaderboard[1].killPoints,
          stat1Label: "kill\npoints",
          stat2Value: bgmiLeaderboard[1].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
    third = bgmiLeaderboard[2]
      ? {
          rank: 3 as const,
          name: bgmiLeaderboard[2].teamName,
          subtext: "2nd Runner-Up",
          stat1Value: bgmiLeaderboard[2].killPoints,
          stat1Label: "kill\npoints",
          stat2Value: bgmiLeaderboard[2].totalPoints,
          stat2Label: "total\npoints",
        }
      : undefined;
  } else if (selectedGame === "VALORANT" && hasMatchesPlayed && valLeaderboard && valLeaderboard.length >= 1) {
    first = valLeaderboard[0]
      ? {
          rank: 1 as const,
          name: valLeaderboard[0].teamName,
          subtext: "Valorant Champion",
          stat1Value: valLeaderboard[0].matchesPlayed,
          stat1Label: "matches\nplayed",
          stat2Value: valLeaderboard[0].totalPoints,
          stat2Label: "placement\npoints",
        }
      : undefined;
    second = valLeaderboard[1]
      ? {
          rank: 2 as const,
          name: valLeaderboard[1].teamName,
          subtext: "1st Runner-Up",
          stat1Value: valLeaderboard[1].matchesPlayed,
          stat1Label: "matches\nplayed",
          stat2Value: valLeaderboard[1].totalPoints,
          stat2Label: "placement\npoints",
        }
      : undefined;
    third = valLeaderboard[2]
      ? {
          rank: 3 as const,
          name: valLeaderboard[2].teamName,
          subtext: "2nd Runner-Up",
          stat1Value: valLeaderboard[2].matchesPlayed,
          stat1Label: "matches\nplayed",
          stat2Value: valLeaderboard[2].totalPoints,
          stat2Label: "placement\npoints",
        }
      : undefined;
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
          stat1Value: matiksLeaderboard[0].matchesPlayed,
          stat1Label: "rounds\nplayed",
          stat2Value: matiksLeaderboard[0].totalPoints,
          stat2Label: "matrix\nscore",
        }
      : undefined;
    second = matiksLeaderboard[1]
      ? {
          rank: 2 as const,
          name: matiksLeaderboard[1].teamName,
          subtext: "1st Runner-Up",
          stat1Value: matiksLeaderboard[1].matchesPlayed,
          stat1Label: "rounds\nplayed",
          stat2Value: matiksLeaderboard[1].totalPoints,
          stat2Label: "matrix\nscore",
        }
      : undefined;
    third = matiksLeaderboard[2]
      ? {
          rank: 3 as const,
          name: matiksLeaderboard[2].teamName,
          subtext: "2nd Runner-Up",
          stat1Value: matiksLeaderboard[2].matchesPlayed,
          stat1Label: "rounds\nplayed",
          stat2Value: matiksLeaderboard[2].totalPoints,
          stat2Label: "matrix\nscore",
        }
      : undefined;
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

  useEffect(() => {
    setMounted(true);
    const syncFullscreen = () => setIsProjectorMode(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const games = [
    { id: "FREE_FIRE" as const, label: "Free Fire", icon: Flame },
    { id: "BGMI" as const, label: "BGMI", icon: Crosshair },
    { id: "VALORANT" as const, label: "Valorant", icon: Target },
    { id: "EFOOTBALL" as const, label: "eFootball", icon: Gamepad2 },
    { id: "MATIKS" as const, label: "MATIKS", icon: Brain },
  ];
  const isLive = tournament?.status?.toLowerCase() === "live";

  return (
    <div className={isProjectorMode
      ? "dashboard dashboard-projector fixed inset-0 z-50 overflow-y-auto bg-[#f5f4f0] p-5 sm:p-10"
      : "dashboard mx-auto w-full max-w-6xl px-4 py-6 sm:px-7 sm:py-10"}>
      <section className="arena-hero relative overflow-hidden rounded-[24px] bg-[#17211e] text-white sm:rounded-[28px]" aria-labelledby="dashboard-title">
        <div className="arena-hero-grid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_250px] lg:gap-12 lg:p-11">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4cbc4]">
              <span className="inline-flex items-center gap-2 text-[#ff986b]"><span className="h-1.5 w-1.5 rounded-full bg-[#ff986b]" />NIAT Championship</span>
              <span className="text-white/20" aria-hidden="true">/</span><span>{activeCampusMeta.name} · 2026</span>
            </div>
            <h1 id="dashboard-title" className="text-[clamp(2.6rem,6vw,5rem)] font-black leading-[0.98] tracking-[-0.055em]">Championship<br /><span className="text-[#ff986b]">standings.</span></h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#bac5bd]">Every match. Every point. Follow the teams making their mark at the {activeCampusMeta.name} CLUTCH esports championship.</p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#d0d8d2]">
              <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#ff986b]" />{activeCampusMeta.university}, {activeCampusMeta.location}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-[#ff986b]" />{activeCampusMeta.editionDate}</span>
            </div>
          </div>
          <div className="hidden flex-col justify-between border-l border-white/15 pl-8 lg:flex">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                <span className={`h-1.5 w-1.5 rounded-full ${activeCampusMeta.status === "LIVE" ? "bg-[#a9dabe]" : "bg-[#ff986b]"}`} />
                {activeCampusMeta.status === "CONCLUDED" ? "Concluded · Official Standings" : "Live Arena Standings"}
              </div>
              <img src="/images/niat-logo.jpg" alt="NIAT" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
            </div>
            <div className="mt-7"><span className="text-5xl font-light leading-none tracking-[-0.06em]">05</span><p className="mt-2 text-xs text-[#bac5bd]">games. one championship.</p>
              <Link href="/winners" className="mt-6 inline-flex items-center gap-3 border-b border-[#ff986b]/50 pb-1.5 text-xs font-semibold text-[#ffb18d] transition hover:text-white">Meet the champions<ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="my-6 flex flex-col gap-4 border-b border-[#dddeda] pb-5 sm:my-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto pb-1" role="group" aria-label="Choose a game">
          {games.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={selectedGame === id} onClick={() => setSelectedGame(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${selectedGame === id ? "bg-[#17211e] text-white shadow-sm" : "text-[#68716b] hover:bg-white hover:text-[#17211e]"}`}>
            <Icon className={`h-4 w-4 ${selectedGame === id ? "text-[#ff986b]" : "text-[#8d958f]"}`} />{label}
          </button>)}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={toggleProjector} aria-pressed={isProjectorMode} className="inline-flex items-center gap-2 rounded-xl border border-[#dddeda] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#3f4b43] transition hover:border-[#829187]">
            {isProjectorMode ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}{isProjectorMode ? "Exit projector" : "Projector mode"}
          </button>{!isProjectorMode && <ShareModal label="Share" />}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6552]">The leaderboard</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#17211e] sm:text-3xl">{currentGameConfig.name}<span className="ml-3 align-middle text-xs font-medium tracking-normal text-[#7d867f]">{currentLeaderboard.length} {selectedGame === "MATIKS" || selectedGame === "EFOOTBALL" ? "players" : "teams"}</span></h2></div>
        <button type="button" onClick={ffRefresh} disabled={ffRefreshing} aria-label="Refresh tournament status" className="inline-flex items-center gap-2 text-[11px] font-medium text-[#69766d] transition hover:text-[#17211e] disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${ffRefreshing ? "animate-spin" : ""}`} />{ffRefreshing ? "Refreshing…" : ffActive ? "Auto-updating" : "Updates paused"}<span className="hidden sm:inline">{mounted ? `· ${ffUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
        </button>
      </div>
      {first ? (
        <Podium first={first} second={second} third={third} isProjector={isProjectorMode} />
      ) : (
        <PreMatchShowcase
          gameName={currentGameConfig.name}
          teamCount={currentLeaderboard.length}
          format={currentGameConfig.format}
          isProjector={isProjectorMode}
          campusName={activeCampusMeta.name}
          university={activeCampusMeta.university}
        />
      )}
      <section className="mt-7 rounded-[22px] border border-[#e0e3dc] bg-white p-4 shadow-[0_4px_24px_-16px_rgba(23,33,30,0.18)] sm:p-6" aria-label={`${currentGameConfig.name} standings`}>
        <div className="mb-5 flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-[#17211e]">Overall standings</h3><span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-[#7d867f]"><ShieldCheck className="h-3.5 w-3.5" />Verified results</span></div>
        <LeaderboardTable entries={currentLeaderboard} gameName={currentGameConfig.name} isProjector={isProjectorMode} />
      </section>
      {selectedGame === "FREE_FIRE" && <div className="dashboard-awards mt-7"><SpecialAwardsCard awards={awards} isProjector={isProjectorMode} /></div>}
      <div className="mt-9 flex flex-col justify-between gap-2 border-t border-[#dddeda] pt-5 text-[10px] text-[#7d867f] sm:flex-row">
        <span>CLUTCH / NIAT Esports Championship 2026</span>
        <span>Official standings · {activeCampusMeta.name}</span>
      </div>
    </div>
  );
}
