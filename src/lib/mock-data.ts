import {
  TournamentStatusResponse,
  FreeFireLeaderboardEntry,
  BgmiLeaderboardEntry,
  GameWinner,
} from "@/types";
import { EVENT_DETAILS } from "./constants";

/**
 * Default fallback schemas for CLUTCH 2026.
 * Production data is served live from Supabase.
 */

export const MOCK_TOURNAMENT_STATUS: TournamentStatusResponse = {
  eventName: EVENT_DETAILS.title,
  edition: EVENT_DETAILS.edition,
  venue: EVENT_DETAILS.venue,
  eventDate: EVENT_DETAILS.dateFormatted,
  status: "Completed",
  statusMessage: "Official championship concluded. Final standings ratified by Super Admin.",
  totalGames: 5,
  matchesCompleted: 4,
  approvedResultsCount: 4,
  totalParticipatingTeams: 36,
  lastUpdated: new Date().toISOString(),
};

export const MOCK_FREE_FIRE_LEADERBOARD: FreeFireLeaderboardEntry[] = [];
export const MOCK_BGMI_LEADERBOARD: BgmiLeaderboardEntry[] = [];
export const MOCK_GAME_WINNERS: GameWinner[] = [];
