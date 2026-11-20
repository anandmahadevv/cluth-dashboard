import { isCampusGameEnabled } from "@/lib/campus-games";
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
  if(!isCampusGameEnabled(campusId,rawGame)) return NextResponse.json({success:false,error:"This game is not enabled for this campus."},{status:400});
  const game=rawGame as GameId;

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
