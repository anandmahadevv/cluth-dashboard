import { NextRequest, NextResponse } from "next/server";
import { saveAwardsAsync } from "@/lib/tournament-store";
import { GameId, IndividualAwards } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, awards, pocCode, adminPassword } = body as {
      gameId: GameId;
      awards: IndividualAwards;
      pocCode?: string;
      adminPassword?: string;
    };

    if (!gameId || !awards) {
      return NextResponse.json(
        { success: false, error: "gameId and awards payload are required." },
        { status: 400 }
      );
    }

    const result = await saveAwardsAsync({
      gameId,
      awards,
      pocCode,
      adminPassword,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      awards: result.awards,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to save awards." }, { status: 500 });
  }
}

