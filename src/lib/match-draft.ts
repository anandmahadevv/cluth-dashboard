export interface MatchDraftResult {
  teamId: string;
  placement: number;
  placementPoints: number;
  kills: number;
}

/** The review screen and submission use this same ordered set of results. */
export function buildMatchDraftResults(
  orderedIds: string[],
  scores: Record<string, { placement: number; placementPoints: number; kills: number }>
): MatchDraftResult[] {
  return orderedIds.map((teamId, index) => ({
    teamId,
    placement: scores[teamId]?.placement ?? index + 1,
    placementPoints: scores[teamId]?.placementPoints ?? 0,
    kills: scores[teamId]?.kills ?? 0,
  }));
}

export function totalDraftPoints(results: MatchDraftResult[]): number {
  return results.reduce((total, result) => total + result.placementPoints + result.kills, 0);
}
