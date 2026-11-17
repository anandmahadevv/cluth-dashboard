import { NextRequest, NextResponse } from "next/server";
import { getGameLeaderboardAsync, getAwardsAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campusId = searchParams.get("campusId") || "mangalore";

  const games: GameId[] = ["FREE_FIRE", "BGMI", "VALORANT", "EFOOTBALL", "MATIKS"];
  const winners: any[] = [];

  for (const g of games) {
    const list = await getGameLeaderboardAsync(g, false, campusId);
    const awards = await getAwardsAsync(g, campusId);

    // If Admin/POC manually entered official winners, use them authoritatively
    if (awards?.winnerTeam && awards.winnerTeam.trim()) {
      winners.push({
        gameId: g,
        game_id: g,
        gameName: g === "FREE_FIRE" ? "Free Fire" : g.replace("_", " "),
        champion: awards.winnerTeam,
        winner: awards.winnerTeam,
        runnerUp: awards.runnerUpTeam || "TBD",
        thirdPlace: "TBD",
        totalPoints: 0,
        killPoints: 0,
        matchesPlayed: 0,
        isFinalized: true,
        firstPlace: {
          name: awards.winnerTeam,
          pointsOrScore: awards.winnerScore || "1st Place (Gold)",
          subtext: "Winner Cup",
        },
        secondPlace: awards.runnerUpTeam
          ? {
              name: awards.runnerUpTeam,
              pointsOrScore: awards.runnerUpScore || "2nd Place (Silver)",
              subtext: "Runner-Up Cup",
            }
          : undefined,
      });
      continue;
    }

    // Otherwise check if live match scores exist
    const hasLiveScores = list && list.some(
      (e) => (e.totalPoints && e.totalPoints > 0) || (e.matchesPlayed && e.matchesPlayed > 0)
    );

    if (list && list.length > 0 && hasLiveScores) {
      winners.push({
        gameId: g,
        game_id: g,
        gameName: g === "FREE_FIRE" ? "Free Fire" : g.replace("_", " "),
        champion: list[0].teamName,
        winner: list[0].teamName,
        totalPoints: list[0].totalPoints,
        killPoints: list[0].killPoints,
        matchesPlayed: list[0].matchesPlayed,
        runnerUp: list[1]?.teamName,
        isFinalized: true,
        firstPlace: {
          name: list[0].teamName,
          pointsOrScore: `${list[0].totalPoints} pts`,
          subtext: "Rank 1",
        },
        secondPlace: list[1]
          ? {
              name: list[1].teamName,
              pointsOrScore: `${list[1].totalPoints} pts`,
              subtext: "Rank 2",
            }
          : undefined,
        thirdPlace: list[2]
          ? {
              name: list[2].teamName,
              pointsOrScore: `${list[2].totalPoints} pts`,
              subtext: "Rank 3",
            }
          : undefined,
      });
    }
  }

  return NextResponse.json({
    success: true,
    campusId,
    data: winners,
    meta: { source: "INTERNAL_STORE", approvedOnly: true, timestamp: new Date().toISOString() },
  });
}
