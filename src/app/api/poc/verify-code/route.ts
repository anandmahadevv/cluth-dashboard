import { getCampusGameIds, isCampusGameEnabled } from "@/lib/campus-games";
import { NextRequest, NextResponse } from "next/server";
import {
  getGameLeaderboardAsync,
  getStoreAsync,
  isCampusLocked,
} from "@/lib/tournament-store";
import { resolveAdminAccess } from "@/lib/tournament-access";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, gameId, campusId } = body as {
      code: string;
      gameId?: GameId;
      campusId?: string;
    };

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Please enter your access or room verification code." },
        { status: 400 }
      );
    }

    const store = await getStoreAsync(true);
    const access = resolveAdminAccess(code, store.campusPasskeys);
    if (!access.isValid) {
      return NextResponse.json(
        { success: false, error: access.error || "Invalid verification code." },
        { status: 401 }
      );
    }
    const effectiveCampusId = access.isSuperAdmin
      ? campusId || "mangalore"
      : access.campusId || "mangalore";

    const targetGame: GameId =
      access.gameId && access.gameId !== "ALL"
        ? access.gameId
        : gameId || "FREE_FIRE";

    if(!isCampusGameEnabled(effectiveCampusId,targetGame)) return NextResponse.json({success:false,error:"This game is not enabled for the assigned campus."},{status:400});

    const locked = isCampusLocked(store, effectiveCampusId);
    const currentTeams = await getGameLeaderboardAsync(targetGame, true, effectiveCampusId);
    const campusMeta = CAMPUSES_REGISTRY[effectiveCampusId];

    return NextResponse.json(
      {
        success: true,
        gameId: targetGame,
        isSuperAdmin: access.isSuperAdmin,
        isCampusAdmin: !access.isSuperAdmin && access.gameId === "ALL",
        canSwitchCampus: access.isSuperAdmin,
        campusId: effectiveCampusId,
        campusName: campusMeta?.name || effectiveCampusId,
        isLocked: locked,
        teams: currentTeams,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
