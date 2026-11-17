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
  const campusMatches = store.matches.filter((m) => (m.campusId || "mangalore") === campusId);
  const matchesCount = campusMatches.length;

  let totalTeams = 0;
  if (campusId === "mangalore") {
    if (store.teams) {
      Object.values(store.teams).forEach((list: any) => {
        totalTeams += Array.isArray(list) ? list.length : 0;
      });
    }
  } else {
    const cTeams = store.campusTeams?.[campusId];
    if (cTeams) {
      Object.values(cTeams).forEach((list: any) => {
        totalTeams += Array.isArray(list) ? list.length : 0;
      });
    }
  }

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
      totalGames: 5,
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
  });
}
