"use client";

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
  return usePolling(() => getLeaderboard(gameId));
}

export function useGameMatches(gameId?: GameId) {
  return usePolling(() => getMatches(gameId));
}

export function useTournamentWinners() {
  return usePolling(getWinners);
}

export function useGameAwards(gameId: GameId = "FREE_FIRE") {
  return usePolling(() => getAwards(gameId));
}
