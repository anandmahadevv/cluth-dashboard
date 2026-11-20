import {NextRequest,NextResponse} from "next/server";
import {GAMES_CONFIG} from "@/lib/constants";
import {getCampusGameIds} from "@/lib/campus-games";
export async function GET(req:NextRequest) { const campusId=req.nextUrl.searchParams.get("campusId") || "mangalore"; return NextResponse.json({success:true,campusId,data:getCampusGameIds(campusId).map(id=>GAMES_CONFIG[id]),meta:{source:"CAMPUS_CONFIGURATION",timestamp:new Date().toISOString()}}); }
