import { NextRequest, NextResponse } from "next/server";
import { reviewAwardsSubmissionAsync } from "@/lib/tournament-store";

export const dynamic = "force-dynamic";

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
        { success: false, error: "submissionId, action, and adminPassword are required." },
        { status: 400 }
      );
    }

    const result = await reviewAwardsSubmissionAsync({
      submissionId,
      action,
      adminPassword,
      rejectionReason,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      submission: result.submission,
      awards: result.awards,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to review awards submission." },
      { status: 500 }
    );
  }
}
