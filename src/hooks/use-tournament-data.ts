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

export function useTournamentStatus() {
  return usePolling(getTournamentStatus);
}

export function usePublicGames() {
  return usePolling(getPublicGames);
}

export function useGameLeaderboard(gameId: GameId, campusId?: string) {
  const fetcher = useCallback(() => getLeaderboard(gameId, campusId), [gameId, campusId]);
  return usePolling(fetcher);
}

export function useGameMatches(gameId?: GameId, campusId?: string) {
  const fetcher = useCallback(() => getMatches(gameId, campusId), [gameId, campusId]);
  return usePolling(fetcher);
}

export function useTournamentWinners() {
  return usePolling(getWinners);
}

export function useGameAwards(gameId: GameId = "FREE_FIRE", campusId?: string) {
  const fetcher = useCallback(() => getAwards(gameId, campusId), [gameId, campusId]);
  return usePolling(fetcher);
}
