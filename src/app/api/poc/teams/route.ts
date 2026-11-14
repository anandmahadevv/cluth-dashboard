import { NextRequest, NextResponse } from "next/server";
import {
  getGameLeaderboardAsync,
  addTeamToGameAsync,
  removeTeamFromGameAsync,
  updateTeamNameAsync,
  toggleTeamVisibilityAsync,
} from "@/lib/tournament-store";
import { GameId } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/poc/teams?gameId=FREE_FIRE&includeHidden=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") as GameId;
    const includeHidden = searchParams.get("includeHidden") !== "false";

    if (!gameId) {
      return NextResponse.json({ success: false, error: "gameId is required." }, { status: 400 });
    }

    const teams = await getGameLeaderboardAsync(gameId, includeHidden);
    return NextResponse.json({ success: true, gameId, teams });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch teams." }, { status: 500 });
  }
}

// POST /api/poc/teams (Add Team)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, teamName, adminPassword } = body as {
      gameId: GameId;
      teamName: string;
      adminPassword?: string;
    };

    if (!gameId || !teamName) {
      return NextResponse.json(
        { success: false, error: "gameId and teamName are required." },
        { status: 400 }
      );
    }

    const result = await addTeamToGameAsync({ gameId, teamName, adminPassword });
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
    const { gameId, teamId, newTeamName, adminPassword } = body as {
      gameId: GameId;
      teamId: string;
      newTeamName: string;
      adminPassword?: string;
    };

    if (!gameId || !teamId || !newTeamName) {
      return NextResponse.json(
        { success: false, error: "gameId, teamId, and newTeamName are required." },
        { status: 400 }
      );
    }

    const result = await updateTeamNameAsync({ gameId, teamId, newTeamName, adminPassword });
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
    const { gameId, teamId, adminPassword } = body as {
      gameId: GameId;
      teamId: string;
      adminPassword?: string;
    };

    if (!gameId || !teamId) {
      return NextResponse.json(
        { success: false, error: "gameId and teamId are required." },
        { status: 400 }
      );
    }

    const result = await removeTeamFromGameAsync({ gameId, teamId, adminPassword });
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

// PATCH /api/poc/teams (Toggle Team Hidden/Visible)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, teamId, hidden, adminPassword } = body as {
      gameId: GameId;
      teamId: string;
      hidden?: boolean;
      adminPassword?: string;
    };

    if (!gameId || !teamId) {
      return NextResponse.json(
        { success: false, error: "gameId and teamId are required." },
        { status: 400 }
      );
    }

    const result = await toggleTeamVisibilityAsync({ gameId, teamId, hidden, adminPassword });
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
    return NextResponse.json({ success: false, error: err.message || "Failed to toggle team visibility." }, { status: 500 });
  }
}

