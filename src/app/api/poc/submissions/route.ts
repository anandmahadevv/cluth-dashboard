import { verifyAdminPassword } from "@/lib/tournament-store";
import { NextRequest, NextResponse } from "next/server";
import { getAllSubmissionsAsync, SubmissionStatus } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  if(!verifyAdminPassword(req.headers.get("x-admin-password") || "")) return NextResponse.json({success:false,error:"Super Admin access required."},{status:401,headers:{"Cache-Control":"no-store"}});
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game") as GameId | null;
    const status = searchParams.get("status") as SubmissionStatus | "ALL" | null;
    const campusId = searchParams.get("campusId") || undefined;

    const submissions = await getAllSubmissionsAsync({
      gameId: game || undefined,
      status: status || undefined,
      campusId,
    });

    const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

    return NextResponse.json(
      {
        success: true,
        count: submissions.length,
        pendingCount,
        submissions: submissions.map(({pocCode:_code,...safe})=>safe),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions: " + (err.message || err) },
      { status: 500 }
    );
  }
}

