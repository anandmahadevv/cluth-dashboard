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

export function useGameLeaderboard(gameId: GameId) {
  const fetcher = useCallback(() => getLeaderboard(gameId), [gameId]);
  return usePolling(fetcher);
}

export function useGameMatches(gameId?: GameId) {
  const fetcher = useCallback(() => getMatches(gameId), [gameId]);
  return usePolling(fetcher);
}

export function useTournamentWinners() {
  return usePolling(getWinners);
}

export function useGameAwards(gameId: GameId = "FREE_FIRE") {
  const fetcher = useCallback(() => getAwards(gameId), [gameId]);
  return usePolling(fetcher);
}
