"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {getCampusGameIds} from "@/lib/campus-games";
import Image from "next/image";
import { ShieldCheck, LogOut, RefreshCw, Loader2, Lock, Inbox, History, Users, Trophy, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { AccessShell, WorkspaceIntro } from "./access-shell";
import { EvidenceUpload } from "./evidence-upload";
import { GAMES_CONFIG } from "@/lib/constants";
import { PLACEMENT_POINTS } from "@/lib/tournament-constants";
import type { GameId, IndividualAwards } from "@/types";

interface Team { id:string; teamName:string; hidden?:boolean; qualified?:boolean; totalPoints:number }
interface Submission { id:string; gameId:GameId; matchNumber:number|string; timestamp:string; status:string; proofUrl?:string; notes?:string; rejectionReason?:string; teamResults:{teamId:string;teamName:string;placement:number;placementPoints:number;kills:number;matchPoints:number}[] }
interface AwardSubmission { id:string; status:string; timestamp:string; rejectionReason?:string; awards:IndividualAwards }
interface CampusData { campusId:string; campusName:string; isLocked:boolean; teams:Team[]; matches:Submission[]; awards:IndividualAwards|null; awardsSubmissions:AwardSubmission[] }
interface Score {teamId:string; placement:number; placementPoints:number; kills:number}
type Tab="queue"|"history"|"scores"|"teams"|"awards";

const statusStyle=(status:string)=>status==="APPROVED"?"bg-emerald-50 text-emerald-800":status==="REJECTED"?"bg-red-50 text-red-800":"bg-amber-50 text-amber-800";

export function CampusAdminPanel() {
  const [keyInput,setKeyInput]=useState("");
  const [accessKey,setAccessKey]=useState("");
  const [gameId,setGameId]=useState<GameId>("FREE_FIRE");
  const [data,setData]=useState<CampusData|null>(null);
  const [assignedCampus,setAssignedCampus]=useState<{id:string;name:string}|null>(null);
  const [tab,setTab]=useState<Tab>("queue");
  const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
  const [error,setError]=useState(""),[notice,setNotice]=useState("");
  const [search,setSearch]=useState(""),[teamName,setTeamName]=useState("");
  const [editingTeam,setEditingTeam]=useState<string|null>(null),[editName,setEditName]=useState("");
  const [rejecting,setRejecting]=useState<string|null>(null),[reason,setReason]=useState("");
  const [scoreRows,setScoreRows]=useState<Score[]>([]),[matchNumber,setMatchNumber]=useState(1);
  const [proofUrl,setProofUrl]=useState(""),[preparing,setPreparing]=useState(false),[notes,setNotes]=useState("");
  const [confirmScores,setConfirmScores]=useState(false);
  const [awardDraft,setAwardDraft]=useState({winnerTeam:"",winnerScore:"",runnerUpTeam:"",runnerUpScore:"",mvpName:"",mvpTeam:"",mvpStats:"",fraggerName:"",fraggerTeam:"",fraggerKills:""});
  const loadVersion=useRef({version:0}),mutation=useRef(false);
  const resetDraft=()=>{setScoreRows([]);setMatchNumber(1);setProofUrl("");setNotes("");setConfirmScores(false);setSearch("");setRejecting(null);setReason("");};
  async function request(key:string,action:string,payload:Record<string,unknown>={}) {
    const response=await fetch("/api/campus-admin",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({action,gameId,...payload})});
    const result=await response.json();
    if(!response.ok || !result.success) throw new Error(result.error || "The action could not complete.");
    return result;
  }
  async function load(key:string,game:GameId) {
    const version=++loadVersion.current.version;setLoading(true);
    try {
      const result=await request(key,"LOAD",{gameId:game});
      if(version!==loadVersion.current.version)return;
      setData(result);setAssignedCampus({id:result.campusId,name:result.campusName});setError("");
      setScoreRows(previous=>{
        const ids=result.teams.map((t:Team)=>t.id);
        if(previous.length===ids.length && previous.every(r=>ids.includes(r.teamId))) return previous;
        return result.teams.map((t:Team,i:number)=>({teamId:t.id,placement:i+1,placementPoints:PLACEMENT_POINTS[game]?.[i] || 0,kills:0}));
      });
      const awards=result.awards;
      setAwardDraft({winnerTeam:awards?.winnerTeam || "",winnerScore:awards?.winnerScore || "",runnerUpTeam:awards?.runnerUpTeam || "",runnerUpScore:awards?.runnerUpScore || "",mvpName:awards?.mvp?.playerName || "",mvpTeam:awards?.mvp?.teamName || "",mvpStats:awards?.mvp?.stats || "",fraggerName:awards?.topFragger?.playerName || "",fraggerTeam:awards?.topFragger?.teamName || "",fraggerKills:String(awards?.topFragger?.kills ?? "")});
    } catch(err) {if(version===loadVersion.current.version)setError(err instanceof Error?err.message:"Could not load campus.");}
    finally {if(version===loadVersion.current.version)setLoading(false);}
  }
  useEffect(()=>{
    const tracker=loadVersion.current;
    if(accessKey) void load(accessKey,gameId);
    return ()=>{tracker.version++;};
    // Load only on verified key/game changes; request state is deliberately excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[accessKey,gameId]);
  async function login(event:React.FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setError("");
    try {const result=await request(keyInput,"LOAD");setData(result);setAssignedCampus({id:result.campusId,name:result.campusName});setAccessKey(keyInput);setKeyInput("");setNotice("");}
    catch(err){setError(err instanceof Error?err.message:"Sign-in failed.");}finally{setBusy(false);}
  }
  async function run(action:string,payload:Record<string,unknown>,message:string) {
    if(mutation.current || !accessKey || data?.isLocked)return false;
    mutation.current=true;setBusy(true);setError("");setNotice("");
    try {await request(accessKey,action,payload);setNotice(message);setRejecting(null);setReason("");await load(accessKey,gameId);return true;}
    catch(err){setError(err instanceof Error?err.message:"The action failed.");return false;}
    finally{mutation.current=false;setBusy(false);}
  }
  const switchGame=(next:GameId)=>{loadVersion.current.version++;resetDraft();setData(null);setNotice("");setError("");setGameId(next);};
  const logout=()=>{loadVersion.current.version++;setAccessKey("");setKeyInput("");setData(null);setAssignedCampus(null);resetDraft();setNotice("");setError("");};
  const games=getCampusGameIds(assignedCampus?.id).map(id=>[id,GAMES_CONFIG[id]] as const);
  const blocked=busy||loading||Boolean(data?.isLocked);
  const pending=data?.matches.filter(m=>m.status==="PENDING") || [];
  const pendingAwards=data?.awardsSubmissions.filter(a=>a.status==="PENDING") || [];
  function moveScore(index:number,direction:number) {
    setScoreRows(previous=>{const rows=[...previous],target=index+direction;if(target<0||target>=rows.length)return previous;
      [rows[index],rows[target]]=[rows[target],rows[index]];return rows.map((r,i)=>({...r,placement:i+1,placementPoints:PLACEMENT_POINTS[gameId]?.[i] || 0}));});setConfirmScores(false);
  }
  const labelClass="block text-xs font-semibold text-[#48564d]";
  const inputClass="mt-1 w-full rounded-lg border border-[#d1d9ce] bg-[#f7f8f4] px-3 py-2 text-sm";
  const secondary="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#d1d9ce] bg-white px-3 py-2 text-xs font-semibold text-[#48564d] disabled:opacity-40";
  const feedback=<>{error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{notice&&<p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}</>;
  if(!accessKey)return <AccessShell kind="campus-admin"><form onSubmit={login} className="space-y-4">{feedback}<label className={labelClass}>Campus-admin key<input type="password" autoComplete="off" value={keyInput} onChange={e=>setKeyInput(e.target.value)} className={inputClass} placeholder="Enter the key provided by Super Admin" required /></label><button type="submit" disabled={!keyInput.trim()||busy} className="ops-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<ShieldCheck className="h-4 w-4"/>}Open campus workspace</button><p className="text-xs leading-relaxed text-[#69776d]">Your key selects your campus automatically. Game POCs should use <Link href="/poc" className="font-bold underline">the POC panel</Link>.</p></form></AccessShell>;

  function reviewActions(id:string,kind:"REVIEW_MATCH"|"REVIEW_AWARDS") {
    return <div className="mt-4 border-t border-[#dfe4db] pt-3 space-y-3">
      <div className="flex flex-wrap gap-3"><button type="button" disabled={blocked} onClick={()=>void run(kind,{submissionId:id,decision:"APPROVE"},"Approved and published for your campus.")} className="ops-primary rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-40">Approve &amp; publish</button><button type="button" disabled={blocked} onClick={()=>{setRejecting(id);setReason("");}} className={secondary}>Request correction</button></div>
      {rejecting===id&&<form onSubmit={e=>{e.preventDefault();void run(kind,{submissionId:id,decision:"REJECT",reason},"Correction requested. The POC can see your feedback.");}} className="space-y-2"><label className={labelClass}>Correction reason<textarea required value={reason} onChange={e=>setReason(e.target.value)} className={inputClass}/></label><div className="flex gap-2"><button disabled={blocked||!reason.trim()} className={secondary}>Reject with feedback</button><button type="button" onClick={()=>setRejecting(null)} className={secondary}>Cancel</button></div></form>}
    </div>;
  }
  return <div className="ops-panel min-h-screen font-sans">
    <header className="border-b border-[#dfe4db] bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"><Link href={`/?campus=${assignedCampus?.id || ""}`} className="flex items-center gap-3"><Image src="/images/clutch-logo.jpg" alt="CLUTCH" width={36} height={36} className="rounded-lg"/><span className="text-xs font-semibold text-[#69776d]">Campus admin workspace</span></Link><div className="flex gap-2"><button type="button" disabled={busy||loading} onClick={()=>void load(accessKey,gameId)} className={secondary} aria-label="Refresh campus data"><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/></button><button type="button" disabled={busy} onClick={logout} className={secondary}><LogOut className="h-4 w-4"/>Sign out</button></div></div></header>
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <WorkspaceIntro role="Campus administration" title={assignedCampus?.name || "Your campus workspace"} description="Manage your campus teams, verify match evidence, and publish results for your campus games." metrics={[{label:"Pending matches",value:pending.length},{label:"Approved matches",value:data?.matches.filter(m=>m.status==="APPROVED").length || 0},{label:"Pending awards",value:pendingAwards.length}]}/>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe4db] bg-white p-4"><label className="flex items-center gap-3 text-xs font-bold">Game<select disabled={busy} value={gameId} onChange={e=>switchGame(e.target.value as GameId)} className="rounded-lg border border-[#d1d9ce] bg-[#f7f8f4] px-3 py-2">{games.map(([id,g])=><option key={id} value={id}>{g.name}</option>)}</select></label><p className="text-xs text-[#69776d]">Assigned campus only · Key management, resets and locks belong to Super Admin</p></div>
      {data?.isLocked&&<p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><Lock className="h-4 w-4 shrink-0"/>Super Admin has locked this campus. You can view records; editing is disabled.</p>}
      {feedback}
      <nav className="ops-section-nav" aria-label="Campus admin sections">{([{id:"queue",label:"Review queue",icon:Inbox},{id:"history",label:"Match history",icon:History},{id:"scores",label:"Score entry",icon:Plus},{id:"teams",label:"Teams & rosters",icon:Users},{id:"awards",label:"Awards",icon:Trophy}] as const).map(({id,label,icon:Icon})=><button type="button" key={id} aria-pressed={tab===id} onClick={()=>{setTab(id);setNotice("");}}><Icon className="h-4 w-4"/>{label}{id==="queue"&&pending.length>0&&<span className="rounded-full bg-[#ff986b] px-2 text-[#17211e]">{pending.length}</span>}</button>)}</nav>
      {loading&&!data&&<p role="status" className="py-10 text-center text-sm text-[#69776d]">Loading your campus…</p>}
      {data&&(tab==="queue"||tab==="history")&&<section className="space-y-4"><h2 className="text-lg font-bold">{tab==="queue"?"Awaiting your review":"Reviewed matches"} · {GAMES_CONFIG[gameId].name}</h2>{(tab==="queue"?pending:data.matches.filter(m=>m.status!=="PENDING")).length===0&&<div className="rounded-2xl border border-[#dfe4db] bg-white p-10 text-center"><Inbox className="mx-auto mb-3 h-8 w-8 text-emerald-800"/><p className="font-bold">{tab==="queue"?"You’re all caught up":"No reviewed matches yet"}</p><p className="mt-2 text-sm text-[#69776d]">Only submissions for your campus and selected game appear here.</p></div>}
        {(tab==="queue"?pending:data.matches.filter(m=>m.status!=="PENDING")).map(match=><article key={match.id} className="rounded-2xl border border-[#dfe4db] bg-white p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold">Match #{match.matchNumber}</h3><p className="mt-1 text-xs text-[#69776d]">{new Date(match.timestamp).toLocaleString()} · {match.teamResults.length} teams</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(match.status)}`}>{match.status}</span></div><div className="grid gap-5 lg:grid-cols-2"><div>{match.proofUrl?<a href={match.proofUrl} target="_blank" rel="noreferrer" className="block rounded-xl border border-[#dfe4db] p-2"><Image unoptimized src={match.proofUrl} alt={`Evidence for match ${match.matchNumber}`} width={600} height={360} className="h-56 w-full object-contain"/><span className="block text-center text-xs font-semibold text-emerald-800">Open full evidence</span></a>:<p className="text-sm text-[#69776d]">No evidence attached.</p>}{match.notes&&<p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#69776d]">{match.notes}</p>}</div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><caption className="mb-2 text-left font-bold">Reported scores</caption><thead><tr><th className="p-2">Rank</th><th className="p-2">Team</th><th className="p-2">Place pts</th><th className="p-2">{gameId==="EFOOTBALL"?"Goals":gameId==="MATIKS"?"Bonus":"Kills"}</th><th className="p-2">Total</th></tr></thead><tbody>{match.teamResults.map(r=><tr key={r.teamId}><td className="p-2">{r.placement}</td><td className="p-2 font-semibold">{r.teamName}</td><td className="p-2">{r.placementPoints}</td><td className="p-2">{r.kills}</td><td className="p-2 font-bold text-emerald-800">{r.matchPoints}</td></tr>)}</tbody></table></div></div>{match.rejectionReason&&<p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{match.rejectionReason}</p>}{match.status==="PENDING"&&reviewActions(match.id,"REVIEW_MATCH")}</article>)}
      </section>}
      {data&&tab==="teams"&&<section className="space-y-4"><div className="rounded-2xl border border-[#dfe4db] bg-white p-4"><h2 className="font-bold">Teams &amp; rosters · {GAMES_CONFIG[gameId].name}</h2><form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={async e=>{e.preventDefault();if(await run("ADD_TEAM",{teamName},"Team added to your campus."))setTeamName("");}}><label className={labelClass}>New team name<input required value={teamName} onChange={e=>setTeamName(e.target.value)} className={inputClass}/></label><button disabled={blocked||!teamName.trim()} className="ops-primary rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-40">Add team</button></form><label className={`${labelClass} mt-4`}>Search roster<input type="search" value={search} onChange={e=>setSearch(e.target.value)} className={inputClass}/></label></div>
        {data.teams.filter(t=>t.teamName.toLowerCase().includes(search.toLowerCase())).map(team=><article key={team.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe4db] bg-white p-4"><div><h3 className="font-bold">{team.teamName}</h3><p className="mt-1 text-xs text-[#69776d]">{team.totalPoints} pts · {team.hidden?"Hidden":"Visible"}{team.qualified?" · Qualified":""}</p></div><div className="flex flex-wrap gap-2"><button disabled={blocked} type="button" onClick={()=>{setEditingTeam(team.id);setEditName(team.teamName);}} className={secondary}>Rename</button><button disabled={blocked} type="button" onClick={()=>void run("SET_VISIBILITY",{teamId:team.id,hidden:!team.hidden},"Visibility updated.")} className={secondary}>{team.hidden?"Show team":"Hide team"}</button><button disabled={blocked} type="button" onClick={()=>void run("SET_QUALIFIED",{teamId:team.id,qualified:!team.qualified},"Qualification updated.")} className={secondary}>{team.qualified?"Unmark qualifier":"Mark qualified"}</button><button disabled={blocked} type="button" onClick={()=>{if(window.confirm(`Remove ${team.teamName} from this campus roster?`))void run("REMOVE_TEAM",{teamId:team.id},"Team removed.");}} className={`${secondary} text-red-800`}>Remove</button></div>{editingTeam===team.id&&<form className="flex w-full flex-wrap gap-2" onSubmit={async e=>{e.preventDefault();if(await run("RENAME_TEAM",{teamId:team.id,teamName:editName},"Team renamed."))setEditingTeam(null);}}><input aria-label="New team name" value={editName} onChange={e=>setEditName(e.target.value)} className={inputClass}/><button disabled={blocked||!editName.trim()} className={secondary}>Save name</button><button type="button" onClick={()=>setEditingTeam(null)} className={secondary}>Cancel</button></form>}</article>)}{data.teams.length===0&&<p className="rounded-xl bg-white p-6 text-sm text-[#69776d]">No teams registered for this game yet. Add the official roster above.</p>}</section>}
      {data&&tab==="scores"&&<section className="space-y-4"><div className="rounded-2xl border border-[#dfe4db] bg-white p-4"><h2 className="font-bold">Direct score entry · {GAMES_CONFIG[gameId].name}</h2><p className="mt-1 text-sm text-[#69776d]">Campus admin results publish directly to your campus leaderboard after your final check.</p><label className={`${labelClass} mt-4`}>Match number<input type="number" min="1" value={matchNumber} onChange={e=>{setMatchNumber(Math.max(1,parseInt(e.target.value)||1));setConfirmScores(false);}} className={`${inputClass} max-w-32`}/></label></div>
        {scoreRows.map((r,index)=><div key={r.teamId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe4db] bg-white p-4"><div className="flex items-center gap-3"><span className="text-xs font-bold text-[#69776d]">#{index+1}</span><span className="font-semibold">{data.teams.find(t=>t.id===r.teamId)?.teamName}</span><button aria-label={`Move ${data.teams.find(t=>t.id===r.teamId)?.teamName} up`} disabled={blocked||index===0} onClick={()=>moveScore(index,-1)} className={secondary}><ChevronUp className="h-4 w-4"/></button><button aria-label={`Move ${data.teams.find(t=>t.id===r.teamId)?.teamName} down`} disabled={blocked||index===scoreRows.length-1} onClick={()=>moveScore(index,1)} className={secondary}><ChevronDown className="h-4 w-4"/></button></div><div className="flex gap-3"><label className={labelClass}>Place pts<input disabled={blocked} type="number" min="0" value={r.placementPoints} onChange={e=>{setScoreRows(rows=>rows.map(row=>row.teamId===r.teamId?{...row,placementPoints:Math.max(0,parseInt(e.target.value)||0)}:row));setConfirmScores(false);}} className={`${inputClass} max-w-24`}/></label>{gameId!=="VALORANT"&&<label className={labelClass}>{gameId==="EFOOTBALL"?"Goals":gameId==="MATIKS"?"Bonus":"Kills"}<input disabled={blocked} type="number" min="0" value={r.kills} onChange={e=>{setScoreRows(rows=>rows.map(row=>row.teamId===r.teamId?{...row,kills:Math.max(0,parseInt(e.target.value)||0)}:row));setConfirmScores(false);}} className={`${inputClass} max-w-24`}/></label>}<p className="self-end pb-3 text-sm font-bold text-emerald-800">{r.placementPoints+r.kills} pts</p></div></div>)}
        {!scoreRows.length&&<p className="rounded-xl bg-white p-6 text-sm text-[#69776d]">Add teams in Teams &amp; rosters before entering scores.</p>}
        <div className="space-y-4 rounded-2xl border border-[#dfe4db] bg-white p-4"><EvidenceUpload value={proofUrl} onChange={value=>{setProofUrl(value);setConfirmScores(false);}} onProcessingChange={setPreparing} disabled={blocked}/><label className={labelClass}>Match notes<textarea value={notes} onChange={e=>{setNotes(e.target.value);setConfirmScores(false);}} className={inputClass}/></label><label className="flex items-start gap-2 text-xs leading-relaxed text-[#48564d]"><input type="checkbox" checked={confirmScores} onChange={e=>setConfirmScores(e.target.checked)} className="mt-0.5"/>I checked the team order, scores and evidence for match #{matchNumber}. These results will publish immediately.</label><button disabled={blocked||preparing||!proofUrl||!scoreRows.length||!confirmScores} type="button" onClick={async()=>{if(await run("SUBMIT_MATCH",{matchNumber,proofUrl,notes,teamResults:scoreRows},`Match #${matchNumber} published for your campus.`)){setProofUrl("");setNotes("");setConfirmScores(false);setMatchNumber(n=>n+1);setScoreRows(rows=>rows.map((r,i)=>({...r,kills:0,placementPoints:PLACEMENT_POINTS[gameId]?.[i] || 0})));}}} className="ops-primary rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-40">Publish match #{matchNumber}</button></div>
      </section>}
      {data&&tab==="awards"&&<section className="space-y-4"><h2 className="text-lg font-bold">Awards nominations · {GAMES_CONFIG[gameId].name}</h2>{pendingAwards.length===0&&<p className="rounded-xl border border-[#dfe4db] bg-white p-5 text-sm text-[#69776d]">No award nominations awaiting review.</p>}{pendingAwards.map(sub=><article key={sub.id} className="rounded-2xl border border-[#dfe4db] bg-white p-4"><p className="text-xs text-[#69776d]">Submitted {new Date(sub.timestamp).toLocaleString()}</p><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">{[["Winner",sub.awards.winnerTeam],["Runner-up",sub.awards.runnerUpTeam],["MVP",sub.awards.mvp?.playerName],["Top fragger",sub.awards.topFragger?.playerName]].map(([label,value])=><div key={label}><dt className="text-xs text-[#69776d]">{label}</dt><dd className="mt-1 font-semibold">{value||"—"}</dd></div>)}</dl>{reviewActions(sub.id,"REVIEW_AWARDS")}</article>)}
        <form className="space-y-4 rounded-2xl border border-[#dfe4db] bg-white p-4" onSubmit={e=>{e.preventDefault();void run("SAVE_AWARDS",{awards:{winnerTeam:awardDraft.winnerTeam.trim(),winnerScore:awardDraft.winnerScore.trim(),runnerUpTeam:awardDraft.runnerUpTeam.trim(),runnerUpScore:awardDraft.runnerUpScore.trim(),mvp:{playerName:awardDraft.mvpName.trim(),teamName:awardDraft.mvpTeam.trim(),stats:awardDraft.mvpStats.trim()},topFragger:{playerName:awardDraft.fraggerName.trim(),teamName:awardDraft.fraggerTeam.trim(),kills:Number(awardDraft.fraggerKills)||0}}},"Campus awards published.");}}><h3 className="font-bold">Official campus awards</h3><p className="text-xs text-[#69776d]">Save publishes these awards for this campus and game.</p><div className="grid gap-3 sm:grid-cols-2">{(Object.entries({winnerTeam:"Winning team",winnerScore:"Winner score",runnerUpTeam:"Runner-up team",runnerUpScore:"Runner-up score",mvpName:"MVP player",mvpTeam:"MVP team",mvpStats:"MVP highlight",fraggerName:"Top fragger",fraggerTeam:"Top fragger team",fraggerKills:"Top fragger kills"}) as [keyof typeof awardDraft,string][]).map(([field,label])=><label key={field} className={labelClass}>{label}<input disabled={blocked} type={field==="fraggerKills"?"number":"text"} min={field==="fraggerKills"?0:undefined} value={awardDraft[field]} onChange={e=>setAwardDraft(d=>({...d,[field]:e.target.value}))} className={inputClass}/></label>)}</div><button disabled={blocked} className="ops-primary rounded-xl px-5 py-3 text-xs font-bold disabled:opacity-40">Save &amp; publish campus awards</button></form>
      </section>}
    </div>
  </div>;
}
