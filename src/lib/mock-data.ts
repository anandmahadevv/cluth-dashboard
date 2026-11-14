import {
  TournamentStatusResponse,
  FreeFireLeaderboardEntry,
  BgmiLeaderboardEntry,
  FifaMatchResult,
  MatiksMatchResult,
  GenericMatchResult,
  GameWinner,
} from "@/types";
import { EVENT_DETAILS } from "./constants";

/**
 * Empty baseline schema. All data is dynamically fetched directly from Google Sheets.
 * No dummy or demo teams are loaded.
 */

export const MOCK_TOURNAMENT_STATUS: TournamentStatusResponse = {
  eventName: EVENT_DETAILS.title,
  edition: EVENT_DETAILS.edition,
  venue: EVENT_DETAILS.venue,
  eventDate: EVENT_DETAILS.dateFormatted,
  status: "Live",
  statusMessage: "Official live tournament stream. Waiting for match results from referees.",
  totalGames: 4,
  matchesCompleted: 0,
  approvedResultsCount: 0,
  totalParticipatingTeams: 0,
  lastUpdated: new Date().toISOString(),
};

export const MOCK_FREE_FIRE_LEADERBOARD: FreeFireLeaderboardEntry[] = [];
export const MOCK_BGMI_LEADERBOARD: BgmiLeaderboardEntry[] = [];
export const MOCK_FIFA_MATCHES: FifaMatchResult[] = [];
export const MOCK_MATIKS_RESULTS: MatiksMatchResult[] = [];
export const MOCK_GENERIC_MATCHES: GenericMatchResult[] = [];
export const MOCK_GAME_WINNERS: GameWinner[] = [];
