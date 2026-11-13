import { NextResponse } from "next/server";
import { MOCK_TOURNAMENT_STATUS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_TOURNAMENT_STATUS,
    meta: {
      source: "VERIFIED_FIXTURE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
