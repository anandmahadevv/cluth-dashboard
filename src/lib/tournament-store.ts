import { ALL_GAME_IDS, getCampusGameIds, isCampusGameEnabled } from "./campus-games";
import { isSuperAdminCredential, VALID_GAME_CODES, ADMIN_PASSWORD_HASH, DEFAULT_CAMPUS_PASSKEYS, generateDefaultCampusPasskeys, resolveAdminAccess } from "./tournament-access";
import { campusAdminCanManage, campusAdminContext } from "./campus-admin-context";
import fs from "fs";
import { matchSubmissionIdentity } from "./match-submission-identity";
import path from "path";
import crypto from "crypto";
import { GameId, IndividualAwards, AwardsSubmission } from "@/types";
import {
  PLACEMENT_POINTS,
  INITIAL_TEAMS,
  CampusPasskeys,
  CAMPUSES_REGISTRY,
} from "./tournament-constants";
import {
  fetchStoreFromSupabase,
  fetchMatchWriteSnapshot,
  commitMatchWrite,
  persistStoreToSupabase,
  isSupabaseConfigured,
} from "./supabase";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TeamScoreEntry {
  id: string;
  campusId?: string;
  teamName: string;
  gameId: GameId;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  rank: number;
  lastMatchRank?: number;
  hidden?: boolean;
  qualified?: boolean;
}

export interface MatchSubmission {
  submissionFingerprint?: string;
  id: string;
  campusId?: string;
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
  campusLocks?: Record<string, boolean>;
  campusPasskeys?: Record<string, CampusPasskeys>;
  teams: Record<GameId, TeamScoreEntry[]>;
  campusTeams?: Record<string, Record<GameId, TeamScoreEntry[]>>;
  matches: MatchSubmission[];
  awards?: Partial<Record<GameId, IndividualAwards>>;
  campusAwards?: Record<string, Partial<Record<GameId, IndividualAwards>>>;
  awardsSubmissions?: AwardsSubmission[];
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
    COD: [],
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
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn("Could not read from SEED_FILE_PATH", err);
  }

  const initial = createInitialStoreData();
  inMemoryStore = initial;
  return initial;
}

/**
 * Load store data asynchronously (from Supabase if configured, falling back to disk/seed)
 * Optimized with 2s cache and promise deduplication to prevent redundant network round-trips
 */
export async function getStoreAsync(forceRefresh = false): Promise<TournamentStoreData> {
  if (isSupabaseConfigured()) {
    const now = Date.now();

    // SWR Fast Path: If inMemoryStore is already populated, return it IMMEDIATELY (<1ms!)
    if (!forceRefresh && inMemoryStore && inMemoryStore.teams) {
      // If stale, trigger background revalidation without blocking the response
      if (now - lastSupabaseFetchTime >= SUPABASE_CACHE_TTL_MS && !pendingSupabaseFetch) {
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
            }
          } catch (err) {
            console.warn("Background Supabase revalidation error:", err);
          } finally {
            pendingSupabaseFetch = null;
          }
          return inMemoryStore;
        })();
      }
      return inMemoryStore;
    }

    // Cold start fallback: Load from local disk immediately (<2ms) while kicking off background fetch
    if (!inMemoryStore) {
      try {
        const diskStore = getStore();
        if (diskStore && diskStore.teams) {
          inMemoryStore = diskStore;
          lastSupabaseFetchTime = 0; // mark stale so background fetch updates it
          // Trigger non-blocking remote sync
          if (!pendingSupabaseFetch) {
            pendingSupabaseFetch = (async () => {
              try {
                const remote = await fetchStoreFromSupabase();
                if (remote && remote.teams) {
                  inMemoryStore = remote;
                  lastSupabaseFetchTime = Date.now();
                }
              } catch {} finally {
                pendingSupabaseFetch = null;
              }
              return inMemoryStore;
            })();
          }
          if (!forceRefresh) {
            return inMemoryStore;
          }
        }
      } catch {}
    }

    // Forced refresh path: await remote fetch
    if (!pendingSupabaseFetch) {
      pendingSupabaseFetch = (async () => {
        try {
          let remote = await fetchStoreFromSupabase();
          if (!remote) {
            await new Promise((r) => setTimeout(r, 100));
            remote = await fetchStoreFromSupabase();
          }
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
    }

    try {
      const remote = await pendingSupabaseFetch;
      if (remote && remote.teams) return remote;
    } catch (err) {
      console.warn("Supabase fetch fallback to disk:", err);
    }

    if (inMemoryStore && inMemoryStore.teams) {
      return inMemoryStore;
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
 * Verify Game POC Code or Campus Passkey / Game UID
 */
export function verifyGameCode(
  code: string,
  targetGame?: GameId,
  storeData?: TournamentStoreData
): { valid: boolean; gameId?: GameId; campusId?: string; isSuperAdmin?: boolean; error?: string } {
  if (verifyAdminPassword(code)) return {valid:true,gameId:targetGame || "FREE_FIRE",isSuperAdmin:true};
  const store = storeData || inMemoryStore || getStore();
  const access = resolveAdminAccess(code, store.campusPasskeys);
  if (!access.isValid) {
    return { valid: false, error: access.error || "Invalid verification code. Please check with Tournament Super Admin." };
  }

  if (access.isSuperAdmin) {
    return { valid: true, gameId: targetGame || "FREE_FIRE", isSuperAdmin: true };
  }

  if (targetGame && !isCampusGameEnabled(access.campusId, targetGame)) return { valid: false, error: "Game unavailable for this campus." };

  if (access.gameId === "ALL") {
    return { valid: true, gameId: targetGame || "FREE_FIRE", campusId: access.campusId, isSuperAdmin: false };
  }

  if (targetGame && access.gameId !== targetGame) {
    return { valid: false, error: `This UID is assigned to ${access.gameId}, not ${targetGame}.` };
  }

  return { valid: true, gameId: access.gameId, campusId: access.campusId, isSuperAdmin: false };
}

/**
 * Get passkeys for a campus (reads from store, falls back to defaults)
 */
function enabledCampusKeys(campusId: string, keys?: CampusPasskeys): CampusPasskeys {
  return {campusAdminKey:keys?.campusAdminKey || "",gameKeys:Object.fromEntries(getCampusGameIds(campusId).map(game=>[game,keys?.gameKeys?.[game] || ""])) as Record<GameId,string>};
}

export async function getCampusPasskeysAsync(campusId: string = "mangalore"): Promise<CampusPasskeys> {
  const store = await getStoreAsync();
  if (store.campusPasskeys && store.campusPasskeys[campusId]) {
    return enabledCampusKeys(campusId, store.campusPasskeys[campusId]);
  }
  return enabledCampusKeys(campusId, DEFAULT_CAMPUS_PASSKEYS[campusId]);
}

/**
 * Get all passkeys across all campuses
 */
export async function getAllCampusPasskeysAsync(): Promise<Record<string, CampusPasskeys>> {
  const store = await getStoreAsync();
  const result: Record<string, CampusPasskeys> = {};
  for (const campusId of Object.keys(CAMPUSES_REGISTRY)) {
    if (store.campusPasskeys && store.campusPasskeys[campusId]) {
      result[campusId] = store.campusPasskeys[campusId];
    } else {
      result[campusId] = DEFAULT_CAMPUS_PASSKEYS[campusId] || {campusAdminKey:"",gameKeys:{FREE_FIRE:"",BGMI:"",VALORANT:"",EFOOTBALL:"",MATIKS:"",COD:""}};
    }
  }
  return Object.fromEntries(Object.entries(result).map(([campus,keys])=>[campus,enabledCampusKeys(campus,keys)]));
}

/**
 * Save or customize passkeys for a campus (Super Admin only)
 */
export async function saveCampusPasskeysAsync(params: {
  campusId: string;
  passkeys: CampusPasskeys;
  adminPassword?: string;
  pocCode?: string;
}): Promise<{ success: boolean; passkeys?: CampusPasskeys; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "");

  if (!isSuper) {
    return { success: false, error: "Unauthorized: Super Admin authorization is required to change campus passkeys." };
  }

  const { campusId, passkeys } = params;
  if (!CAMPUSES_REGISTRY[campusId]) return {success:false,error:"Unknown campus."};
  if (!passkeys?.campusAdminKey?.trim()) {
    return { success: false, error: "Campus admin key cannot be empty." };
  }

  const gameKeys = passkeys.gameKeys || {} as Record<GameId,string>;
  const games = getCampusGameIds(campusId);
  const uids = new Set<string>([passkeys.campusAdminKey.trim().toUpperCase()]);

  for (const g of games) {
    const val = (gameKeys[g] || "").trim().toUpperCase();
    if (!val) {
      return { success: false, error: `Game UID for ${g} cannot be empty.` };
    }
    if (uids.has(val)) {
      return { success: false, error: `Each game must have a different unique UID. Duplicate found: ${val}` };
    }
    uids.add(val);
  }

  const snapshot = isSupabaseConfigured() ? await fetchMatchWriteSnapshot() : null;
  const store = snapshot ? snapshot.store : structuredClone(await getStoreAsync(true));
  for (const candidate of Array.from(uids)) {
    const others = {...(store.campusPasskeys || {}), [campusId]: {campusAdminKey:"",gameKeys:{} as Record<GameId,string>}};
    const access = resolveAdminAccess(candidate, others);
    if (access.isValid || access.error?.includes("conflicting")) return {success:false,error:"A key is already assigned to another campus, game, or admin role. Use a unique key."};
  }
  if (!store.campusPasskeys) {
    store.campusPasskeys = {};
  }

  store.campusPasskeys[campusId] = {
    campusAdminKey:passkeys.campusAdminKey.trim().toUpperCase(),
    gameKeys:Object.fromEntries(games.map(game=>[game,gameKeys[game].trim().toUpperCase()])) as Record<GameId,string>,
  };

  if (snapshot && !(await commitMatchWrite(store, snapshot.revision))) return {success:false,error:"Keys changed while saving. Reload the campus keys and retry."};
  saveStore(store);

  return { success: true, passkeys: store.campusPasskeys[campusId] };
}

/**
 * Regenerate fresh distinct random UIDs for a campus (Super Admin only)
 */
export async function regenerateCampusPasskeysAsync(params: {
  campusId: string;
  adminPassword?: string;
  pocCode?: string;
}): Promise<{ success: boolean; passkeys?: CampusPasskeys; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "");

  if (!isSuper) {
    return { success: false, error: "Unauthorized: Super Admin authorization is required to regenerate UIDs." };
  }

  if(!CAMPUSES_REGISTRY[params.campusId]) return {success:false,error:"Unknown campus."};
  const prefix=params.campusId.toUpperCase().slice(0,3);
  const fresh=(kind:string)=>`CLT-${prefix}-${kind}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
  const newPasskeys:CampusPasskeys = {campusAdminKey:fresh("ADMIN"),gameKeys:Object.fromEntries(getCampusGameIds(params.campusId).map(game=>[game,fresh(game)])) as Record<GameId,string>};
  return saveCampusPasskeysAsync({
    campusId: params.campusId,
    passkeys: newPasskeys,
    adminPassword: params.adminPassword,
    pocCode: params.pocCode,
  });
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
 * Synchronous local snapshot helpers (for fallback/offline usage)
 */
export function getGameLeaderboard(gameId: GameId, includeHidden = false): TeamScoreEntry[] {
  const store = getStore();
  const list = store.teams[gameId] || [];
  const filtered = includeHidden ? list : list.filter((t) => !t.hidden);
  return sortAndRankTeams(filtered);
}

export function getGameMatches(gameId?: GameId, approvedOnly = true): MatchSubmission[] {
  const store = getStore();
  return store.matches.filter((m) => {
    if (gameId && m.gameId !== gameId) return false;
    if (approvedOnly && m.status && m.status !== "APPROVED") return false;
    return true;
  });
}

/** Server-only configured credential; published legacy aliases are no longer accepted. */
export function verifyAdminPassword(password:string):boolean { return isSuperAdminCredential(password); }

/**
 * Check if a campus is locked (read-only for non-super-admins)
 */
export function isCampusLocked(store: TournamentStoreData, campusId: string = "mangalore"): boolean {
  if (store.campusLocks && store.campusLocks[campusId] !== undefined) {
    return store.campusLocks[campusId];
  }
  return campusId === "mangalore";
}

/**
 * Toggle campus lock (Super Admin only)
 */
export async function toggleCampusLockAsync(params: {
  campusId: string;
  isLocked: boolean;
  adminPassword?: string;
  pocCode?: string;
}): Promise<{ success: boolean; isLocked?: boolean; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "");

  if (!isSuper) {
    return { success: false, error: "Unauthorized: Super Admin authorization is required to change campus lock." };
  }

  const store = await getStoreAsync(true);
  if (!store.campusLocks) {
    store.campusLocks = { mangalore: true, kanyakumari: false, coimbatore: false, bangalore: false };
  }
  store.campusLocks[params.campusId] = params.isLocked;
  await saveStoreAsync(store);

  return { success: true, isLocked: params.isLocked };
}

/**
 * Helper to get teams array for a specific campus and game
 */
export function getCampusTeamsList(
  store: TournamentStoreData,
  campusId: string = "mangalore",
  gameId: GameId
): TeamScoreEntry[] {
  if (campusId === "mangalore") {
    return store.teams[gameId] || [];
  }
  if (!store.campusTeams) {
    store.campusTeams = {};
  }
  if (!store.campusTeams[campusId]) {
    store.campusTeams[campusId] = {
      COD: [],
    FREE_FIRE: [],
      BGMI: [],
      VALORANT: [],
      EFOOTBALL: [],
      MATIKS: [],
    };
  }
  return store.campusTeams[campusId][gameId] || [];
}

/**
 * Helper to set teams array for a specific campus and game
 */
export function setCampusTeamsList(
  store: TournamentStoreData,
  campusId: string = "mangalore",
  gameId: GameId,
  teams: TeamScoreEntry[]
) {
  if (campusId === "mangalore") {
    store.teams[gameId] = teams;
    return;
  }
  if (!store.campusTeams) {
    store.campusTeams = {};
  }
  if (!store.campusTeams[campusId]) {
    store.campusTeams[campusId] = {
      COD: [],
    FREE_FIRE: [],
      BGMI: [],
      VALORANT: [],
      EFOOTBALL: [],
      MATIKS: [],
    };
  }
  store.campusTeams[campusId][gameId] = teams;
}

/**
 * Helper to rollback points awarded by an approved match
 */
function rollbackMatchScores(store: TournamentStoreData, match: MatchSubmission) {
  if (match.status === "APPROVED") {
    const campusId = match.campusId || "mangalore";
    const teams = getCampusTeamsList(store, campusId, match.gameId);
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
      setCampusTeamsList(store, campusId, match.gameId, sortAndRankTeams(teams));
    }
  }
}

/**
 * Get sorted leaderboard for a specific game (async, filters hidden teams by default)
 */
export async function getGameLeaderboardAsync(
  gameId: GameId,
  includeHidden = false,
  campusId: string = "mangalore"
): Promise<TeamScoreEntry[]> {
  if (!isCampusGameEnabled(campusId,gameId)) return [];
  const store = await getStoreAsync();
  const list = getCampusTeamsList(store, campusId, gameId);
  const filtered = includeHidden ? list : list.filter((t) => !t.hidden);
  return sortAndRankTeams(filtered);
}

/**
 * Get matches for a game asynchronously
 */
export async function getGameMatchesAsync(
  gameId?: GameId,
  approvedOnly = true,
  campusId?: string
): Promise<MatchSubmission[]> {
  const store = await getStoreAsync();
  return store.matches.filter((m) => {
    if (!isCampusGameEnabled(m.campusId || "mangalore",m.gameId)) return false;
    if (campusId && (m.campusId || "mangalore") !== campusId) return false;
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
  campusId?: string;
  teamResults: {
    teamId: string;
    placement: number;
    placementPoints?: number;
    kills?: number;
  }[];
}): Promise<{ success: boolean; pending?: boolean; submissionId?: string; leaderboard?: TeamScoreEntry[]; message?: string; error?: string }> {
  const campusId = params.campusId || "mangalore";
  if (!isCampusGameEnabled(campusId,params.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const identity = matchSubmissionIdentity(params);
  for (let attempt = 0; attempt < 5; attempt++) {
    const snapshot = isSupabaseConfigured() ? await fetchMatchWriteSnapshot() : null;
    const store: TournamentStoreData = snapshot ? snapshot.store : await getStoreAsync();
    const currentAuth = verifyGameCode(params.pocCode, params.gameId, store);
    if (!currentAuth.valid) return { success: false, error: currentAuth.error };
    if (!currentAuth.isSuperAdmin && currentAuth.campusId !== campusId) return {success:false,error:"This key is assigned to a different campus."};
    const existing = store.matches.find(match => match.status !== "REJECTED" && matchSubmissionIdentity(match).roundKey === identity.roundKey);
    if (existing) {
      if (existing.submissionFingerprint === identity.fingerprint) return {
        success: true, pending: existing.status === "PENDING", submissionId: existing.id,
        message: "This match was already received. No duplicate was created.",
      };
      return { success: false, error: "This match number already has a submission for these teams. Check its status with the admin before sending different scores." };
    }

    const isSuperAdminCode = (!!currentAuth.isSuperAdmin && verifyAdminPassword(params.pocCode)) || campusAdminCanManage(campusId);
    if (campusAdminCanManage(campusId) && isCampusLocked(store,campusId)) return {success:false,error:"This campus is locked by Super Admin."};
    if (isCampusLocked(store, campusId) && !isSuperAdminCode) {
      return {
        success: false,
        error: `This campus (${campusId}) tournament is LOCKED by Super Admin. Read-only mode.`,
      };
    }

    const teams = getCampusTeamsList(store, campusId, params.gameId);
    if (!teams || teams.length === 0) {
      return { success: false, error: `No teams configured for ${params.gameId} in ${campusId}.` };
    }

    const detailedResults: MatchSubmission["teamResults"] = [];

    params.teamResults.forEach((res) => {
      const team = teams.find((t) => t.id === res.teamId);
      if (!team) return;

      let placementPts = res.placementPoints || 0;
      const kills = params.gameId === "VALORANT" ? 0 : (res.kills || 0);

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

    const shouldApprove = isSuperAdminCode && params.autoApprove === true;
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

      setCampusTeamsList(store, campusId, params.gameId, sortAndRankTeams(teams));
    }

    const matchEntry: MatchSubmission = {
      id: `SUB-${crypto.randomUUID()}`,
      submissionFingerprint: identity.fingerprint,
      campusId: campusId,
      gameId: params.gameId,
      matchNumber: params.matchNumber,
      timestamp: new Date().toISOString(),
      pocCode: "",
      proofUrl: params.proofUrl,
      notes: params.notes || "",
      status: status,
      reviewedAt: shouldApprove ? new Date().toISOString() : undefined,
      reviewedBy: shouldApprove ? (campusAdminCanManage(campusId) ? `CampusAdmin:${campusId}` : "SuperAdmin") : undefined,
      teamResults: detailedResults,
    };

    store.matches.unshift(matchEntry);
    store.lastUpdated = new Date().toISOString();
    if (snapshot && !(await commitMatchWrite(store, snapshot.revision))) continue;
    saveStore(store);

    const finalTeams = getCampusTeamsList(store, campusId, params.gameId);
    if (shouldApprove) {
      return {
        success: true,
        pending: false,
        submissionId: matchEntry.id,
        leaderboard: finalTeams,
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
  return { success: false, error: "Tournament data changed while saving. Please retry the same submission." };
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
  const superAccess = verifyAdminPassword(params.adminPassword);
  const campusAccess = campusAdminContext.getStore();
  if (!superAccess && !campusAccess) {
    return { success: false, error: "Invalid Super Admin password. Access denied." };
  }

  const store = await getStoreAsync();
  const match = store.matches.find((m) => m.id === params.submissionId);
  if (!match) {
    return { success: false, error: "Submission not found." };
  }

  if (!superAccess && (!campusAccess || (match.campusId || "mangalore") !== campusAccess.campusId)) return {success:false,error:"Submission is outside your assigned campus."};
  if (!superAccess && isCampusLocked(store,campusAccess!.campusId)) return {success:false,error:"This campus is locked by Super Admin."};
  if (!superAccess && (!["APPROVE","REJECT"].includes(params.action) || match.status !== "PENDING")) return {success:false,error:"Campus admins can only approve or reject pending submissions."};
  if (!isCampusGameEnabled(match.campusId || "mangalore",match.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const campusId = match.campusId || "mangalore";

  if (params.action === "APPROVE") {
    if (match.status !== "APPROVED") {
      const teams = getCampusTeamsList(store, campusId, match.gameId);
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
        setCampusTeamsList(store, campusId, match.gameId, sortAndRankTeams(teams));
      }
    }

    match.status = "APPROVED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = superAccess ? "SuperAdmin" : `CampusAdmin:${campusAccess!.campusId}`;
    match.rejectionReason = undefined;
    await saveStoreAsync(store);

    return {
      success: true,
      match,
      leaderboard: getCampusTeamsList(store, campusId, match.gameId),
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
      leaderboard: getCampusTeamsList(store, campusId, match.gameId),
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
      leaderboard: getCampusTeamsList(store, campusId, match.gameId),
    };
  } else {
    // REJECT action: rollback points if previously approved
    rollbackMatchScores(store, match);
    match.status = "REJECTED";
    match.reviewedAt = new Date().toISOString();
    match.reviewedBy = superAccess ? "SuperAdmin" : `CampusAdmin:${campusAccess!.campusId}`;
    match.rejectionReason = params.rejectionReason || "Submission rejected by Super Admin.";
    await saveStoreAsync(store);

    return { success: true, match, leaderboard: getCampusTeamsList(store, campusId, match.gameId) };
  }
}

/**
 * Get all match submissions asynchronously
 */
export async function getAllSubmissionsAsync(options?: {
  gameId?: GameId;
  status?: SubmissionStatus | "ALL";
  campusId?: string;
}): Promise<MatchSubmission[]> {
  const store = await getStoreAsync();
  return store.matches.filter((m) => {
    if (!isCampusGameEnabled(m.campusId || "mangalore",m.gameId)) return false;
    if (options?.campusId && (m.campusId || "mangalore") !== options.campusId) return false;
    if (options?.gameId && m.gameId !== options.gameId) return false;
    if (options?.status && options.status !== "ALL" && m.status !== options.status) return false;
    return true;
  });
}

/**
 * Reset scores for a single game or all games back to 0 asynchronously
 */
export async function resetGameScoresAsync(
  code: string,
  targetGame?: GameId | "ALL",
  campusId: string = "mangalore"
): Promise<{ success: boolean; error?: string }> {
  if (targetGame && targetGame !== "ALL" && !isCampusGameEnabled(campusId, targetGame)) return {success:false,error:"Game unavailable for this campus."};
  const auth = verifyGameCode(code);
  if (!auth.valid || !auth.isSuperAdmin) {
    return { success: false, error: "Unauthorized. Super Admin authorization is required to reset." };
  }

  const store = await getStoreAsync();
  const initial = createInitialStoreData();

  if (campusId === "mangalore") {
    if (!targetGame || targetGame === "ALL") {
      store.teams = initial.teams;
      store.matches = store.matches.filter((m) => (m.campusId && m.campusId !== "mangalore"));
    } else {
      store.teams[targetGame] = initial.teams[targetGame];
      store.matches = store.matches.filter((m) => !(m.gameId === targetGame && (!m.campusId || m.campusId === "mangalore")));
    }
  } else {
    if (!store.campusTeams) store.campusTeams = {};
    if (!targetGame || targetGame === "ALL") {
      store.campusTeams[campusId] = {
        COD: [],
    FREE_FIRE: [],
        BGMI: [],
        VALORANT: [],
        EFOOTBALL: [],
        MATIKS: [],
      };
      store.matches = store.matches.filter((m) => m.campusId !== campusId);
      if (!store.campusAwards) store.campusAwards = {};
      store.campusAwards[campusId] = {};
      if (store.awardsSubmissions) {
        store.awardsSubmissions = store.awardsSubmissions.filter((s) => s.campusId !== campusId);
      }
    } else {
      if (!store.campusTeams[campusId]) {
        store.campusTeams[campusId] = {
          COD: [],
    FREE_FIRE: [],
          BGMI: [],
          VALORANT: [],
          EFOOTBALL: [],
          MATIKS: [],
        };
      }
      store.campusTeams[campusId][targetGame] = [];
      store.matches = store.matches.filter((m) => !(m.gameId === targetGame && m.campusId === campusId));
      if (store.campusAwards && store.campusAwards[campusId]) {
        delete store.campusAwards[campusId][targetGame];
      }
      if (store.awardsSubmissions) {
        store.awardsSubmissions = store.awardsSubmissions.filter(
          (s) => !(s.campusId === campusId && s.gameId === targetGame)
        );
      }
    }
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
  campusId?: string;
  adminPassword?: string;
  pocCode?: string;
}): Promise<{ success: boolean; team?: TeamScoreEntry; teams?: TeamScoreEntry[]; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "") || campusAdminCanManage(params.campusId || "mangalore");

  if (!isSuper) return {success:false,error:"Admin access required for roster management."};
  const campusId = params.campusId || "mangalore";
  if (!isCampusGameEnabled(campusId,params.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const store = await getStoreAsync();
  if (campusAdminCanManage(campusId) && isCampusLocked(store,campusId)) return {success:false,error:"This campus is locked by Super Admin."};

  if (isCampusLocked(store, campusId) && !isSuper) {
    return { success: false, error: `This campus (${campusId}) is LOCKED. Only Super Admin can modify teams.` };
  }

  const name = (params.teamName || "").trim();
  if (!name) {
    return { success: false, error: "Team name cannot be empty." };
  }

  const currentTeams = getCampusTeamsList(store, campusId, params.gameId);

  if (currentTeams.some((t) => t.teamName.toLowerCase() === name.toLowerCase())) {
    return { success: false, error: `A team named "${name}" already exists in ${params.gameId}.` };
  }

  const newTeam: TeamScoreEntry = {
    id: `${params.gameId.toLowerCase()}-${campusId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    campusId,
    teamName: name,
    gameId: params.gameId,
    matchesPlayed: 0,
    placementPoints: 0,
    killPoints: 0,
    totalPoints: 0,
    rank: currentTeams.length + 1,
  };

  currentTeams.push(newTeam);
  setCampusTeamsList(store, campusId, params.gameId, sortAndRankTeams(currentTeams));
  await saveStoreAsync(store);

  return { success: true, team: newTeam, teams: getCampusTeamsList(store, campusId, params.gameId) };
}

/**
 * Remove an existing team from a game arena
 */
export async function removeTeamFromGameAsync(params: {
  gameId: GameId;
  teamId: string;
  campusId?: string;
  adminPassword?: string;
  pocCode?: string;
}): Promise<{ success: boolean; teams?: TeamScoreEntry[]; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "") || campusAdminCanManage(params.campusId || "mangalore");

  if (!isSuper) return {success:false,error:"Admin access required for roster management."};
  const campusId = params.campusId || "mangalore";
  if (!isCampusGameEnabled(campusId,params.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const store = await getStoreAsync();
  if (campusAdminCanManage(campusId) && isCampusLocked(store,campusId)) return {success:false,error:"This campus is locked by Super Admin."};

  if (isCampusLocked(store, campusId) && !isSuper) {
    return { success: false, error: `This campus (${campusId}) is LOCKED. Only Super Admin can modify teams.` };
  }

  const currentTeams = getCampusTeamsList(store, campusId, params.gameId);

  const teamIdx = currentTeams.findIndex((t) => t.id === params.teamId);
  if (teamIdx === -1) {
    return { success: false, error: "Team not found in this game arena." };
  }

  currentTeams.splice(teamIdx, 1);
  setCampusTeamsList(store, campusId, params.gameId, sortAndRankTeams(currentTeams));
  await saveStoreAsync(store);

  return { success: true, teams: getCampusTeamsList(store, campusId, params.gameId) };
}

/**
 * Update an existing team's name
 */
export async function updateTeamNameAsync(params: {
  gameId: GameId;
  teamId: string;
  newTeamName: string;
  campusId?: string;
  adminPassword?: string;
  pocCode?: string;
}): Promise<{ success: boolean; team?: TeamScoreEntry; teams?: TeamScoreEntry[]; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "") || campusAdminCanManage(params.campusId || "mangalore");

  if (!isSuper) return {success:false,error:"Admin access required for roster management."};
  const campusId = params.campusId || "mangalore";
  if (!isCampusGameEnabled(campusId,params.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const store = await getStoreAsync();
  if (campusAdminCanManage(campusId) && isCampusLocked(store,campusId)) return {success:false,error:"This campus is locked by Super Admin."};

  if (isCampusLocked(store, campusId) && !isSuper) {
    return { success: false, error: `This campus (${campusId}) is LOCKED. Only Super Admin can modify teams.` };
  }

  const newName = (params.newTeamName || "").trim();
  if (!newName) {
    return { success: false, error: "New team name cannot be empty." };
  }

  const currentTeams = getCampusTeamsList(store, campusId, params.gameId);

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
    if ((m.campusId || "mangalore") === campusId && m.gameId === params.gameId && m.teamResults) {
      m.teamResults.forEach((tr) => {
        if (tr.teamId === params.teamId || tr.teamName === oldName) {
          tr.teamName = newName;
        }
      });
    }
  });

  setCampusTeamsList(store, campusId, params.gameId, sortAndRankTeams(currentTeams));
  await saveStoreAsync(store);

  return { success: true, team, teams: getCampusTeamsList(store, campusId, params.gameId) };
}

/**
 * Toggle team hidden/visible status
 */
export async function toggleTeamVisibilityAsync(params: {
  gameId: GameId;
  teamId: string;
  campusId?: string;
  hidden?: boolean;
  adminPassword?: string;
  pocCode?: string;
}): Promise<{ success: boolean; team?: TeamScoreEntry; teams?: TeamScoreEntry[]; message?: string; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "") || campusAdminCanManage(params.campusId || "mangalore");

  if (!isSuper) return {success:false,error:"Admin access required for roster management."};
  const campusId = params.campusId || "mangalore";
  if (!isCampusGameEnabled(campusId,params.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const store = await getStoreAsync();
  if (campusAdminCanManage(campusId) && isCampusLocked(store,campusId)) return {success:false,error:"This campus is locked by Super Admin."};

  if (isCampusLocked(store, campusId) && !isSuper) {
    return { success: false, error: `This campus (${campusId}) is LOCKED. Only Super Admin can modify teams.` };
  }

  const currentTeams = getCampusTeamsList(store, campusId, params.gameId);

  const team = currentTeams.find((t) => t.id === params.teamId);
  if (!team) {
    return { success: false, error: "Team not found in this game arena." };
  }

  // Toggle or set visibility
  team.hidden = params.hidden !== undefined ? params.hidden : !team.hidden;

  setCampusTeamsList(store, campusId, params.gameId, sortAndRankTeams(currentTeams));
  await saveStoreAsync(store);

  const statusLabel = team.hidden ? "hidden from public view" : "visible on public leaderboards";
  return {
    success: true,
    team,
    teams: getCampusTeamsList(store, campusId, params.gameId),
    message: `Team "${team.teamName}" is now ${statusLabel}.`,
  };
}

/**
 * Toggle team qualified for finals status (Q mark)
 */
export async function toggleTeamQualifiedAsync(params: {
  gameId: GameId;
  teamId: string;
  campusId?: string;
  qualified?: boolean;
  pocCode?: string;
  adminPassword?: string;
}): Promise<{ success: boolean; team?: TeamScoreEntry; teams?: TeamScoreEntry[]; message?: string; error?: string }> {
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "") || campusAdminCanManage(params.campusId || "mangalore");

  const campusId = params.campusId || "mangalore";
  if (!isCampusGameEnabled(campusId,params.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const store = await getStoreAsync();
  if (campusAdminCanManage(campusId) && isCampusLocked(store,campusId)) return {success:false,error:"This campus is locked by Super Admin."};

  if (isCampusLocked(store, campusId) && !isSuper) {
    return { success: false, error: `This campus (${campusId}) is LOCKED. Only Super Admin can modify teams.` };
  }

  // Allow authorized POCs (with valid room code) or Super Admin
  if (params.pocCode) {
    const check = verifyGameCode(params.pocCode, params.gameId, store);
    if (!check.valid || (!check.isSuperAdmin && check.campusId !== campusId)) {
      return { success: false, error: "Unauthorized: Invalid room verification code." };
    }
  } else if (!isSuper) {
    return { success: false, error: "Unauthorized: Invalid Super Admin password." };
  }

  const currentTeams = getCampusTeamsList(store, campusId, params.gameId);

  const team = currentTeams.find((t) => t.id === params.teamId);
  if (!team) {
    return { success: false, error: "Team not found in this game arena." };
  }

  // Toggle or set qualified
  team.qualified = params.qualified !== undefined ? params.qualified : !team.qualified;

  setCampusTeamsList(store, campusId, params.gameId, sortAndRankTeams(currentTeams));
  await saveStoreAsync(store);

  const statusLabel = team.qualified ? "marked as QUALIFIED for Grand Finals" : "removed from Qualified status";
  return {
    success: true,
    team,
    teams: getCampusTeamsList(store, campusId, params.gameId),
    message: `Team "${team.teamName}" is now ${statusLabel}.`,
  };
}

/**
 * Retrieve individual accolades & special awards for a game (MVP, Top Fragger)
 */
export async function getAwardsAsync(
  gameId: GameId,
  campusId: string = "mangalore"
): Promise<IndividualAwards> {
  if(gameId!=="FREE_FIRE")return {};
  let store = await getStoreAsync();

  if (campusId === "mangalore") {
    const currentAward = store.awards?.[gameId];
    const hasContent = Boolean(
      currentAward?.winnerTeam ||
      currentAward?.runnerUpTeam ||
      currentAward?.mvp?.playerName ||
      currentAward?.topFragger?.playerName
    );

    // If this instance didn't find awards in memory, force a fresh Supabase fetch
    if (!hasContent && isSupabaseConfigured()) {
      store = await getStoreAsync(true);
    }

    if (!store.awards) {
      store.awards = {};
    }
    return store.awards[gameId] || {};
  }

  if (!store.campusAwards) {
    store.campusAwards = {};
  }
  if (!store.campusAwards[campusId]) {
    store.campusAwards[campusId] = {};
  }

  return store.campusAwards[campusId][gameId] || {};
}

/**
 * Save or request individual accolades & special awards (MVP, Top Fragger).
 * If submitted by POC, creates a PENDING AwardsSubmission requiring Super Admin approval.
 * If submitted by Super Admin, updates live awards immediately and ratifies any pending request.
 */
export async function saveAwardsAsync(params: {
  gameId: GameId;
  awards: IndividualAwards;
  campusId?: string;
  pocCode?: string;
  adminPassword?: string;
}): Promise<{
  success: boolean;
  awards?: IndividualAwards;
  submission?: AwardsSubmission;
  isPendingApproval?: boolean;
  error?: string;
  message?: string;
}> {
  if(params.gameId!=="FREE_FIRE")return {success:false,error:"Special awards are available only for Free Fire."};
  const isSuper =
    (params.adminPassword && verifyAdminPassword(params.adminPassword)) ||
    verifyAdminPassword(params.pocCode || "") || campusAdminCanManage(params.campusId || "mangalore");

  const campusId = params.campusId || "mangalore";
  if (!isCampusGameEnabled(campusId,params.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  const store = await getStoreAsync(true);
  if (campusAdminCanManage(campusId) && isCampusLocked(store,campusId)) return {success:false,error:"This campus is locked by Super Admin."};

  if (isCampusLocked(store, campusId) && !isSuper) {
    return {
      success: false,
      error: `This campus (${campusId}) is LOCKED by Super Admin. Accolades cannot be edited.`,
    };
  }

  if (params.pocCode) {
    const check = verifyGameCode(params.pocCode, params.gameId, store);
    if (!check.valid || (!check.isSuperAdmin && check.campusId !== campusId)) {
      return { success: false, error: "Unauthorized: Invalid room verification code." };
    }
  } else if (!isSuper) {
    return { success: false, error: "Unauthorized: Super Admin or valid POC passkey required." };
  }

  // 1. POC OR CAMPUS ADMIN: Submits for Super Admin approval
  if (!isSuper) {
    if (!store.awardsSubmissions) store.awardsSubmissions = [];

    const existingPending = store.awardsSubmissions.find(
      (s) => s.campusId === campusId && s.gameId === params.gameId && s.status === "PENDING"
    );

    const submission: AwardsSubmission = {
      id: existingPending?.id || `AWD-${campusId.slice(0, 3).toUpperCase()}-${params.gameId.slice(0, 2)}-${Date.now()}`,
      campusId,
      gameId: params.gameId,
      awards: params.awards,
      pocCode: "",
      status: "PENDING",
      timestamp: new Date().toISOString(),
    };

    if (existingPending) {
      Object.assign(existingPending, submission);
    } else {
      store.awardsSubmissions.unshift(submission);
    }

    await saveStoreAsync(store);

    return {
      success: true,
      submission,
      isPendingApproval: true,
      message: "Tournament Special Awards request submitted! Awaiting Super Admin approval before live broadcast.",
    };
  }

  // 2. SUPER ADMIN: Direct ratification & live broadcast
  if (campusId === "mangalore") {
    if (!store.awards) store.awards = {};
    store.awards[params.gameId] = {
      ...store.awards[params.gameId],
      ...params.awards,
    };
  }

  if (!store.campusAwards) store.campusAwards = {};
  if (!store.campusAwards[campusId]) store.campusAwards[campusId] = {};
  store.campusAwards[campusId][params.gameId] = {
    ...store.campusAwards[campusId][params.gameId],
    ...params.awards,
  };

  // If there was a pending submission, mark it approved
  if (store.awardsSubmissions) {
    const pending = store.awardsSubmissions.find(
      (s) => s.campusId === campusId && s.gameId === params.gameId && s.status === "PENDING"
    );
    if (pending) {
      pending.status = "APPROVED";
      pending.approvedAt = new Date().toISOString();
      pending.reviewedBy = "Super Admin";
    }
  }

  await saveStoreAsync(store);

  const finalAwards =
    campusId === "mangalore"
      ? store.awards?.[params.gameId]
      : store.campusAwards[campusId][params.gameId];

  return {
    success: true,
    awards: finalAwards,
    message: "Special Awards (MVP & Top Fragger) updated and broadcast live by Super Admin!",
  };
}

/**
 * Fetch all or filtered awards submissions
 */
export async function getAwardsSubmissionsAsync(options?: {
  campusId?: string;
  gameId?: GameId;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
}): Promise<AwardsSubmission[]> {
  const store = await getStoreAsync();
  if (!store.awardsSubmissions) return [];
  return store.awardsSubmissions.filter((s) => {
    if(s.gameId!=="FREE_FIRE")return false;
    if (!isCampusGameEnabled(s.campusId, s.gameId)) return false;
    if (options?.campusId && s.campusId !== options.campusId) return false;
    if (options?.gameId && s.gameId !== options.gameId) return false;
    if (options?.status && options.status !== "ALL" && s.status !== options.status) return false;
    return true;
  });
}

/**
 * Get latest awards submission for a specific campus and game
 */
export async function getLatestAwardsSubmissionAsync(
  campusId: string,
  gameId: GameId
): Promise<AwardsSubmission | null> {
  if (!isCampusGameEnabled(campusId, gameId)) return null;
  if(gameId!=="FREE_FIRE")return null;
  const store = await getStoreAsync();
  if (!store.awardsSubmissions || store.awardsSubmissions.length === 0) return null;
  const found = store.awardsSubmissions.find(
    (s) => s.campusId === campusId && s.gameId === gameId
  );
  return found || null;
}

/**
 * Review awards submission: APPROVE or REJECT (Super Admin only)
 */
export async function reviewAwardsSubmissionAsync(params: {
  submissionId: string;
  action: "APPROVE" | "REJECT";
  adminPassword: string;
  rejectionReason?: string;
}): Promise<{
  success: boolean;
  submission?: AwardsSubmission;
  awards?: IndividualAwards;
  error?: string;
  message?: string;
}> {
  const superAccess = verifyAdminPassword(params.adminPassword);
  const campusAccess = campusAdminContext.getStore();
  if (!superAccess && !campusAccess) {
    return { success: false, error: "Invalid Super Admin password. Access denied." };
  }

  const store = await getStoreAsync(true);
  if (!store.awardsSubmissions) {
    return { success: false, error: "No awards submissions found." };
  }

  const sub = store.awardsSubmissions.find((s) => s.id === params.submissionId);
  if (!sub) {
    return { success: false, error: "Awards submission not found." };
  }

  if (!superAccess && (!campusAccess || (sub.campusId || "mangalore") !== campusAccess.campusId)) return {success:false,error:"Submission is outside your assigned campus."};
  if (!superAccess && isCampusLocked(store,campusAccess!.campusId)) return {success:false,error:"This campus is locked by Super Admin."};
  if (!superAccess && (!["APPROVE","REJECT"].includes(params.action) || sub.status !== "PENDING")) return {success:false,error:"Campus admins can only approve or reject pending submissions."};
  if(sub.gameId!=="FREE_FIRE")return {success:false,error:"Special awards are available only for Free Fire."};
  if (!isCampusGameEnabled(sub.campusId || "mangalore",sub.gameId)) return {success:false,error:"This game is not enabled for this campus."};
  if (params.action === "APPROVE") {
    sub.status = "APPROVED";
    sub.approvedAt = new Date().toISOString();
    sub.reviewedBy = superAccess ? "Super Admin" : `CampusAdmin:${campusAccess!.campusId}`;

    // Broadcast to campusAwards
    if (!store.campusAwards) store.campusAwards = {};
    if (!store.campusAwards[sub.campusId]) store.campusAwards[sub.campusId] = {};
    store.campusAwards[sub.campusId][sub.gameId] = {
      ...store.campusAwards[sub.campusId][sub.gameId],
      ...sub.awards,
    };

    if (sub.campusId === "mangalore") {
      if (!store.awards) store.awards = {};
      store.awards[sub.gameId] = {
        ...store.awards[sub.gameId],
        ...sub.awards,
      };
    }

    await saveStoreAsync(store);

    return {
      success: true,
      submission: sub,
      awards: sub.awards,
      message: `Awards for ${sub.gameId} (${sub.campusId}) approved and broadcast live to public dashboard!`,
    };
  } else if (params.action === "REJECT") {
    sub.status = "REJECTED";
    sub.rejectionReason = params.rejectionReason || "Awards nomination rejected by Super Admin.";
    await saveStoreAsync(store);

    return {
      success: true,
      submission: sub,
      message: `Awards submission rejected: ${sub.rejectionReason}`,
    };
  }

  return { success: false, error: "Invalid review action." };
}
