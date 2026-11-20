import type { GameId } from "@/types";
export const ALL_GAME_IDS: readonly GameId[] = ["FREE_FIRE","BGMI","VALORANT","EFOOTBALL","MATIKS","COD"];
const MANGALORE_GAMES: readonly GameId[] = ["FREE_FIRE","BGMI","VALORANT","EFOOTBALL","MATIKS"];
const OTHER_CAMPUS_GAMES: readonly GameId[] = ["FREE_FIRE","BGMI","COD","MATIKS"];
export function getCampusGameIds(campusId = "mangalore"): readonly GameId[] {
  return campusId === "mangalore" ? MANGALORE_GAMES : OTHER_CAMPUS_GAMES;
}
export function isCampusGameEnabled(campusId: string | undefined, gameId: string): gameId is GameId {
  return (getCampusGameIds(campusId) as readonly string[]).includes(gameId);
}
