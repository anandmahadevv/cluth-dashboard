import { NextResponse } from "next/server";
import { getStore } from "@/lib/tournament-store";
import { EVENT_DETAILS } from "@/lib/constants";

export async function GET() {
  const store = getStore();
  const matchesCount = store.matches.length;
  
  // Calculate total teams across games
  let totalTeams = 0;
  if (store.teams) {
    Object.values(store.teams).forEach((list: any) => {
      totalTeams += Array.isArray(list) ? list.length : 0;
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      eventName: EVENT_DETAILS.title,
      edition: EVENT_DETAILS.edition,
      venue: EVENT_DETAILS.venue,
      eventDate: EVENT_DETAILS.dateFormatted,
      status: "Live",
      statusMessage: matchesCount > 0 
        ? `${matchesCount} verified matches recorded across championship arenas.` 
        : "Tournament open. Teams initialized at 0 score, awaiting match results.",
      totalGames: 4,
      matchesCompleted: matchesCount,
      approvedResultsCount: matchesCount,
      totalParticipatingTeams: totalTeams,
      lastUpdated: store.lastUpdated,
    },
    meta: {
      source: "INTERNAL_STORE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
