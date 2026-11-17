export interface PocDraft {
  version: 1;
  savedAt: number;
  matchNumber: number;
  notes: string;
  orderedTeamIds: string[];
  scores: Record<string, { placementPoints: number; kills: number }>;
}
export const pocDraftKey = (campus: string, game: string) => `clutch:poc-draft:v1:${campus}:${game}`;

// Treat browser storage as untrusted and restore only against the current roster.
export function parsePocDraft(raw: string | null, teamIds: string[], now = Date.now()): PocDraft | null {
  try {
    const d = JSON.parse(raw || "null");
    if (!d || d.version !== 1 || !Number.isFinite(d.savedAt) || now - d.savedAt > 7 * 86400000 || d.savedAt > now ||
      !Number.isSafeInteger(d.matchNumber) || d.matchNumber < 1 || typeof d.notes !== "string" || d.notes.length > 20000 ||
      !Array.isArray(d.orderedTeamIds) || d.orderedTeamIds.length !== teamIds.length ||
      new Set(d.orderedTeamIds).size !== teamIds.length || !d.orderedTeamIds.every((id: unknown) => typeof id === "string" && teamIds.includes(id)) ||
      !d.scores || !teamIds.every(id => [d.scores[id]?.placementPoints, d.scores[id]?.kills].every(n => typeof n === "number" && Number.isFinite(n) && n >= 0))) return null;
    return d as PocDraft;
  } catch { return null; }
}
