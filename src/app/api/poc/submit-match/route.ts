import { NextRequest, NextResponse } from "next/server";
import { recordMatchSubmissionAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, pocCode, matchNumber, proofUrl, notes, autoApprove, teamResults } = body as {
      gameId: GameId;
      pocCode: string;
      matchNumber: number | string;
      proofUrl: string;
      notes?: string;
      autoApprove?: boolean;
      teamResults: {
        teamId: string;
        placement: number;
        placementPoints?: number;
        kills?: number;
      }[];
    };

    if (!gameId || !pocCode || !matchNumber) {
      return NextResponse.json(
        { success: false, error: "Game, verification code, and match number are required." },
        { status: 400 }
      );
    }

    if (!proofUrl) {
      return NextResponse.json(
        { success: false, error: "Evidence screenshot or proof link is required for verification." },
        { status: 400 }
      );
    }

    if (!teamResults || teamResults.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter points or ranks for the participating teams." },
        { status: 400 }
      );
    }

    const res = await recordMatchSubmissionAsync({
      gameId,
      pocCode,
      matchNumber,
      proofUrl,
      notes,
      autoApprove,
      teamResults,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      pending: res.pending,
      submissionId: res.submissionId,
      message: res.message || `Match ${matchNumber} processed successfully!`,
      leaderboard: res.leaderboard,
    });
  } catch (err: any) {
    console.error("Match submission error:", err);
    return NextResponse.json(
      { success: false, error: "Server error processing match submission: " + (err.message || err) },
      { status: 500 }
    );
  }
}

