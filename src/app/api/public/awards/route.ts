import { isCampusGameEnabled } from "@/lib/campus-games";
import { NextRequest, NextResponse } from "next/server";
import { getAwardsAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = (searchParams.get("gameId") || "FREE_FIRE") as GameId;
    const campusId = searchParams.get("campusId") || "mangalore";

    if(!isCampusGameEnabled(campusId,gameId)) return NextResponse.json({success:false,error:"This game is not enabled for this campus."},{status:400});
    const awards = await getAwardsAsync(gameId, campusId);

    return NextResponse.json(
      {
        success: true,
        gameId,
        campusId,
        awards,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch awards." }, { status: 500 });
  }
}

