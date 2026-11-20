import { getCampusGameIds, isCampusGameEnabled } from "@/lib/campus-games";
import { NextRequest, NextResponse } from "next/server";
import { getStoreAsync } from "@/lib/tournament-store";
import { resolveAdminAccess } from "@/lib/tournament-access";
import { GAMES_CONFIG } from "@/lib/constants";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const { code, gameId, campusId } = await req.json();
    if (typeof code !== "string" || typeof gameId !== "string" || !Object.prototype.hasOwnProperty.call(GAMES_CONFIG, gameId)) {
      return NextResponse.json({ success: false, error: "A valid game and verification code are required." }, { status: 400, headers });
    }
    const store = await getStoreAsync();
    const access = resolveAdminAccess(code, store.campusPasskeys);
    if (!access.isValid) return NextResponse.json({ success: false, error: "Sign in again to view match status." }, { status: 401, headers });
    if (!access.isSuperAdmin && access.gameId !== "ALL" && access.gameId !== gameId) {
      return NextResponse.json({ success: false, error: "This game is outside your assigned access." }, { status: 403, headers });
    }
    const effectiveCampus = access.isSuperAdmin ? campusId || "mangalore" : access.campusId || "mangalore";
    if(!isCampusGameEnabled(effectiveCampus,gameId)) return NextResponse.json({success:false,error:"This game is not enabled for your campus."},{status:400,headers});
    const submissions = store.matches
      .filter(m => (m.campusId || "mangalore") === effectiveCampus && m.gameId === gameId as GameId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return NextResponse.json({ success: true,
      counts: { pending: submissions.filter(m => m.status === "PENDING").length,
        approved: submissions.filter(m => m.status === "APPROVED").length,
        rejected: submissions.filter(m => m.status === "REJECTED").length },
      submissions: submissions.slice(0, 20).map(m => ({ id: m.id, matchNumber: m.matchNumber, timestamp: m.timestamp,
        status: m.status, reviewedAt: m.reviewedAt, rejectionReason: m.rejectionReason,
        teamCount: m.teamResults.length })),
    }, { headers });
  } catch {
    return NextResponse.json({ success: false, error: "Could not load match status. Please retry." }, { status: 500, headers });
  }
}
