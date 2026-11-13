import { NextRequest, NextResponse } from "next/server";
import {
  MOCK_FIFA_MATCHES,
  MOCK_MATIKS_RESULTS,
  MOCK_GENERIC_MATCHES,
} from "@/lib/mock-data";

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  const game = params.game?.toUpperCase().replace(/-/g, "_");

  if (game === "FIFA") {
    return NextResponse.json({
      success: true,
      data: MOCK_FIFA_MATCHES,
      meta: {
        source: "VERIFIED_FIXTURE",
        approvedOnly: true,
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (game === "MATIKS") {
    return NextResponse.json({
      success: true,
      data: MOCK_MATIKS_RESULTS,
      meta: {
        source: "VERIFIED_FIXTURE",
        approvedOnly: true,
        timestamp: new Date().toISOString(),
      },
    });
  }

  const filtered = MOCK_GENERIC_MATCHES.filter((m) => m.game_id === game);
  return NextResponse.json({
    success: true,
    data: filtered,
    meta: {
      source: "VERIFIED_FIXTURE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
