"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Target,
  Zap,
  Swords,
  MapPin,
  Clock,
  Radio,
  Flame,
  Crosshair,
  Gamepad2,
  Brain,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GameId } from "@/types";
import { INITIAL_TEAMS } from "@/lib/tournament-constants";

interface PreMatchShowcaseProps {
  gameId?: GameId | string;
  gameName?: string;
  teamCount?: number;
  format?: string;
  contenders?: string[];
  isProjector?: boolean;
  className?: string;
}

export function PreMatchShowcase({
  gameId = "FREE_FIRE",
  gameName = "Championship",
  teamCount = 0,
  format = "Official Tournament Stage",
  contenders = [],
  isProjector = false,
  className,
}: PreMatchShowcaseProps) {
  const [timeString, setTimeString] = useState<string>("");
  const [showAllContenders, setShowAllContenders] = useState(false);

  // Fallback to official seeds from INITIAL_TEAMS if contenders not passed
  const resolvedGameKey = (gameId as GameId) || "FREE_FIRE";
  const roster =
    contenders.length > 0
      ? contenders
      : (INITIAL_TEAMS[resolvedGameKey] || []);
  const actualCount = teamCount > 0 ? teamCount : roster.length;

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        setTimeString(
          now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        );
      } catch {
        setTimeString("09:00:00 AM IST");
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme styling based on game
  const normalizedKey = gameId?.toUpperCase() || "FREE_FIRE";
  let theme = {
    accentText: "text-amber-400",
    accentBorder: "border-amber-500/40",
    glowGradient: "from-amber-500/15 via-orange-950/50 to-slate-950",
    beaconBg: "bg-amber-400",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-500/10",
    icon: Flame,
    stageTag: "SURVIVAL ARENA",
    formatSubtext: "4 Bermuda / Purgatory Matches • Placement + Kills",
  };

  if (normalizedKey.includes("BGMI")) {
    theme = {
      accentText: "text-sky-400",
      accentBorder: "border-sky-500/40",
      glowGradient: "from-sky-500/15 via-blue-950/50 to-slate-950",
      beaconBg: "bg-sky-400",
      badgeBorder: "border-sky-500/30",
      badgeBg: "bg-sky-500/10",
      icon: Crosshair,
      stageTag: "TACTICAL BATTLEGROUNDS",
      formatSubtext: "Point Rush System • Placement + Kills",
    };
  } else if (normalizedKey.includes("VALORANT")) {
    theme = {
      accentText: "text-rose-400",
      accentBorder: "border-rose-500/40",
      glowGradient: "from-rose-500/15 via-red-950/50 to-slate-950",
      beaconBg: "bg-rose-400",
      badgeBorder: "border-rose-500/30",
      badgeBg: "bg-rose-500/10",
      icon: Target,
      stageTag: "RADIANT STRIKE PROTOCOL",
      formatSubtext: "5v5 Bracket Placement • 1st: 10pts, 2nd: 6pts",
    };
  } else if (normalizedKey.includes("EFOOTBALL") || normalizedKey.includes("FIFA")) {
    theme = {
      accentText: "text-emerald-400",
      accentBorder: "border-emerald-500/40",
      glowGradient: "from-emerald-500/15 via-teal-950/50 to-slate-950",
      beaconBg: "bg-emerald-400",
      badgeBorder: "border-emerald-500/30",
      badgeBg: "bg-emerald-500/10",
      icon: Gamepad2,
      stageTag: "VIRTUAL PITCH ARENA",
      formatSubtext: "1v1 Exhibition Knockouts • Goals & Head-to-Head",
    };
  } else if (normalizedKey.includes("MATIKS")) {
    theme = {
      accentText: "text-purple-400",
      accentBorder: "border-purple-500/40",
      glowGradient: "from-purple-500/15 via-fuchsia-950/50 to-slate-950",
      beaconBg: "bg-purple-400",
      badgeBorder: "border-purple-500/30",
      badgeBg: "bg-purple-500/10",
      icon: Brain,
      stageTag: "NEURAL SPEED MATRIX",
      formatSubtext: "Precision Velocity Rounds • Matrix Score",
    };
  }

  const GameIcon = theme.icon;
  const visibleRoster = showAllContenders || isProjector ? roster : roster.slice(0, 8);

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto py-2 transition-all animate-in fade-in duration-500",
        isProjector && "max-w-5xl py-4",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl transition-all",
          theme.accentBorder,
          theme.glowGradient
        )}
      >
        {/* Esports Corner Framing Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl pointer-events-none" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80 text-xs">
          {/* Pulsing Live Arena Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider text-[11px] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>ARENA LIVE • STAGE 1 UNDERWAY</span>
          </div>

          {/* Mangalore Live Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono text-[11px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeString || "Mangalore, IN"}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">IST</span>
          </div>

          {/* Cloud Verified Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Referee Portal Active</span>
          </div>
        </div>

        {/* Game Title with Dynamic Icon */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs font-black uppercase tracking-widest mb-3">
          <GameIcon className={cn("w-4 h-4", theme.accentText)} />
          <span className={theme.accentText}>{theme.stageTag}</span>
        </div>

        <h2
          className={cn(
            "text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase font-display leading-tight",
            isProjector && "text-3xl md:text-5xl"
          )}
        >
          {gameName} Opening Round
        </h2>

        {/* Clear Broadcast Explanation */}
        <p
          className={cn(
            "text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed font-medium",
            isProjector && "text-sm sm:text-base max-w-2xl"
          )}
        >
          Match 1 is currently in combat on stage. The 3-tier championship podium and live ranking tables will unveil immediately upon official referee submission and verification.
        </p>

        {/* 4-Step Match Lifecycle Stepper */}
        <div className="my-6 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-left">
            {/* Step 1: Lobby Locked */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">PHASE 01</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-white">Lobby Locked</div>
              <div className="text-[10px] text-emerald-400 font-medium">All Contenders In</div>
            </div>

            {/* Step 2: Match 1 Live */}
            <div className="p-3 rounded-xl bg-slate-900/90 border-2 border-amber-500/60 shadow-md relative overflow-hidden">
              <div className="absolute top-1 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-amber-400">PHASE 02</span>
              </div>
              <div className="text-xs font-bold text-amber-300">Match 1 Live</div>
              <div className="text-[10px] text-slate-300 font-medium">Combat in Progress</div>
            </div>

            {/* Step 3: Referee Review */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-500">PHASE 03</span>
                <Activity className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-xs font-bold text-slate-300">Referee Review</div>
              <div className="text-[10px] text-slate-500 font-medium">Admin Code #43517</div>
            </div>

            {/* Step 4: Podium Reveal */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-500">PHASE 04</span>
                <Trophy className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-xs font-bold text-slate-300">Podium Live</div>
              <div className="text-[10px] text-slate-500 font-medium">Auto-Reveals Standings</div>
            </div>
          </div>
        </div>

        {/* Contender Roster Preview Grid */}
        {roster.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Contenders in Stage Lobby ({actualCount} Teams)</span>
              </div>

              {!isProjector && roster.length > 8 && (
                <button
                  onClick={() => setShowAllContenders(!showAllContenders)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  <span>{showAllContenders ? "Show Less" : `View All ${roster.length} Squads`}</span>
                  {showAllContenders ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-left">
              {visibleRoster.map((name, idx) => (
                <div
                  key={name}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-1.5 truncate pr-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate font-semibold text-slate-200 text-[11px] sm:text-xs">
                      {name}
                    </span>
                  </div>
                  <span className="relative flex h-1.5 w-1.5 shrink-0" title="Ready in Lobby">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                </div>
              ))}
            </div>

            {!showAllContenders && !isProjector && roster.length > 8 && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setShowAllContenders(true)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  + {roster.length - 8} more contenders ready in lobby
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feature Badges Footer */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 shadow-xs">
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>{format}</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Instant Cloud Sync</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yenepoya University, Mangalore</span>
          </div>
        </div>
      </div>
    </div>
  );
}
