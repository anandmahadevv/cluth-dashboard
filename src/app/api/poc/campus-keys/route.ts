import { NextRequest, NextResponse } from "next/server";
import {
  getCampusPasskeysAsync,
  getAllCampusPasskeysAsync,
  saveCampusPasskeysAsync,
  regenerateCampusPasskeysAsync,
} from "@/lib/tournament-store";
import { CampusPasskeys } from "@/lib/tournament-constants";

export const dynamic = "force-dynamic";

// GET /api/poc/campus-keys?campusId=kanyakumari
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campusId = searchParams.get("campusId");

    if (campusId) {
      const passkeys = await getCampusPasskeysAsync(campusId);
      return NextResponse.json({
        success: true,
        campusId,
        passkeys,
      });
    }

    const allKeys = await getAllCampusPasskeysAsync();
    return NextResponse.json({
      success: true,
      allKeys,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch campus passkeys" },
      { status: 500 }
    );
  }
}

// POST /api/poc/campus-keys (Save customized passkeys and game UIDs)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campusId, passkeys, adminPassword, pocCode } = body as {
      campusId: string;
      passkeys: CampusPasskeys;
      adminPassword?: string;
      pocCode?: string;
    };

    if (!campusId || !passkeys) {
      return NextResponse.json(
        { success: false, error: "campusId and passkeys payload are required." },
        { status: 400 }
      );
    }

    const result = await saveCampusPasskeysAsync({
      campusId,
      passkeys,
      adminPassword,
      pocCode,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      campusId,
      passkeys: result.passkeys,
      message: `Passkeys and game UIDs for ${campusId} updated successfully!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save passkeys" },
      { status: 500 }
    );
  }
}

// PUT /api/poc/campus-keys (Regenerate fresh distinct random UIDs)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { campusId, adminPassword, pocCode } = body as {
      campusId: string;
      adminPassword?: string;
      pocCode?: string;
    };

    if (!campusId) {
      return NextResponse.json(
        { success: false, error: "campusId is required." },
        { status: 400 }
      );
    }

    const result = await regenerateCampusPasskeysAsync({
      campusId,
      adminPassword,
      pocCode,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      campusId,
      passkeys: result.passkeys,
      message: `Generated fresh unique UIDs for all games in ${campusId}!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to regenerate UIDs" },
      { status: 500 }
    );
  }
}

