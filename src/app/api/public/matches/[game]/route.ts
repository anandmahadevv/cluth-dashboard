import { NextRequest, NextResponse } from "next/server";
import { getGameMatchesAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  const { searchParams } = new URL(req.url);
  const campusId = searchParams.get("campusId") || undefined;
  const rawGame = params.game?.toUpperCase().replace(/-/g, "_") as GameId;
  const matches = await getGameMatchesAsync(rawGame, true, campusId);

  return NextResponse.json({
    success: true,
    campusId,
    data: matches.map(m => ({id:m.id,campusId:m.campusId,gameId:m.gameId,matchNumber:m.matchNumber,
      timestamp:m.timestamp,status:m.status,reviewedAt:m.reviewedAt,proofUrl:m.proofUrl,teamResults:m.teamResults})),
    meta: {
      source: "INTERNAL_STORE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
