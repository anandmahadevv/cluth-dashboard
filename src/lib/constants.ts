import { GameConfig, GameId } from "@/types";

export const EVENT_DETAILS = {
  brand: "CLUTCH",
  name: "CLUTCH",
  title: "NIAT E-Sports Championship",
  edition: "Mangalore Edition",
  fullName: "CLUTCH – NIAT E-Sports Championship, Mangalore Edition",
  venue: "Yenepoya University, Mangalore",
  date: "2026-11-15",
  dateDisplay: "15 November 2026",
  dateFormatted: "15 November 2026",
  targetDateISO: "2026-11-15T09:00:00+05:30",
  tagline: "The Pinnacle of Collegiate E-Sports in Coastal Karnataka",
  organizer: "NIAT in association with Yenepoya University",
  description:
    "Official public broadcast companion for CLUTCH 2026. Real-time verified leaderboards, live match results, and Super Admin-approved standings for Free Fire, BGMI, FIFA, and MATIKS.",
};

export const GAMES_CONFIG: Record<GameId, GameConfig> = {
  FREE_FIRE: {
    id: "FREE_FIRE",
    name: "Free Fire",
    slug: "free-fire",
    badge: "BATTLE ROYALE",
    tagline: "48 Survivors • Fast-Paced Tactical Survival",
    genre: "Battle Royale (Squad)",
    format: "Squads (4 Players) • 4 Erangel/Bermuda Matches",
    color: "#f59e0b", // Amber / Flame Orange
    accentGlow: "rgba(245, 158, 11, 0.35)",
    bgGradient: "from-amber-950/40 via-zinc-900/60 to-black",
    bannerImage: "/images/freefire-banner.jpg",
    rulesOverview:
      "Official 10-point scoring matrix. Points awarded for rank placement + 1 kill point per confirmed elimination.",
    scoringFormat: "Placement Points + Kill Points",
  },
  BGMI: {
    id: "BGMI",
    name: "BGMI",
    slug: "bgmi",
    badge: "BATTLE ROYALE",
    tagline: "Battlegrounds Mobile India • Tactical Supremacy",
    genre: "Tactical Battle Royale (Squad)",
    format: "Squads (4 Players) • Point Rush System",
    color: "#3b82f6", // Electric Blue
    accentGlow: "rgba(59, 130, 246, 0.35)",
    bgGradient: "from-blue-950/40 via-zinc-900/60 to-black",
    bannerImage: "/images/bgmi-banner.jpg",
    rulesOverview:
      "Standard BGIS/BMSD scoring matrix. Rank 1 receives 10 pts, Rank 2 receives 6 pts, down to 0, plus 1 point per kill.",
    scoringFormat: "Placement Points + Kill Points",
  },
  FIFA: {
    id: "FIFA",
    name: "FIFA",
    slug: "fifa",
    badge: "CONSOLE 1v1",
    tagline: "Precision Virtual Football • Knockout Tournament",
    genre: "Sports Simulation (1v1)",
    format: "1v1 Matches • Single Elimination Bracket",
    color: "#10b981", // Emerald Green / Pitch
    accentGlow: "rgba(16, 185, 129, 0.35)",
    bgGradient: "from-emerald-950/40 via-zinc-900/60 to-black",
    bannerImage: "/images/fifa-banner.jpg",
    rulesOverview:
      "Standard 12-minute halves (6 mins real-time). Draw rule: Extra time followed by penalty shootout in knockout stages.",
    scoringFormat: "Goals Scored • Head-to-Head W/D/L",
  },
  MATIKS: {
    id: "MATIKS",
    name: "MATIKS",
    slug: "matiks",
    badge: "STRATEGY & SPEED",
    tagline: "Mathematical Speed, Spatial Logic & Competitive Gaming",
    genre: "Esports Logic & Speed Challenge",
    format: "Multi-Round Speed & Precision Knockouts",
    color: "#a855f7", // Electric Purple
    accentGlow: "rgba(168, 85, 247, 0.35)",
    bgGradient: "from-purple-950/40 via-zinc-900/60 to-black",
    bannerImage: "/images/matiks-banner.jpg",
    rulesOverview:
      "Scoring calculated via the official tournament accuracy vs. speed coefficient. Configured dynamically from approved admin rules.",
    scoringFormat: "Accuracy & Velocity Matrix Score",
  },
};

export const API_ENDPOINTS = {
  games: "/public/games",
  results: "/public/results",
  resultsByGame: (game: string) => `/public/results/${game}`,
  leaderboardsByGame: (game: string) => `/public/leaderboards/${game}`,
  matchesByGame: (game: string) => `/public/matches/${game}`,
  winners: "/public/winners",
  tournamentStatus: "/public/tournament-status",
};

export const POLLING_INTERVAL_MS = 8000; // 8 seconds default

export const TOURNAMENT = EVENT_DETAILS;
export const GAMES = GAMES_CONFIG;
export const POLLING_INTERVAL = POLLING_INTERVAL_MS;

