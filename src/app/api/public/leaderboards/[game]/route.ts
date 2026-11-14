import { NextRequest, NextResponse } from "next/server";
import { getGameLeaderboardAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  const rawGame = params.game?.toUpperCase().replace(/-/g, "_") as GameId;
  const validGames: GameId[] = ["FREE_FIRE", "BGMI", "FIFA", "MATIKS"];
  const game = validGames.includes(rawGame) ? rawGame : "FREE_FIRE";

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
