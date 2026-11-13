import { NextResponse } from "next/server";
import { MOCK_GAME_WINNERS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_GAME_WINNERS,
    meta: {
      source: "VERIFIED_FIXTURE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
