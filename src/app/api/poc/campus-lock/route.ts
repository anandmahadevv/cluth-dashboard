import { NextRequest, NextResponse } from "next/server";
import {
  getStoreAsync,
  toggleCampusLockAsync,
  isCampusLocked,
} from "@/lib/tournament-store";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";

export const dynamic = "force-dynamic";

// GET /api/poc/campus-lock?campusId=mangalore
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");

    const store = await getStoreAsync();

    if (campusId) {
      const locked = isCampusLocked(store, campusId);
      return NextResponse.json({
        success: true,
        campusId,
        isLocked: locked,
      });
    }

    const locks: Record<string, boolean> = {};
    for (const key of Object.keys(CAMPUSES_REGISTRY)) {
      locks[key] = isCampusLocked(store, key);
    }

    return NextResponse.json({
      success: true,
      locks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch lock status" },
      { status: 500 }
    );
  }
}

// POST /api/poc/campus-lock (Toggle Lock)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campusId, isLocked, adminPassword, pocCode } = body as {
      campusId: string;
      isLocked: boolean;
      adminPassword?: string;
      pocCode?: string;
    };

    if (!campusId || isLocked === undefined) {
      return NextResponse.json(
        { success: false, error: "campusId and isLocked boolean are required." },
        { status: 400 }
      );
    }

    const result = await toggleCampusLockAsync({
      campusId,
      isLocked,
      adminPassword,
      pocCode,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      campusId,
      isLocked: result.isLocked,
      message: `Campus "${campusId}" is now ${isLocked ? "LOCKED (Read-Only)" : "UNLOCKED (Open for submissions)"}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update campus lock" },
      { status: 500 }
    );
  }
}

