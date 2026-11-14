import { NextRequest, NextResponse } from "next/server";
import { getGameMatchesAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { game: string } }
) {
  const rawGame = params.game?.toUpperCase().replace(/-/g, "_") as GameId;
  const matches = await getGameMatchesAsync(rawGame);

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
