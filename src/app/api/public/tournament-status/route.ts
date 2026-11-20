import { getCampusGameIds, isCampusGameEnabled } from "@/lib/campus-games";
import { NextRequest, NextResponse } from "next/server";
import { getStoreAsync } from "@/lib/tournament-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { EVENT_DETAILS } from "@/lib/constants";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campusId = searchParams.get("campusId") || "mangalore";
  const campusMeta = CAMPUSES_REGISTRY[campusId] || CAMPUSES_REGISTRY["mangalore"];

  const store = await getStoreAsync();
  const campusMatches = store.matches.filter((m) => (m.campusId || "mangalore") === campusId && m.status === "APPROVED" && isCampusGameEnabled(campusId,m.gameId));
  const matchesCount = campusMatches.length;

  const teamLists=campusId === "mangalore" ? store.teams : store.campusTeams?.[campusId];
  const totalTeams=getCampusGameIds(campusId).reduce((count,game)=>count+(teamLists?.[game]?.filter(t=>!t.hidden).length || 0),0);

  const isCompleted = campusId === "mangalore";

  return NextResponse.json({
    success: true,
    campusId,
    data: {
      eventName: EVENT_DETAILS.title,
      edition: `${campusMeta.name} Edition`,
      venue: `${campusMeta.university}, ${campusMeta.location}`,
      eventDate: campusMeta.editionDate,
      status: isCompleted ? "Completed" : matchesCount > 0 ? "Live" : "Arena Ready",
      statusMessage: isCompleted
        ? "Official championship concluded. Final standings ratified by Super Admin."
        : matchesCount > 0
        ? `${matchesCount} verified matches recorded across championship arenas.`
        : "Arena Ready • The Crown Has To Be Earned. Match verification underway.",
      totalGames: getCampusGameIds(campusId).length,
      matchesCompleted: matchesCount,
      approvedResultsCount: matchesCount,
      totalParticipatingTeams: totalTeams,
      lastUpdated: store.lastUpdated,
    },
    meta: {
      source: "INTERNAL_STORE",
      approvedOnly: true,
      supabaseConnected: isSupabaseConfigured(),
      timestamp: new Date().toISOString(),
    },
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=2, stale-while-revalidate=4",
    },
  });
}
