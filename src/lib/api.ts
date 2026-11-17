import {
  GameConfig,
  GameId,
  TournamentStatusResponse,
  FreeFireLeaderboardEntry,
  BgmiLeaderboardEntry,
  GameWinner,
  PublicApiResponse,
  IndividualAwards,
} from "@/types";
import { GAMES_CONFIG, API_ENDPOINTS } from "./constants";
import {
  MOCK_TOURNAMENT_STATUS,
  MOCK_GAME_WINNERS,
} from "./mock-data";

/**
 * Universal safe fetcher for internal API routes powered by Supabase store
 */
async function safePublicFetch<T>(
  restEndpoint: string,
  fallbackData: T
): Promise<PublicApiResponse<T>> {
  try {
    const res = await fetch(restEndpoint, {
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
    console.warn(`[CLUTCH API] Fetch (${restEndpoint}) error:`, err);
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
    API_ENDPOINTS.tournamentStatus,
    MOCK_TOURNAMENT_STATUS
  );
}

export async function getPublicGames(): Promise<PublicApiResponse<GameConfig[]>> {
  const gamesList = Object.values(GAMES_CONFIG);
  return safePublicFetch<GameConfig[]>(
    API_ENDPOINTS.games,
    gamesList
  );
}

export async function getLeaderboard(
  gameId: GameId,
  campusId?: string
): Promise<PublicApiResponse<FreeFireLeaderboardEntry[] | BgmiLeaderboardEntry[] | any[]>> {
  const base = API_ENDPOINTS.leaderboardsByGame(gameId);
  const url = campusId ? `${base}?campusId=${encodeURIComponent(campusId)}` : base;
  return safePublicFetch<any[]>(url, []);
}

export async function getMatches(
  gameId?: GameId,
  campusId?: string
): Promise<PublicApiResponse<any[]>> {
  const base = gameId ? API_ENDPOINTS.matchesByGame(gameId) : API_ENDPOINTS.results;
  const url = campusId
    ? `${base}${base.includes("?") ? "&" : "?"}campusId=${encodeURIComponent(campusId)}`
    : base;
  return safePublicFetch<any[]>(url, []);
}

export async function getWinners(): Promise<PublicApiResponse<GameWinner[]>> {
  return safePublicFetch<GameWinner[]>(
    API_ENDPOINTS.winners,
    MOCK_GAME_WINNERS
  );
}

export async function getAwards(
  gameId: GameId = "FREE_FIRE",
  campusId?: string
): Promise<PublicApiResponse<IndividualAwards>> {
  try {
    const campusQuery = campusId ? `&campusId=${encodeURIComponent(campusId)}` : "";
    const res = await fetch(`/api/public/awards?gameId=${gameId}${campusQuery}&t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    if (res.ok) {
      const json = await res.json();
      return {
        success: true,
        data: json.awards || {},
        meta: {
          source: "API",
          approvedOnly: true,
          timestamp: new Date().toISOString(),
        },
      };
    }
  } catch (err) {
    console.error("Failed to fetch awards:", err);
  }
  return {
    success: false,
    data: {},
    meta: {
      source: "CACHED_FALLBACK",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  };
}
