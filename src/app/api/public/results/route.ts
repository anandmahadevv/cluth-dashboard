import { NextResponse } from "next/server";
import { getGameMatches } from "@/lib/tournament-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const matches = getGameMatches(undefined, true);

  // Flatten approved match results for spectator table
  const flattened: any[] = [];
  matches.forEach((m) => {
    (m.teamResults || []).forEach((t) => {
      flattened.push({
        result_id: `${m.id}-${t.teamId}`,
        match_id: `M#${m.matchNumber}`,
        match_number: m.matchNumber,
        game_id: m.gameId,
        gameId: m.gameId,
        team_name: t.teamName,
        player_name: t.teamName,
        result_text: `Rank #${t.placement}`,
        score_data: {
          total_points: t.matchPoints,
          kill_points: t.kills,
          placement_points: t.placementPoints,
        },
        proof_url: m.proofUrl,
        timestamp: m.timestamp,
        status: "Approved",
      });
    });
  });

  return NextResponse.json({
    success: true,
    data: flattened,
    meta: { source: "INTERNAL_STORE", approvedOnly: true, timestamp: new Date().toISOString() },
  });
}
