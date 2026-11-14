import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissions, SubmissionStatus } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game") as GameId | null;
    const status = searchParams.get("status") as SubmissionStatus | "ALL" | null;

    const submissions = getAllSubmissions({
      gameId: game || undefined,
      status: status || undefined,
    });

    const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

    return NextResponse.json({
      success: true,
      count: submissions.length,
      pendingCount,
      submissions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions: " + (err.message || err) },
      { status: 500 }
    );
  }
}
