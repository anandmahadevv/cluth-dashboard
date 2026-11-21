import { getCampusGameIds, isCampusGameEnabled } from "@/lib/campus-games";
import { NextRequest, NextResponse } from "next/server";
import { campusAdminContext } from "@/lib/campus-admin-context";
import { resolveAdminAccess } from "@/lib/tournament-access";
import { CAMPUSES_REGISTRY } from "@/lib/tournament-constants";
import { GAMES_CONFIG } from "@/lib/constants";
import { GameId, IndividualAwards } from "@/types";
import { getStoreAsync, isCampusLocked, getCampusTeamsList, addTeamToGameAsync, removeTeamFromGameAsync,
  updateTeamNameAsync, toggleTeamVisibilityAsync, toggleTeamQualifiedAsync, reviewMatchSubmissionAsync,
  reviewAwardsSubmissionAsync, saveAwardsAsync, recordMatchSubmissionAsync } from "@/lib/tournament-store";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });

export async function POST(req: NextRequest) {
  try {
    const origin=req.headers.get("origin");
    if(origin && origin!==req.nextUrl.origin) return reply({success:false,error:"Cross-origin requests are not allowed."},403);
    const key = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    if (!key || key.length > 256) return reply({success:false,error:"Enter your campus-admin key."},401);
    const store = await getStoreAsync(true);
    const access = resolveAdminAccess(key,store.campusPasskeys);
    if(!access.isValid || access.isSuperAdmin || access.gameId !== "ALL" || !access.campusId) return reply({success:false,error:"A campus-admin key is required. Game POC and Super Admin keys use their own panels."},403);
    const campusId=access.campusId;
    const body=await req.json();
    if(!body || typeof body !== "object" || Array.isArray(body)) return reply({success:false,error:"Invalid request."},400);
    if(body.campusId && body.campusId!==campusId) return reply({success:false,error:"You can only manage your assigned campus."},403);
    const gameId=(body.gameId || "FREE_FIRE") as GameId;
    if(!Object.prototype.hasOwnProperty.call(GAMES_CONFIG,gameId)) return reply({success:false,error:"Unknown game."},400);
    if(!isCampusGameEnabled(campusId,gameId)) return reply({success:false,error:"This game is not enabled for your campus."},400);
    const action=body.action;
    if(action === "LOAD") {
      const matches=store.matches.filter(m=>(m.campusId || "mangalore")===campusId && m.gameId===gameId).map(({pocCode: _key,...safe})=>safe);
      const awardsSubmissions=(store.awardsSubmissions || []).filter(m=>m.gameId==="FREE_FIRE" && m.campusId===campusId && m.gameId===gameId).map(({pocCode: _key,...safe})=>safe);
      return reply({success:true,campusId,campusName:CAMPUSES_REGISTRY[campusId]?.name || campusId,isLocked:isCampusLocked(store,campusId),
        teams:getCampusTeamsList(store,campusId,gameId),matches,awardsSubmissions,
        awards:gameId!=="FREE_FIRE" ? null : store.campusAwards?.[campusId]?.[gameId] || (campusId === "mangalore" ? store.awards?.[gameId] : null) || null});
    }
    if(isCampusLocked(store,campusId)) return reply({success:false,error:"This campus is locked by Super Admin. Viewing is available; changes are disabled."},403);
    const allowed=["ADD_TEAM","RENAME_TEAM","REMOVE_TEAM","SET_VISIBILITY","SET_QUALIFIED","REVIEW_MATCH","REVIEW_AWARDS","SAVE_AWARDS","SUBMIT_MATCH"];
    if(!allowed.includes(action)) return reply({success:false,error:"This operation is reserved for Super Admin or is not supported."},403);
    const pending=body.submissionId;
    if(action === "REVIEW_MATCH" || action === "REVIEW_AWARDS") {
      const match=action === "REVIEW_MATCH" ? store.matches.find(m=>m.id===pending) : store.awardsSubmissions?.find(m=>m.id===pending);
      if(!match || (match.campusId || "mangalore")!==campusId) return reply({success:false,error:"Submission not found in your campus."},404);
      if(!["APPROVE","REJECT"].includes(body.decision) || match.status !== "PENDING") return reply({success:false,error:"Only pending submissions can be approved or rejected."},400);
      if(body.decision === "REJECT" && (typeof body.reason !== "string" || !body.reason.trim())) return reply({success:false,error:"Enter the correction reason for the POC."},400);
    }
    if(["RENAME_TEAM","REMOVE_TEAM","SET_VISIBILITY","SET_QUALIFIED"].includes(action) && !getCampusTeamsList(store,campusId,gameId).some(t=>t.id===body.teamId)) return reply({success:false,error:"Team not found in your campus/game."},404);
    if(["ADD_TEAM","RENAME_TEAM"].includes(action) && (typeof body.teamName !== "string" || !body.teamName.trim() || body.teamName.length>120)) return reply({success:false,error:"Enter a team name of up to 120 characters."},400);
    if(action === "SAVE_AWARDS") {
      const a=body.awards;
      if(!a || typeof a !== "object" || Array.isArray(a) || ![a.winnerTeam,a.winnerScore,a.runnerUpTeam,a.runnerUpScore,a.mvp?.playerName,a.mvp?.teamName,a.mvp?.stats,a.topFragger?.playerName,a.topFragger?.teamName].every(v=>v===undefined || (typeof v === "string" && v.length<=300)) || (a.topFragger?.kills!==undefined && (!Number.isSafeInteger(a.topFragger.kills) || a.topFragger.kills<0))) return reply({success:false,error:"Check award names, scores and non-negative kill counts."},400);
    }
    const result=await campusAdminContext.run({campusId},async()=>{
      const base={campusId,gameId,pocCode:key};
      switch(action) {
        case "ADD_TEAM": return addTeamToGameAsync({...base,teamName:body.teamName});
        case "RENAME_TEAM": return updateTeamNameAsync({...base,teamId:body.teamId,newTeamName:body.teamName});
        case "REMOVE_TEAM": return removeTeamFromGameAsync({...base,teamId:body.teamId});
        case "SET_VISIBILITY": return toggleTeamVisibilityAsync({...base,teamId:body.teamId,hidden:body.hidden === true});
        case "SET_QUALIFIED": return toggleTeamQualifiedAsync({...base,teamId:body.teamId,qualified:body.qualified === true});
        case "REVIEW_MATCH": return reviewMatchSubmissionAsync({submissionId:pending,action:body.decision,adminPassword:"",rejectionReason:body.reason});
        case "REVIEW_AWARDS": return reviewAwardsSubmissionAsync({submissionId:pending,action:body.decision,adminPassword:"",rejectionReason:body.reason});
        case "SAVE_AWARDS": return saveAwardsAsync({...base,awards:body.awards as IndividualAwards});
        case "SUBMIT_MATCH": {
          if(!Number.isSafeInteger(body.matchNumber) || body.matchNumber < 1 || typeof body.proofUrl !== "string" || body.proofUrl.length>4*1024*1024 || !/^(https?:\/\/|data:image\/(png|jpeg|webp);base64,)/i.test(body.proofUrl) || !Array.isArray(body.teamResults) || !body.teamResults.length) return {success:false,error:"Match number, scores and screenshot evidence are required."};
          const teams=getCampusTeamsList(store,campusId,gameId),ids=new Set<string>(),ranks=new Set<number>();
          for(const r of body.teamResults) {
            if(!r || !teams.some(t=>t.id===r.teamId) || ids.has(r.teamId) || !Number.isSafeInteger(r.placement) || r.placement < 1 || r.placement > body.teamResults.length || ranks.has(r.placement) || ![r.placementPoints,r.kills].every(n=>Number.isSafeInteger(n)&&n>=0)) return {success:false,error:"Check team assignments, unique ranks and non-negative scores."};
            ids.add(r.teamId);ranks.add(r.placement);
          }
          return recordMatchSubmissionAsync({...base,matchNumber:body.matchNumber,proofUrl:body.proofUrl,notes:typeof body.notes === "string" ? body.notes.slice(0,4000) : "",teamResults:body.teamResults,autoApprove:true});
        }
        default:return {success:false,error:"Unsupported action."};
      }
    });
    // Do not return full private records or credentials from mutation responses.
    return reply({success:result.success,error:result.success ? undefined : result.error},result.success ? 200 : 400);
  } catch { return reply({success:false,error:"The operation could not complete. Please refresh and retry."},500); }
}
