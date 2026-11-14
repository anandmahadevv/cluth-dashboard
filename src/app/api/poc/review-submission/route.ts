import { NextRequest, NextResponse } from "next/server";
import { reviewMatchSubmissionAsync } from "@/lib/tournament-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, action, adminPassword, rejectionReason } = body as {
      submissionId: string;
      action: "APPROVE" | "REJECT" | "UNDO" | "DELETE";
      adminPassword: string;
      rejectionReason?: string;
    };

    if (!submissionId || !action || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Submission ID, action (APPROVE/REJECT/UNDO/DELETE), and Super Admin password are required." },
        { status: 400 }
      );
    }

    const validActions = ["APPROVE", "REJECT", "UNDO", "DELETE"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be APPROVE, REJECT, UNDO, or DELETE." },
        { status: 400 }
      );
    }

    const res = await reviewMatchSubmissionAsync({
      submissionId,
      action,
      adminPassword,
      rejectionReason,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    const message =
      action === "APPROVE"
        ? "Submission approved! Points accumulated and published live to dashboard."
        : action === "UNDO"
        ? "Approval undone! Points rolled back and submission returned to Pending review."
        : action === "DELETE"
        ? "Submission permanently deleted and team scores recalculated."
        : "Submission rejected. Standings unchanged.";

    return NextResponse.json({
      success: true,
      action,
      message,
      match: res.match,
      leaderboard: res.leaderboard,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Error reviewing submission: " + (err.message || err) },
      { status: 500 }
    );
  }
}

