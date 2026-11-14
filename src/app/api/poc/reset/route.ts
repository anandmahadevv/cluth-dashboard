import { NextRequest, NextResponse } from "next/server";
import { resetGameScoresAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, gameId } = body as { code: string; gameId?: GameId | "ALL" };

    if (!code) {
      return NextResponse.json({ success: false, error: "Super Admin code is required." }, { status: 400 });
    }

    const res = await resetGameScoresAsync(code, gameId);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: `Scores reset successfully for ${gameId || "ALL"}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Reset failed" }, { status: 500 });
  }
}

