import { NextResponse } from "next/server";
import { getGameLeaderboardAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const games: GameId[] = ["FREE_FIRE", "BGMI", "VALORANT", "EFOOTBALL", "MATIKS"];
  const winners: any[] = [];

  for (const g of games) {
    const list = await getGameLeaderboardAsync(g);
    if (list && list.length > 0) {
      winners.push({
        gameId: g,
        game_id: g,
        gameName: g.replace("_", " "),
        champion: list[0].teamName,
        winner: list[0].teamName,
        totalPoints: list[0].totalPoints,
        killPoints: list[0].killPoints,
        matchesPlayed: list[0].matchesPlayed,
        runnerUp: list[1]?.teamName || "TBD",
        thirdPlace: list[2]?.teamName || "TBD",
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: winners,
    meta: { source: "INTERNAL_STORE", approvedOnly: true, timestamp: new Date().toISOString() },
  });
}
