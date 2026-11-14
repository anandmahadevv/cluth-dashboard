import fs from "fs";
import path from "path";
import { GameId } from "@/types";
import {
  VALID_GAME_CODES,
  PLACEMENT_POINTS,
  INITIAL_TEAMS,
  ADMIN_PASSWORDS,
} from "./tournament-constants";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  status: SubmissionStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
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
export function verifyGameCode(code: string, targetGame?: GameId): { valid: boolean; gameId?: GameId; isSuperAdmin?: boolean; error?: string } {
  const trimmed = (code || "").trim();
  const assigned = VALID_GAME_CODES[trimmed];

  if (!assigned) {
    return { valid: false, error: "Invalid verification code. Please check with Tournament Super Admin." };
  }

  if (assigned === "ALL") {
    return { valid: true, gameId: targetGame || "FREE_FIRE", isSuperAdmin: true };
  }

  if (targetGame && assigned !== targetGame) {
    return { valid: false, error: `This code is assigned to ${assigned}, not ${targetGame}.` };
  }

  return { valid: true, gameId: assigned, isSuperAdmin: false };
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
 * Get matches for a game (default: approved only for public display)
 */
export function getGameMatches(gameId?: GameId, approvedOnly = true): MatchSubmission[] {
  const store = getStore();
  return store.matches.filter((m) => {
    if (gameId && m.gameId !== gameId) return false;
    if (approvedOnly && m.status && m.status !== "APPROVED") return false;
    return true;
  });
}

/**
 * Verify Super Admin Security Password
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const trimmed = password.trim();
  return ADMIN_PASSWORDS.some((p) => p.toLowerCase() === trimmed.toLowerCase());
}

/**
 * Process a match submission from a verified POC or Super Admin
 * - If submitted by POC: marked as PENDING (does NOT alter public leaderboard until Super Admin approves)
 * - If submitted by Super Admin or autoApprove is true: marked as APPROVED & immediately broadcasts to leaderboard
 */
export function recordMatchSubmission(params: {
  gameId: GameId;
  pocCode: string;
  matchNumber: number | string;
  proofUrl: string;
  notes?: string;
  autoApprove?: boolean;
  teamResults: {
    teamId: string;
    placement: number;
    placementPoints?: number;
    kills?: number;
  }[];
}): { success: boolean; pending?: boolean; submissionId?: string; leaderboard?: TeamScoreEntry[]; message?: string; error?: string } {
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

  // Calculate detailed points for each team
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

    detailedResults.push({
      teamId: team.id,
      teamName: team.teamName,
      placement: res.placement,
      placementPoints: placementPts,
      kills: kills,
      matchPoints: matchPoints,
    });
  });

  const shouldApprove = !!auth.isSuperAdmin || params.autoApprove === true;
  const status: SubmissionStatus = shouldApprove ? "APPROVED" : "PENDING";

  if (shouldApprove) {
    // Apply scores to teams immediately
    detailedResults.forEach((res) => {
      const team = teams.find((t) => t.id === res.teamId);
      if (!team) return;

      team.matchesPlayed += 1;
      team.placementPoints += res.placementPoints;
      team.killPoints += res.kills;
      team.totalPoints += res.matchPoints;
      team.lastMatchRank = res.placement;
    });

    // Re-rank teams
    store.teams[params.gameId] = getGameLeaderboard(params.gameId);
  }

  // Add submission record
  const matchEntry: MatchSubmission = {
    id: `SUB-${params.gameId.substring(0, 2)}-${Date.now()}`,
    gameId: params.gameId,
    matchNumber: params.matchNumber,
    timestamp: new Date().toISOString(),
    pocCode: params.pocCode,
    proofUrl: params.proofUrl,
    notes: params.notes || "",
    status: status,
    reviewedAt: shouldApprove ? new Date().toISOString() : undefined,
    reviewedBy: shouldApprove ? "SuperAdmin" : undefined,
    teamResults: detailedResults,
  };

  store.matches.unshift(matchEntry);
  saveStore(store);

  if (shouldApprove) {
    return {
      success: true,
      pending: false,
      submissionId: matchEntry.id,
      leaderboard: store.teams[params.gameId],
      message: `Match ${params.matchNumber} results approved and broadcast live to leaderboard!`,
    };
  }

  return {
    success: true,
    pending: true,
    submissionId: matchEntry.id,
    message: `Match ${params.matchNumber} results submitted! Awaiting Super Admin review and publishing.`,
  };
}

/**
 * Super Admin review action: APPROVE or REJECT a submission
 */
export function reviewMatchSubmission(params: {
  submissionId: string;
  action: "APPROVE" | "REJECT";
  adminPassword: string;
  rejectionReason?: string;
}): { success: boolean; match?: MatchSubmission; leaderboard?: TeamScoreEntry[]; error?: string } {
  if (!verifyAdminPassword(params.adminPassword)) {
    return { success: false, error: "Invalid Super Admin password. Access denied." };
  }

  const store = getStore();
  const match = store.matches.find((m) => m.id === params.submissionId);
  if (!match) {
    return { success: false, error: "Submission not found." };
  }

  if (params.action === "APPROVE") {
    // Only apply points if not already approved
    if (match.status !== "APPROVED") {
      const teams = store.teams[match.gameId];
      if (teams) {
        match.teamResults.forEach((res) => {
          const team = teams.find((t) => t.id === res.teamId);
          if (team) {
            team.matchesPlayed += 1;
            team.placementPoints += res.placementPoints;
            team.killPoints += res.kills;
            team.totalPoints += res.matchPoints;
            team.lastMatchRank = res.placement;
          }
        });
        store.teams[match.gameId] = getGameLeaderboard(match.gameId);
      }
    }

    match.status = "APPROVED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = "SuperAdmin";
    saveStore(store);

    return {
      success: true,
      match,
      leaderboard: store.teams[match.gameId],
    };
  } else {
    // REJECT action: if it was previously approved, revert points
    if (match.status === "APPROVED") {
      const teams = store.teams[match.gameId];
      if (teams) {
        match.teamResults.forEach((res) => {
          const team = teams.find((t) => t.id === res.teamId);
          if (team) {
            team.matchesPlayed = Math.max(0, team.matchesPlayed - 1);
            team.placementPoints = Math.max(0, team.placementPoints - res.placementPoints);
            team.killPoints = Math.max(0, team.killPoints - res.kills);
            team.totalPoints = Math.max(0, team.totalPoints - res.matchPoints);
          }
        });
        store.teams[match.gameId] = getGameLeaderboard(match.gameId);
      }
    }

    match.status = "REJECTED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = "SuperAdmin";
    match.rejectionReason = params.rejectionReason || "Submission rejected by Super Admin.";
    saveStore(store);

    return { success: true, match };
  }
}

/**
 * Get all match submissions (pending, approved, rejected)
 */
export function getAllSubmissions(options?: {
  gameId?: GameId;
  status?: SubmissionStatus | "ALL";
}): MatchSubmission[] {
  const store = getStore();
  return store.matches.filter((m) => {
    if (options?.gameId && m.gameId !== options.gameId) return false;
    if (options?.status && options.status !== "ALL" && m.status !== options.status) return false;
    return true;
  });
}

/**
 * Reset scores for a single game or all games back to 0 (Super Admin Only)
 */
export function resetGameScores(code: string, targetGame?: GameId | "ALL"): { success: boolean; error?: string } {
  const auth = verifyGameCode(code);
  if (!auth.valid || !auth.isSuperAdmin) {
    return { success: false, error: "Unauthorized. Super Admin code (e.g. 43517) is required to reset." };
  }

  const store = getStore();
  const initial = createInitialStoreData();

  if (!targetGame || targetGame === "ALL") {
    store.teams = initial.teams;
    store.matches = [];
  } else {
    store.teams[targetGame] = initial.teams[targetGame];
    store.matches = store.matches.filter((m) => m.gameId !== targetGame);
  }

  saveStore(store);
  return { success: true };
}
