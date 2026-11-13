import { NextRequest, NextResponse } from "next/server";
import {
  MOCK_FREE_FIRE_LEADERBOARD,
  MOCK_BGMI_LEADERBOARD,
  MOCK_FIFA_MATCHES,
  MOCK_MATIKS_RESULTS,
} from "@/lib/mock-data";

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  const game = params.game?.toUpperCase().replace(/-/g, "_");

  let data: any[] = [];
  if (game === "FREE_FIRE") data = MOCK_FREE_FIRE_LEADERBOARD;
  else if (game === "BGMI") data = MOCK_BGMI_LEADERBOARD;
  else if (game === "FIFA") data = MOCK_FIFA_MATCHES;
  else if (game === "MATIKS") data = MOCK_MATIKS_RESULTS;

  return NextResponse.json({
    success: true,
    data,
    meta: {
      source: "VERIFIED_FIXTURE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
