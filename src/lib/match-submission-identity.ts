import { createHash } from "crypto";

interface SubmissionInput {
  campusId?: string;
  gameId: string;
  matchNumber: number | string;
  proofUrl: string;
  notes?: string;
  teamResults: { teamId: string; placement: number; placementPoints?: number; kills?: number }[];
}
export function matchSubmissionIdentity(input: SubmissionInput) {
  const results = input.teamResults.map(r => ({ teamId: r.teamId, placement: r.placement,
    placementPoints: r.placementPoints ?? 0, kills: r.kills ?? 0 })).sort((a,b) => a.teamId.localeCompare(b.teamId));
  const roundKey = JSON.stringify([input.campusId || "mangalore", input.gameId, String(input.matchNumber).trim(), results.map(r => r.teamId)]);
  const fingerprint = createHash("sha256").update(JSON.stringify([roundKey, results, input.proofUrl, input.notes || ""])).digest("hex");
  return { roundKey, fingerprint };
}
