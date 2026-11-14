import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GameId } from "@/types";
import {
  VALID_GAME_CODES,
  PLACEMENT_POINTS,
  INITIAL_TEAMS,
  ADMIN_PASSWORD_HASH,
} from "./tournament-constants";
import {
  fetchStoreFromSupabase,
  persistStoreToSupabase,
  isSupabaseConfigured,
} from "./supabase";

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
let lastFileReadTime = 0;
let lastSupabaseFetchTime = 0;
let pendingSupabaseFetch: Promise<TournamentStoreData | null> | null = null;
const SUPABASE_CACHE_TTL_MS = 2000; // 2 seconds in-memory deduplication cache

function createInitialStoreData(): TournamentStoreData {
  const teamsMap: Record<GameId, TeamScoreEntry[]> = {
    FREE_FIRE: [],
    BGMI: [],
    VALORANT: [],
    EFOOTBALL: [],
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
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const stats = fs.statSync(DATA_FILE_PATH);
      if (!inMemoryStore || stats.mtimeMs > lastFileReadTime) {
        const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        inMemoryStore = JSON.parse(raw);
        lastFileReadTime = stats.mtimeMs;
      }
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn("Could not read from DATA_FILE_PATH, attempting fallback", err);
  }

  if (inMemoryStore) {
    return inMemoryStore;
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
 * Load store data asynchronously (from Supabase if configured, falling back to disk/seed)
 * Optimized with 2s cache and promise deduplication to prevent redundant network round-trips
 */
export async function getStoreAsync(): Promise<TournamentStoreData> {
  if (isSupabaseConfigured()) {
    const now = Date.now();
    // 1. Fast path: return in-memory cache if fresh
    if (inMemoryStore && inMemoryStore.teams && (now - lastSupabaseFetchTime < SUPABASE_CACHE_TTL_MS)) {
      return inMemoryStore;
    }

    // 2. Promise deduplication: join in-flight request if one exists
    if (pendingSupabaseFetch) {
      try {
        const remote = await pendingSupabaseFetch;
        if (remote && remote.teams) return remote;
      } catch {}
    } else {
      pendingSupabaseFetch = (async () => {
        try {
          const remote = await fetchStoreFromSupabase();
          if (remote && remote.teams) {
            inMemoryStore = remote;
            lastSupabaseFetchTime = Date.now();
            try {
              const dir = path.dirname(DATA_FILE_PATH);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(remote, null, 2), "utf-8");
            } catch {}
            return remote;
          }
          return null;
        } finally {
          pendingSupabaseFetch = null;
        }
      })();

      try {
        const remote = await pendingSupabaseFetch;
        if (remote && remote.teams) return remote;
      } catch (err) {
        console.warn("Supabase fetch fallback to disk:", err);
      }
    }
  }

  return getStore();
}

/**
 * Persist store data to disk atomically (and update memory cache)
 */
export function saveStore(data: TournamentStoreData) {
  inMemoryStore = data;
  lastSupabaseFetchTime = Date.now();
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    const stats = fs.statSync(DATA_FILE_PATH);
    lastFileReadTime = stats.mtimeMs;
  } catch (err) {
    console.warn("Notice: Disk write failed, running in-memory for this serverless instance.", err);
  }
}

/**
 * Persist store data asynchronously (persisting to Supabase if configured + local disk)
 */
export async function saveStoreAsync(data: TournamentStoreData): Promise<void> {
  saveStore(data);
  if (isSupabaseConfigured()) {
    try {
      await persistStoreToSupabase(data);
    } catch (err) {
      console.warn("Supabase async persist error:", err);
    }
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
 * Helper to sort and rank teams in descending order of points and kills
 */
export function sortAndRankTeams(teams: TeamScoreEntry[]): TeamScoreEntry[] {
  const sorted = [...teams].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.placementPoints !== a.placementPoints) return b.placementPoints - a.placementPoints;
    return b.killPoints - a.killPoints;
  });

  return sorted.map((t, idx) => ({ ...t, rank: idx + 1 }));
}

/**
 * Get sorted leaderboard for a specific game
 */
export function getGameLeaderboard(gameId: GameId): TeamScoreEntry[] {
  const store = getStore();
  const list = store.teams[gameId] || [];
  return sortAndRankTeams(list);
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
 * Verify Super Admin Security Password via Constant-Time Cryptographic Hash Comparison
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const hash = crypto.createHash("sha256").update(password.trim()).digest("hex");
  return hash === ADMIN_PASSWORD_HASH;
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

    // Auto-calculate placement points based on game matrix
    const matrix = PLACEMENT_POINTS[params.gameId];
    if (matrix && res.placement >= 1 && res.placement <= matrix.length) {
      if (placementPts === 0) {
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
    store.teams[params.gameId] = sortAndRankTeams(teams);
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
/**
 * Helper to rollback points awarded by an approved match
 */
function rollbackMatchScores(store: TournamentStoreData, match: MatchSubmission) {
  if (match.status === "APPROVED") {
    const teams = store.teams[match.gameId];
    if (teams && match.teamResults) {
      match.teamResults.forEach((res) => {
        const team = teams.find((t) => t.id === res.teamId);
        if (team) {
          team.matchesPlayed = Math.max(0, team.matchesPlayed - 1);
          team.placementPoints = Math.max(0, team.placementPoints - res.placementPoints);
          team.killPoints = Math.max(0, team.killPoints - res.kills);
          team.totalPoints = Math.max(0, team.totalPoints - res.matchPoints);
        }
      });
      store.teams[match.gameId] = sortAndRankTeams(teams);
    }
  }
}

/**
 * Super Admin Review/Action on a submission: APPROVE, REJECT, UNDO (revert to pending), or DELETE
 */
export function reviewMatchSubmission(params: {
  submissionId: string;
  action: "APPROVE" | "REJECT" | "UNDO" | "DELETE";
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
    if (match.status !== "APPROVED") {
      const teams = store.teams[match.gameId];
      if (teams && match.teamResults) {
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
        store.teams[match.gameId] = sortAndRankTeams(teams);
      }
    }

    match.status = "APPROVED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = "SuperAdmin";
    match.rejectionReason = undefined;
    saveStore(store);

    return {
      success: true,
      match,
      leaderboard: store.teams[match.gameId],
    };
  } else if (params.action === "UNDO") {
    // Revert approved match back to PENDING and rollback points
    rollbackMatchScores(store, match);
    match.status = "PENDING";
    match.reviewedAt = undefined;
    match.reviewedBy = undefined;
    match.rejectionReason = undefined;
    saveStore(store);

    return {
      success: true,
      match,
      leaderboard: store.teams[match.gameId],
    };
  } else if (params.action === "DELETE") {
    // Permanently delete match and rollback points if approved
    rollbackMatchScores(store, match);
    const idx = store.matches.findIndex((m) => m.id === params.submissionId);
    if (idx !== -1) {
      store.matches.splice(idx, 1);
    }
    saveStore(store);

    return {
      success: true,
      leaderboard: store.teams[match.gameId],
    };
  } else {
    // REJECT action: rollback points if it was approved
    rollbackMatchScores(store, match);
    match.status = "REJECTED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = "SuperAdmin";
    match.rejectionReason = params.rejectionReason || "Submission rejected by Super Admin.";
    saveStore(store);

    return { success: true, match, leaderboard: store.teams[match.gameId] };
  }
}

/**
 * Get sorted leaderboard for a specific game (async)
 */
export async function getGameLeaderboardAsync(gameId: GameId): Promise<TeamScoreEntry[]> {
  const store = await getStoreAsync();
  const list = store.teams[gameId] || [];
  return sortAndRankTeams(list);
}

/**
 * Get matches for a game asynchronously
 */
export async function getGameMatchesAsync(gameId?: GameId, approvedOnly = true): Promise<MatchSubmission[]> {
  const store = await getStoreAsync();
  return store.matches.filter((m) => {
    if (gameId && m.gameId !== gameId) return false;
    if (approvedOnly && m.status && m.status !== "APPROVED") return false;
    return true;
  });
}

/**
 * Process a match submission from a verified POC or Super Admin (async with Supabase persistence)
 */
export async function recordMatchSubmissionAsync(params: {
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
}): Promise<{ success: boolean; pending?: boolean; submissionId?: string; leaderboard?: TeamScoreEntry[]; message?: string; error?: string }> {
  const auth = verifyGameCode(params.pocCode, params.gameId);
  if (!auth.valid) {
    return { success: false, error: auth.error };
  }

  const store = await getStoreAsync();
  const teams = store.teams[params.gameId];
  if (!teams || teams.length === 0) {
    return { success: false, error: "No teams configured for this game." };
  }

  const detailedResults: MatchSubmission["teamResults"] = [];

  params.teamResults.forEach((res) => {
    const team = teams.find((t) => t.id === res.teamId);
    if (!team) return;

    let placementPts = res.placementPoints || 0;
    const kills = res.kills || 0;

    // Auto-calculate placement points based on game matrix
    const matrix = PLACEMENT_POINTS[params.gameId];
    if (matrix && res.placement >= 1 && res.placement <= matrix.length) {
      if (placementPts === 0) {
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
    detailedResults.forEach((res) => {
      const team = teams.find((t) => t.id === res.teamId);
      if (!team) return;

      team.matchesPlayed += 1;
      team.placementPoints += res.placementPoints;
      team.killPoints += res.kills;
      team.totalPoints += res.matchPoints;
      team.lastMatchRank = res.placement;
    });

    store.teams[params.gameId] = sortAndRankTeams(teams);
  }

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
  await saveStoreAsync(store);

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
 * Super Admin review action: APPROVE, REJECT, UNDO, or DELETE a submission (async with Supabase persistence)
 */
export async function reviewMatchSubmissionAsync(params: {
  submissionId: string;
  action: "APPROVE" | "REJECT" | "UNDO" | "DELETE";
  adminPassword: string;
  rejectionReason?: string;
}): Promise<{ success: boolean; match?: MatchSubmission; leaderboard?: TeamScoreEntry[]; error?: string }> {
  if (!verifyAdminPassword(params.adminPassword)) {
    return { success: false, error: "Invalid Super Admin password. Access denied." };
  }

  const store = await getStoreAsync();
  const match = store.matches.find((m) => m.id === params.submissionId);
  if (!match) {
    return { success: false, error: "Submission not found." };
  }

  if (params.action === "APPROVE") {
    if (match.status !== "APPROVED") {
      const teams = store.teams[match.gameId];
      if (teams && match.teamResults) {
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
        store.teams[match.gameId] = sortAndRankTeams(teams);
      }
    }

    match.status = "APPROVED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = "SuperAdmin";
    match.rejectionReason = undefined;
    await saveStoreAsync(store);

    return {
      success: true,
      match,
      leaderboard: store.teams[match.gameId],
    };
  } else if (params.action === "UNDO") {
    // Rollback points and restore match status to PENDING
    rollbackMatchScores(store, match);
    match.status = "PENDING";
    match.reviewedAt = undefined;
    match.reviewedBy = undefined;
    match.rejectionReason = undefined;
    await saveStoreAsync(store);

    return {
      success: true,
      match,
      leaderboard: store.teams[match.gameId],
    };
  } else if (params.action === "DELETE") {
    // Rollback points if approved and remove match from store
    rollbackMatchScores(store, match);
    const idx = store.matches.findIndex((m) => m.id === params.submissionId);
    if (idx !== -1) {
      store.matches.splice(idx, 1);
    }
    await saveStoreAsync(store);

    return {
      success: true,
      leaderboard: store.teams[match.gameId],
    };
  } else {
    // REJECT action: rollback points if previously approved
    rollbackMatchScores(store, match);
    match.status = "REJECTED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = "SuperAdmin";
    match.rejectionReason = params.rejectionReason || "Submission rejected by Super Admin.";
    await saveStoreAsync(store);

    return { success: true, match, leaderboard: store.teams[match.gameId] };
  }
}

/**
 * Get all match submissions asynchronously
 */
export async function getAllSubmissionsAsync(options?: {
  gameId?: GameId;
  status?: SubmissionStatus | "ALL";
}): Promise<MatchSubmission[]> {
  const store = await getStoreAsync();
  return store.matches.filter((m) => {
    if (options?.gameId && m.gameId !== options.gameId) return false;
    if (options?.status && options.status !== "ALL" && m.status !== options.status) return false;
    return true;
  });
}

/**
 * Reset scores for a single game or all games back to 0 asynchronously
 */
export async function resetGameScoresAsync(code: string, targetGame?: GameId | "ALL"): Promise<{ success: boolean; error?: string }> {
  const auth = verifyGameCode(code);
  if (!auth.valid || !auth.isSuperAdmin) {
    return { success: false, error: "Unauthorized. Super Admin authorization is required to reset." };
  }

  const store = await getStoreAsync();
  const initial = createInitialStoreData();

  if (!targetGame || targetGame === "ALL") {
    store.teams = initial.teams;
    store.matches = [];
  } else {
    store.teams[targetGame] = initial.teams[targetGame];
    store.matches = store.matches.filter((m) => m.gameId !== targetGame);
  }

  await saveStoreAsync(store);
  return { success: true };
}

/**
 * Add a new team to a game arena
 */
export async function addTeamToGameAsync(params: {
  gameId: GameId;
  teamName: string;
  adminPassword?: string;
}): Promise<{ success: boolean; team?: TeamScoreEntry; teams?: TeamScoreEntry[]; error?: string }> {
  if (params.adminPassword && !verifyAdminPassword(params.adminPassword)) {
    return { success: false, error: "Unauthorized: Invalid Super Admin password." };
  }

  const name = (params.teamName || "").trim();
  if (!name) {
    return { success: false, error: "Team name cannot be empty." };
  }

  const store = await getStoreAsync();
  const currentTeams = store.teams[params.gameId] || [];

  if (currentTeams.some((t) => t.teamName.toLowerCase() === name.toLowerCase())) {
    return { success: false, error: `A team named "${name}" already exists in ${params.gameId}.` };
  }

  const newTeam: TeamScoreEntry = {
    id: `${params.gameId.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    teamName: name,
    gameId: params.gameId,
    matchesPlayed: 0,
    placementPoints: 0,
    killPoints: 0,
    totalPoints: 0,
    rank: currentTeams.length + 1,
  };

  currentTeams.push(newTeam);
  store.teams[params.gameId] = sortAndRankTeams(currentTeams);
  await saveStoreAsync(store);

  return { success: true, team: newTeam, teams: store.teams[params.gameId] };
}

/**
 * Remove an existing team from a game arena
 */
export async function removeTeamFromGameAsync(params: {
  gameId: GameId;
  teamId: string;
  adminPassword?: string;
}): Promise<{ success: boolean; teams?: TeamScoreEntry[]; error?: string }> {
  if (params.adminPassword && !verifyAdminPassword(params.adminPassword)) {
    return { success: false, error: "Unauthorized: Invalid Super Admin password." };
  }

  const store = await getStoreAsync();
  const currentTeams = store.teams[params.gameId] || [];

  const teamIdx = currentTeams.findIndex((t) => t.id === params.teamId);
  if (teamIdx === -1) {
    return { success: false, error: "Team not found in this game arena." };
  }

  currentTeams.splice(teamIdx, 1);
  store.teams[params.gameId] = sortAndRankTeams(currentTeams);
  await saveStoreAsync(store);

  return { success: true, teams: store.teams[params.gameId] };
}

/**
 * Update an existing team's name
 */
export async function updateTeamNameAsync(params: {
  gameId: GameId;
  teamId: string;
  newTeamName: string;
  adminPassword?: string;
}): Promise<{ success: boolean; team?: TeamScoreEntry; teams?: TeamScoreEntry[]; error?: string }> {
  if (params.adminPassword && !verifyAdminPassword(params.adminPassword)) {
    return { success: false, error: "Unauthorized: Invalid Super Admin password." };
  }

  const newName = (params.newTeamName || "").trim();
  if (!newName) {
    return { success: false, error: "New team name cannot be empty." };
  }

  const store = await getStoreAsync();
  const currentTeams = store.teams[params.gameId] || [];

  const team = currentTeams.find((t) => t.id === params.teamId);
  if (!team) {
    return { success: false, error: "Team not found in this game arena." };
  }

  const duplicate = currentTeams.find(
    (t) => t.id !== params.teamId && t.teamName.toLowerCase() === newName.toLowerCase()
  );
  if (duplicate) {
    return { success: false, error: `Another team named "${newName}" already exists in ${params.gameId}.` };
  }

  const oldName = team.teamName;
  team.teamName = newName;

  // Also update match submissions for this team
  store.matches.forEach((m) => {
    if (m.gameId === params.gameId && m.teamResults) {
      m.teamResults.forEach((tr) => {
        if (tr.teamId === params.teamId || tr.teamName === oldName) {
          tr.teamName = newName;
        }
      });
    }
  });

  store.teams[params.gameId] = sortAndRankTeams(currentTeams);
  await saveStoreAsync(store);

  return { success: true, team, teams: store.teams[params.gameId] };
}
