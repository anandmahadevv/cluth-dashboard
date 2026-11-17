import { NextRequest, NextResponse } from "next/server";
import {
  saveAwardsAsync,
  getAwardsAsync,
  getLatestAwardsSubmissionAsync,
} from "@/lib/tournament-store";
import { GameId, IndividualAwards } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") as GameId;
    const campusId = searchParams.get("campusId") || "mangalore";

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: "gameId is required." },
        { status: 400 }
      );
    }

    const awards = await getAwardsAsync(gameId, campusId);
    const latestSubmission = await getLatestAwardsSubmissionAsync(campusId, gameId);

    return NextResponse.json({
      success: true,
      gameId,
      campusId,
      awards,
      latestSubmission,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch awards." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, awards, campusId, pocCode, adminPassword } = body as {
      gameId: GameId;
      awards: IndividualAwards;
      campusId?: string;
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
      campusId: campusId || "mangalore",
      pocCode,
      adminPassword,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      awards: result.awards,
      submission: result.submission,
      isPendingApproval: result.isPendingApproval || false,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to save awards." }, { status: 500 });
  }
}
