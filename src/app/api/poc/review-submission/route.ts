import { NextRequest, NextResponse } from "next/server";
import { reviewMatchSubmission } from "@/lib/tournament-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, action, adminPassword, rejectionReason } = body as {
      submissionId: string;
      action: "APPROVE" | "REJECT";
      adminPassword: string;
      rejectionReason?: string;
    };

    if (!submissionId || !action || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Submission ID, action (APPROVE/REJECT), and Super Admin password are required." },
        { status: 400 }
      );
    }

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { success: false, error: "Action must be either APPROVE or REJECT." },
        { status: 400 }
      );
    }

    const res = reviewMatchSubmission({
      submissionId,
      action,
      adminPassword,
      rejectionReason,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      message:
        action === "APPROVE"
          ? "Submission approved! Points accumulated and published live to dashboard."
          : "Submission rejected. Leaderboard unchanged.",
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
