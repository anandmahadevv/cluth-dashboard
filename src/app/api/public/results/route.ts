import { NextResponse } from "next/server";

export async function GET() {
  const gasUrl = process.env.NEXT_PUBLIC_CLUTCH_API_URL || "";
  if (gasUrl && gasUrl.includes("script.google.com")) {
    try {
      const res = await fetch(`${gasUrl}?action=getLeaderboard`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({
          success: true,
          data: json.results || json.data || [],
          meta: { source: "GOOGLE_SHEETS", approvedOnly: true, timestamp: new Date().toISOString() }
        });
      }
    } catch {}
  }
  return NextResponse.json({
    success: true,
    data: [],
    meta: { source: "GOOGLE_SHEETS", approvedOnly: true, timestamp: new Date().toISOString() },
  });
}
