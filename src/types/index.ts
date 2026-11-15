export type GameId = "FREE_FIRE" | "BGMI" | "VALORANT" | "EFOOTBALL" | "MATIKS";

export type TournamentStatus = "Upcoming" | "Live" | "Completed" | "upcoming" | "live" | "completed";

export type PublicResultStatus = "Approved" | "Published" | "approved" | "published";

export interface GameConfig {
  id: GameId;
  name: string;
  slug: string;
  badge: string;
  tagline: string;
  genre: string;
  format: string;
  color: string;
  icon?: string;
  accentGlow: string;
  bgGradient: string;
  bannerImage: string;
  rulesOverview: string;
  scoringFormat: string;
}

export interface TournamentStatusResponse {
  eventName: string;
  edition: string;
  venue: string;
  eventDate: string;
  status: TournamentStatus;
  statusMessage: string;
  totalGames: number;
  matchesCompleted: number;
  approvedResultsCount: number;
  totalParticipatingTeams?: number;
  lastUpdated: string;
}

export type TournamentInfo = TournamentStatusResponse;

export interface FreeFireLeaderboardEntry {
  rank: number;
  teamName: string;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  lastMatchRank?: number;
  hidden?: boolean;
  qualified?: boolean;
}

export interface BgmiLeaderboardEntry {
  rank: number;
  teamName: string;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  lastMatchRank?: number;
  hidden?: boolean;
}

export interface ValorantLeaderboardEntry {
  rank: number;
  teamName: string;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  lastMatchRank?: number;
  hidden?: boolean;
}

export interface EfootballLeaderboardEntry {
  rank: number;
  teamName: string;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  lastMatchRank?: number;
  hidden?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  team_name?: string;
  teamName?: string;
  matches_played?: number;
  matchesPlayed?: number;
  placement_points?: number;
  placementPoints?: number;
  kill_points?: number;
  killPoints?: number;
  total_points?: number;
  totalPoints?: number;
  lastMatchRank?: number;
  game_id?: GameId;
  hidden?: boolean;
  qualified?: boolean;
}

export interface FifaMatchResult {
  matchId: string;
  matchNumber: number;
  roundName: string;
  player1: string;
  player2: string;
  goals1: number;
  goals2: number;
  winner: string;
  isDraw: boolean;
  status: PublicResultStatus;
  playedAt: string;
  approvedAt: string;
}

export interface FifaMatch {
  match_id?: string;
  matchId?: string;
  match_number?: number;
  matchNumber?: number;
  roundName?: string;
  player1: string;
  player2: string;
  goals1: number;
  goals2: number;
  winner: string;
  status: string;
  isDraw?: boolean;
  playedAt?: string;
  approvedAt?: string;
}

export interface MatiksMatchResult {
  matchId: string;
  playerName: string;
  teamName?: string;
  round: string;
  score: number;
  formulaDetails?: string;
  matchResult: "Won" | "Lost" | "Qualified" | "Eliminated" | "Completed";
  position: number;
  status: PublicResultStatus;
  approvedAt: string;
}

export interface MatiksResult {
  match_id?: string;
  matchId?: string;
  player_name?: string;
  playerName?: string;
  team_name?: string;
  teamName?: string;
  round: string | number;
  score: number;
  result?: string;
  matchResult?: string;
  formulaDetails?: string;
  position: number;
  status?: string;
  approvedAt?: string;
}

export interface GenericMatchResult {
  result_id: string;
  game_id: GameId;
  match_id: string;
  match_number?: number;
  team_name?: string;
  player_name?: string;
  opponent_name?: string;
  score_data: {
    placement_points?: number;
    kill_points?: number;
    total_points?: number;
    goals_for?: number;
    goals_against?: number;
    score?: number;
    rank?: number;
    [key: string]: any;
  };
  result_text?: string;
  status: PublicResultStatus;
  approved_at: string;
  published_at?: string;
}

export type MatchResult = GenericMatchResult;

export interface GameWinner {
  gameId: GameId;
  gameName: string;
  isFinalized: boolean;
  firstPlace?: {
    name: string;
    pointsOrScore: string;
    subtext?: string;
  };
  secondPlace?: {
    name: string;
    pointsOrScore: string;
    subtext?: string;
  };
  thirdPlace?: {
    name: string;
    pointsOrScore: string;
    subtext?: string;
  };
  finalizedAt?: string;
  note?: string;
}

export interface Winner {
  game_id?: GameId;
  gameId?: GameId;
  gameName?: string;
  position?: 1 | 2 | 3;
  team_name?: string;
  final_score?: string | number;
  finalized?: boolean;
  isFinalized?: boolean;
  firstPlace?: { name: string; pointsOrScore: string; subtext?: string };
  secondPlace?: { name: string; pointsOrScore: string; subtext?: string };
  thirdPlace?: { name: string; pointsOrScore: string; subtext?: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  lastUpdated?: string | null;
}

export interface PublicApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    source: "API" | "CACHED_FALLBACK" | "VERIFIED_FIXTURE";
    approvedOnly: true;
    timestamp: string;
    cacheAgeSeconds?: number;
  };
  error?: string;
}
