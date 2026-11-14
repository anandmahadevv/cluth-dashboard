import { NextRequest, NextResponse } from "next/server";
import { verifyGameCode, getGameLeaderboard } from "@/lib/tournament-store";
import { GameId } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, gameId } = body as { code: string; gameId?: GameId };

    if (!code) {
      return NextResponse.json({ success: false, error: "Please enter your game verification code." }, { status: 400 });
    }

    const check = verifyGameCode(code, gameId);
    if (!check.valid || !check.gameId) {
      return NextResponse.json({ success: false, error: check.error || "Invalid code." }, { status: 401 });
    }

    const currentTeams = getGameLeaderboard(check.gameId);

    return NextResponse.json({
      success: true,
      gameId: check.gameId,
      teams: currentTeams,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Authentication failed" }, { status: 500 });
  }
}

