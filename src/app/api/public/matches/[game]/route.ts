import { NextRequest, NextResponse } from "next/server";
import { getGameMatches } from "@/lib/tournament-store";
import { GameId } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  const rawGame = params.game?.toUpperCase().replace(/-/g, "_") as GameId;
  const matches = getGameMatches(rawGame);

  return NextResponse.json({
    success: true,
    data: matches,
    meta: {
      source: "INTERNAL_STORE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
