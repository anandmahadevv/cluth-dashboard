import fs from "fs";
import path from "path";
import { GameId } from "@/types";
import {
  VALID_GAME_CODES,
  PLACEMENT_POINTS,
  INITIAL_TEAMS,
} from "./tournament-constants";

export interface TeamScoreEntry {
  id: string;
  teamName: string;
  gameId: GameId;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  rank: number;
  lastMatchRank?: number;
}

export interface MatchSubmission {
  id: string;
  gameId: GameId;
  matchNumber: number | string;
  timestamp: string;
  pocCode: string;
  proofUrl: string;
  notes?: string;
  teamResults: {
    teamId: string;
    teamName: string;
    placement: number;
    placementPoints: number;
    kills: number;
    matchPoints: number;
  }[];
}

export interface TournamentStoreData {
  lastUpdated: string;
  teams: Record<GameId, TeamScoreEntry[]>;
  matches: MatchSubmission[];
}

// On Vercel serverless functions, root (/var/task) is read-only. /tmp is the writable scratch space.
const DATA_FILE_PATH = process.env.VERCEL
  ? path.join("/tmp", "tournament-data.json")
  : path.join(process.cwd(), "data", "tournament-data.json");

const SEED_FILE_PATH = path.join(process.cwd(), "data", "tournament-data.json");

let inMemoryStore: TournamentStoreData | null = null;

function createInitialStoreData(): TournamentStoreData {
  const teamsMap: Record<GameId, TeamScoreEntry[]> = {
    FREE_FIRE: [],
    BGMI: [],
    FIFA: [],
    MATIKS: [],
  };

  (Object.keys(INITIAL_TEAMS) as GameId[]).forEach((gameId) => {
    teamsMap[gameId] = INITIAL_TEAMS[gameId].map((name, index) => ({
      id: `${gameId.toLowerCase()}-${index + 1}`,
      teamName: name,
      gameId,
      matchesPlayed: 0,
      placementPoints: 0,
      killPoints: 0,
      totalPoints: 0,
      rank: index + 1,
    }));
  });

  return {
    lastUpdated: new Date().toISOString(),
    teams: teamsMap,
    matches: [],
  };
}

/**
 * Load store data from memory, disk, or bundled seed
 */
export function getStore(): TournamentStoreData {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      inMemoryStore = JSON.parse(raw);
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn("Could not read from DATA_FILE_PATH, attempting seed", err);
  }

  // Fallback to bundled seed file if exists
  try {
    if (fs.existsSync(SEED_FILE_PATH)) {
      const raw = fs.readFileSync(SEED_FILE_PATH, "utf-8");
      inMemoryStore = JSON.parse(raw);
      saveStore(inMemoryStore!);
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn("Could not read from SEED_FILE_PATH", err);
  }

  const initial = createInitialStoreData();
  inMemoryStore = initial;
  saveStore(initial);
  return initial;
}

/**
 * Persist store data to disk atomically (and update memory cache)
 */
export function saveStore(data: TournamentStoreData) {
  inMemoryStore = data;
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: Disk write failed, running in-memory for this serverless instance.", err);
  }
}

/**
 * Verify Game POC Code
 */
export function verifyGameCode(code: string, targetGame?: GameId): { valid: boolean; gameId?: GameId; error?: string } {
  const trimmed = (code || "").trim();
  const assigned = VALID_GAME_CODES[trimmed];

  if (!assigned) {
    return { valid: false, error: "Invalid verification code. Please check with Tournament Super Admin." };
  }

  if (assigned === "ALL") {
    return { valid: true, gameId: targetGame || "FREE_FIRE" };
  }

  if (targetGame && assigned !== targetGame) {
    return { valid: false, error: `This code is assigned to ${assigned}, not ${targetGame}.` };
  }

  return { valid: true, gameId: assigned };
}

/**
 * Get sorted leaderboard for a specific game
 */
export function getGameLeaderboard(gameId: GameId): TeamScoreEntry[] {
  const store = getStore();
  const list = store.teams[gameId] || [];

  // Sort by total points desc, placement points desc, kill points desc
  const sorted = [...list].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
    return b.killPoints - a.killPoints;
  });

  return sorted.map((t, idx) => ({ ...t, rank: idx + 1 }));
}

/**
 * Get matches for a game
 */
export function getGameMatches(gameId?: GameId): MatchSubmission[] {
  const store = getStore();
  if (!gameId) return store.matches;
  return store.matches.filter((m) => m.gameId === gameId);
}

/**
 * Process a match submission from a verified POC
 */
export function recordMatchSubmission(params: {
  gameId: GameId;
  pocCode: string;
  matchNumber: number | string;
  proofUrl: string;
  notes?: string;
  teamResults: {
    teamId: string;
    placement: number;
    placementPoints?: number;
    kills?: number;
  }[];
}): { success: boolean; leaderboard?: TeamScoreEntry[]; error?: string } {
  const auth = verifyGameCode(params.pocCode, params.gameId);
  if (!auth.valid) {
    return { success: false, error: auth.error };
  }

  const store = getStore();
  const teams = store.teams[params.gameId];
  if (!teams || teams.length === 0) {
    return { success: false, error: "No teams configured for this game." };
  }

  const detailedResults: MatchSubmission["teamResults"] = [];

  // Apply scores to teams
  params.teamResults.forEach((res) => {
    const team = teams.find((t) => t.id === res.teamId);
    if (!team) return;

    let placementPts = res.placementPoints || 0;
    const kills = res.kills || 0;

    // Auto-calculate placement points if not provided and game is Battle Royale
    if (params.gameId === "FREE_FIRE" || params.gameId === "BGMI") {
      const matrix = PLACEMENT_POINTS[params.gameId];
      if (res.placement >= 1 && res.placement <= matrix.length) {
        placementPts = matrix[res.placement - 1];
      }
    }

    const matchPoints = placementPts + kills;

    // Accumulate total team stats
    team.matchesPlayed += 1;
    team.placementPoints += placementPts;
    team.killPoints += kills;
    team.totalPoints += matchPoints;
    team.lastMatchRank = res.placement;

    detailedResults.push({
      teamId: team.id,
      teamName: team.teamName,
      placement: res.placement,
      placementPoints: placementPts,
      kills: kills,
      matchPoints: matchPoints,
    });
  });

  // Re-rank teams
  const ranked = getGameLeaderboard(params.gameId);
  store.teams[params.gameId] = ranked;

  // Add match submission record
  const matchEntry: MatchSubmission = {
    id: `MATCH-${params.gameId.substring(0, 2)}-${Date.now()}`,
    gameId: params.gameId,
    matchNumber: params.matchNumber,
    timestamp: new Date().toISOString(),
    pocCode: params.pocCode,
    proofUrl: params.proofUrl,
    notes: params.notes || "",
    teamResults: detailedResults,
  };

  store.matches.unshift(matchEntry);
  saveStore(store);

  return { success: true, leaderboard: ranked };
}
