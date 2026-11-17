import { NextRequest, NextResponse } from "next/server";
import {
  getGameLeaderboardAsync,
  addTeamToGameAsync,
  removeTeamFromGameAsync,
  updateTeamNameAsync,
  toggleTeamVisibilityAsync,
  toggleTeamQualifiedAsync,
} from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/poc/teams?gameId=FREE_FIRE&includeHidden=true&campusId=mangalore
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") as GameId;
    const includeHidden = searchParams.get("includeHidden") !== "false";
    const campusId = searchParams.get("campusId") || "mangalore";

    if (!gameId) {
      return NextResponse.json({ success: false, error: "gameId is required." }, { status: 400 });
    }

    const teams = await getGameLeaderboardAsync(gameId, includeHidden, campusId);
    return NextResponse.json({ success: true, gameId, campusId, teams });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch teams." }, { status: 500 });
  }
}

// POST /api/poc/teams (Add Team)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, teamName, campusId, adminPassword, pocCode } = body as {
      gameId: GameId;
      teamName: string;
      campusId?: string;
      adminPassword?: string;
      pocCode?: string;
    };

    if (!gameId || !teamName) {
      return NextResponse.json(
        { success: false, error: "gameId and teamName are required." },
        { status: 400 }
      );
    }

    const result = await addTeamToGameAsync({
      gameId,
      teamName,
      campusId: campusId || "mangalore",
      adminPassword,
      pocCode,
    });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Team "${teamName}" added successfully to ${gameId}.`,
      team: result.team,
      teams: result.teams,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to add team." }, { status: 500 });
  }
}

// PUT /api/poc/teams (Edit Team Name)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, teamId, newTeamName, campusId, adminPassword, pocCode } = body as {
      gameId: GameId;
      teamId: string;
      newTeamName: string;
      campusId?: string;
      adminPassword?: string;
      pocCode?: string;
    };

    if (!gameId || !teamId || !newTeamName) {
      return NextResponse.json(
        { success: false, error: "gameId, teamId, and newTeamName are required." },
        { status: 400 }
      );
    }

    const result = await updateTeamNameAsync({
      gameId,
      teamId,
      newTeamName,
      campusId: campusId || "mangalore",
      adminPassword,
      pocCode,
    });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Team renamed to "${newTeamName}" successfully.`,
      team: result.team,
      teams: result.teams,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to edit team name." }, { status: 500 });
  }
}

// DELETE /api/poc/teams (Remove Team)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, teamId, campusId, adminPassword, pocCode } = body as {
      gameId: GameId;
      teamId: string;
      campusId?: string;
      adminPassword?: string;
      pocCode?: string;
    };

    if (!gameId || !teamId) {
      return NextResponse.json(
        { success: false, error: "gameId and teamId are required." },
        { status: 400 }
      );
    }

    const result = await removeTeamFromGameAsync({
      gameId,
      teamId,
      campusId: campusId || "mangalore",
      adminPassword,
      pocCode,
    });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Team removed successfully from roster.",
      teams: result.teams,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to remove team." }, { status: 500 });
  }
}

// PATCH /api/poc/teams (Toggle Team Hidden/Visible OR Toggle Qualified Status)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, teamId, hidden, qualified, action, campusId, pocCode, adminPassword } = body as {
      gameId: GameId;
      teamId: string;
      hidden?: boolean;
      qualified?: boolean;
      action?: "TOGGLE_VISIBILITY" | "TOGGLE_QUALIFIED";
      campusId?: string;
      pocCode?: string;
      adminPassword?: string;
    };

    if (!gameId || !teamId) {
      return NextResponse.json(
        { success: false, error: "gameId and teamId are required." },
        { status: 400 }
      );
    }

    // Toggle Qualified Status for Finals (Q mark)
    if (action === "TOGGLE_QUALIFIED" || qualified !== undefined) {
      const result = await toggleTeamQualifiedAsync({
        gameId,
        teamId,
        campusId: campusId || "mangalore",
        qualified,
        pocCode,
        adminPassword,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        team: result.team,
        teams: result.teams,
      });
    }

    // Toggle Public Visibility (Hide / Unhide)
    const result = await toggleTeamVisibilityAsync({
      gameId,
      teamId,
      campusId: campusId || "mangalore",
      hidden,
      adminPassword,
      pocCode,
    });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      team: result.team,
      teams: result.teams,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to update team." }, { status: 500 });
  }
}
