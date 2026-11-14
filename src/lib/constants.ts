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
    "Official public broadcast companion for CLUTCH 2026. Real-time verified leaderboards, live match results, and Super Admin-approved standings for Free Fire, BGMI, Valorant, eFootball, and MATIKS.",
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
      "Official 12-point scoring matrix. Points awarded for rank placement + 1 kill point per confirmed elimination.",
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
      "Standard 15-point scoring matrix. Rank 1 receives 15 pts, Rank 2 receives 12 pts, down to 0, plus 1 point per kill.",
    scoringFormat: "Placement Points + Kill Points",
  },
  VALORANT: {
    id: "VALORANT",
    name: "Valorant",
    slug: "valorant",
    badge: "TACTICAL 5v5 FPS",
    tagline: "Defy the Limits • Precision Gunplay & Tactical Abilities",
    genre: "Character-Based Tactical Shooter (5v5)",
    format: "5v5 Squads • Spike Rush / Standard Tournament Bracket",
    color: "#ef4444", // Crimson Red
    accentGlow: "rgba(239, 68, 68, 0.35)",
    bgGradient: "from-rose-950/40 via-zinc-900/60 to-black",
    bannerImage: "/images/valorant-banner.jpg",
    rulesOverview:
      "Matches scored strictly by bracket placement finish: 1st Place = 10 pts, 2nd Place = 6 pts, 3rd Place = 4 pts, 4th Place = 2 pts, 5th–8th = 1 pt each.",
    scoringFormat: "Placement Points Only (1st: 10pts, 2nd: 6pts, 3rd: 4pts, 4th: 2pts, 5-8th: 1pt)",
  },
  EFOOTBALL: {
    id: "EFOOTBALL",
    name: "eFootball",
    slug: "efootball",
    badge: "CONSOLE 1v1",
    tagline: "Precision Virtual Football • Championship Knockout",
    genre: "Sports Football Simulation (1v1)",
    format: "1v1 Matches • Single Elimination Bracket",
    color: "#10b981", // Pitch Green
    accentGlow: "rgba(16, 185, 129, 0.35)",
    bgGradient: "from-emerald-950/40 via-zinc-900/60 to-black",
    bannerImage: "/images/fifa-banner.jpg",
    rulesOverview:
      "Standard 10-minute exhibition matches. Draw rule: Extra time followed by penalty shootout in knockout stages. 10 pts for 1st place.",
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
      "Scoring calculated via accuracy and speed solving rounds. 10 pts for 1st place, plus bonus challenge points.",
    scoringFormat: "Accuracy & Velocity Matrix Score",
  },
};

export const API_ENDPOINTS = {
  games: "/api/public/games",
  results: "/api/public/results",
  resultsByGame: (game: string) => `/api/public/results/${game}`,
  leaderboardsByGame: (game: string) => `/api/public/leaderboards/${game}`,
  matchesByGame: (game: string) => `/api/public/matches/${game}`,
  winners: "/api/public/winners",
  tournamentStatus: "/api/public/tournament-status",
};

export const POLLING_INTERVAL_MS = 3000; // 3 seconds fast live polling

export const TOURNAMENT = EVENT_DETAILS;
export const GAMES = GAMES_CONFIG;
export const POLLING_INTERVAL = POLLING_INTERVAL_MS;

