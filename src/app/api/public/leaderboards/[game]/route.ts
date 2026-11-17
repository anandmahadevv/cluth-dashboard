import { NextRequest, NextResponse } from "next/server";
import { getGameLeaderboardAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  const { searchParams } = new URL(req.url);
  const campusId = searchParams.get("campusId") || "mangalore";

  let rawGame = params.game?.toUpperCase().replace(/-/g, "_") as GameId | "FIFA";
  if (rawGame === "FIFA") rawGame = "EFOOTBALL";
  const validGames: GameId[] = ["FREE_FIRE", "BGMI", "VALORANT", "EFOOTBALL", "MATIKS"];
  const game: GameId = validGames.includes(rawGame as GameId) ? (rawGame as GameId) : "FREE_FIRE";

  const leaderboard = await getGameLeaderboardAsync(game, false, campusId);

  return NextResponse.json(
    {
      success: true,
      campusId,
      data: leaderboard,
      meta: {
        source: "INTERNAL_STORE",
        approvedOnly: true,
        timestamp: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=2, stale-while-revalidate=4",
      },
    }
  );
}
