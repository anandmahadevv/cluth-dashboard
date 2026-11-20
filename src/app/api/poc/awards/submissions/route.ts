import { verifyAdminPassword } from "@/lib/tournament-store";
import { NextRequest, NextResponse } from "next/server";
import { getAwardsSubmissionsAsync } from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if(!verifyAdminPassword(req.headers.get("x-admin-password") || "")) return NextResponse.json({success:false,error:"Super Admin access required."},{status:401,headers:{"Cache-Control":"no-store"}});
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") as GameId | null;
    const campusId = searchParams.get("campusId") || undefined;
    const status = searchParams.get("status") as "PENDING" | "APPROVED" | "REJECTED" | "ALL" | null;

    const submissions = await getAwardsSubmissionsAsync({
      gameId: gameId || undefined,
      campusId: campusId || undefined,
      status: status || undefined,
    });

    const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

    return NextResponse.json({
      success: true,
      count: submissions.length,
      pendingCount,
      submissions: submissions.map(({pocCode:_code,...safe})=>safe),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch awards submissions." },
      { status: 500 }
    );
  }
}

