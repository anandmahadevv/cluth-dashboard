import { NextResponse } from "next/server";
import { GAMES_CONFIG } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.values(GAMES_CONFIG),
    meta: {
      source: "VERIFIED_FIXTURE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
