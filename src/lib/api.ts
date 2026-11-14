import {
  GameConfig,
  GameId,
  TournamentStatusResponse,
  FreeFireLeaderboardEntry,
  BgmiLeaderboardEntry,
  GenericMatchResult,
  GameWinner,
  PublicApiResponse,
} from "@/types";
import { GAMES_CONFIG, API_ENDPOINTS } from "./constants";
import {
  MOCK_TOURNAMENT_STATUS,
  MOCK_FREE_FIRE_LEADERBOARD,
  MOCK_BGMI_LEADERBOARD,
  MOCK_FIFA_MATCHES,
  MOCK_MATIKS_RESULTS,
  MOCK_GENERIC_MATCHES,
  MOCK_GAME_WINNERS,
} from "./mock-data";

const APPS_SCRIPT_API_URL = process.env.NEXT_PUBLIC_CLUTCH_API_URL || "";
const USE_REMOTE_GAS = process.env.NEXT_PUBLIC_USE_REMOTE_GAS === "true";

/**
 * Universal safe fetcher: defaults to internal native store API routes, with optional Google Apps Script bridge
 */
async function safePublicFetch<T>(
  actionName: string,
  restEndpoint: string,
  extraParams: Record<string, string>,
  fallbackData: T
): Promise<PublicApiResponse<T>> {
  try {
    let fullUrl = restEndpoint;

    // Use remote Google Apps Script if explicitly toggled on
    if (APPS_SCRIPT_API_URL && APPS_SCRIPT_API_URL.includes("script.google.com") && USE_REMOTE_GAS) {
      const urlObj = new URL(APPS_SCRIPT_API_URL);
      urlObj.searchParams.set("action", actionName);
      Object.entries(extraParams).forEach(([k, v]) => urlObj.searchParams.set(k, v));
      fullUrl = urlObj.toString();
    }

    const res = await fetch(fullUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const json = await res.json();
      let payload: any = json.data !== undefined ? json.data : (json.results !== undefined ? json.results : json);

      // Normalize row data
      if (Array.isArray(payload)) {
        payload = payload.map((item: any, idx: number) => ({
          rank: item.rank || idx + 1,
          teamName: item.teamName || item.team_name || item.name || item.playerName || "",
          placementPoints: Number(item.placementPoints ?? item.placement_points ?? 0),
          killPoints: Number(item.killPoints ?? item.kill_points ?? 0),
          totalPoints: Number(item.totalPoints ?? item.total_points ?? item.score ?? 0),
          matchesPlayed: Number(item.matchesPlayed ?? item.matches_played ?? 0),
          playerName: item.playerName || item.teamName || item.player1 || "",
          score: Number(item.totalPoints ?? item.score ?? 0),
          goals1: Number(item.goals1 ?? 0),
          goals2: Number(item.goals2 ?? 0),
          ...item,
        }));
      }

      return {
        success: true,
        data: payload as T,
        meta: {
          source: "API",
          approvedOnly: true,
          timestamp: json.last_updated || new Date().toISOString(),
        },
      };
    }
  } catch (err) {
    console.warn(`[CLUTCH API] Fetch (${actionName}) error:`, err);
  }

  return {
    success: true,
    data: fallbackData,
    meta: {
      source: "API",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function getTournamentStatus(): Promise<PublicApiResponse<TournamentStatusResponse>> {
  return safePublicFetch<TournamentStatusResponse>(
    "getTournamentStatus",
    API_ENDPOINTS.tournamentStatus,
    {},
    MOCK_TOURNAMENT_STATUS
  );
}

export async function getPublicGames(): Promise<PublicApiResponse<GameConfig[]>> {
  const gamesList = Object.values(GAMES_CONFIG);
  return safePublicFetch<GameConfig[]>(
    "getGames",
    API_ENDPOINTS.games,
    {},
    gamesList
  );
}

export async function getLeaderboard(
  gameId: GameId
): Promise<PublicApiResponse<FreeFireLeaderboardEntry[] | BgmiLeaderboardEntry[] | any[]>> {
  return safePublicFetch<any[]>(
    "getLeaderboard",
    API_ENDPOINTS.leaderboardsByGame(gameId),
    { game: gameId },
    []
  );
}

export async function getMatches(
  gameId?: GameId
): Promise<PublicApiResponse<any[]>> {
  const endpoint = gameId ? API_ENDPOINTS.matchesByGame(gameId) : API_ENDPOINTS.results;
  return safePublicFetch<any[]>(
    "getMatchHistory",
    endpoint,
    gameId ? { game: gameId } : {},
    []
  );
}

export async function getWinners(): Promise<PublicApiResponse<GameWinner[]>> {
  return safePublicFetch<GameWinner[]>(
    "getWinners",
    API_ENDPOINTS.winners,
    {},
    MOCK_GAME_WINNERS
  );
}
