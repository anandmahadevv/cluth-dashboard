import { NextRequest, NextResponse } from "next/server";
import { getGameLeaderboardAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  let rawGame = params.game?.toUpperCase().replace(/-/g, "_") as GameId | "FIFA";
  if (rawGame === "FIFA") rawGame = "EFOOTBALL";
  const validGames: GameId[] = ["FREE_FIRE", "BGMI", "VALORANT", "EFOOTBALL", "MATIKS"];
  const game: GameId = validGames.includes(rawGame as GameId) ? (rawGame as GameId) : "FREE_FIRE";

  const leaderboard = await getGameLeaderboardAsync(game);

  return NextResponse.json({
    success: true,
    data: leaderboard,
    meta: {
      source: "INTERNAL_STORE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
