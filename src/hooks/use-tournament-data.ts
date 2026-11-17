"use client";

import { useCallback } from "react";
import { usePolling } from "./use-polling";
import {
  getTournamentStatus,
  getPublicGames,
  getLeaderboard,
  getMatches,
  getWinners,
  getAwards,
} from "@/lib/api";
import { GameId } from "@/types";

export function useTournamentStatus(campusId?: string) {
  const fetcher = useCallback(() => getTournamentStatus(campusId), [campusId]);
  return usePolling(fetcher, undefined, { key: `status-${campusId || "mangalore"}` });
}

export function usePublicGames() {
  return usePolling(getPublicGames, undefined, { key: "games-config" });
}

export function useGameLeaderboard(gameId: GameId, campusId?: string) {
  const fetcher = useCallback(() => getLeaderboard(gameId, campusId), [gameId, campusId]);
  return usePolling(fetcher, undefined, { key: `leaderboard-${gameId}-${campusId || "mangalore"}` });
}

export function useGameMatches(gameId?: GameId, campusId?: string) {
  const fetcher = useCallback(() => getMatches(gameId, campusId), [gameId, campusId]);
  return usePolling(fetcher, undefined, { key: `matches-${gameId || "all"}-${campusId || "all"}` });
}

export function useTournamentWinners(campusId?: string) {
  const fetcher = useCallback(() => getWinners(campusId), [campusId]);
  return usePolling(fetcher, undefined, { key: `winners-${campusId || "mangalore"}` });
}

export function useGameAwards(gameId: GameId = "FREE_FIRE", campusId?: string) {
  const fetcher = useCallback(() => getAwards(gameId, campusId), [gameId, campusId]);
  return usePolling(fetcher, undefined, { key: `awards-${gameId}-${campusId || "mangalore"}` });
}
