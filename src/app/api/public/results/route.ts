import { NextResponse } from "next/server";
import { MOCK_GENERIC_MATCHES } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_GENERIC_MATCHES,
    meta: {
      source: "VERIFIED_FIXTURE",
      approvedOnly: true,
      timestamp: new Date().toISOString(),
    },
  });
}
