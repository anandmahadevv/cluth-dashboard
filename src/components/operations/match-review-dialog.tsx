"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Lock, Send, X } from "lucide-react";
import { MatchDraftResult, totalDraftPoints } from "@/lib/match-draft";
import type { GameId } from "@/types";

interface MatchReviewProps {
  open: boolean;
  campusName: string;
  gameName: string;
  gameId: GameId;
  matchNumber: number;
  results: MatchDraftResult[];
  teams: { id: string; teamName: string }[];
  proofUrl: string;
  notes: string;
  locked: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}
export function MatchReviewDialog(props: MatchReviewProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (props.open && element && !element.open) element.showModal();
    else if (!props.open && element?.open) element.close();
  }, [props.open]);
  const names = new Map(props.teams.map(team => [team.id, team.teamName]));
  const rosterChanged = props.results.some(result => !names.has(result.teamId));
  const statLabel = props.gameId === "EFOOTBALL" ? "Goals" : props.gameId === "MATIKS" ? "Bonus" : "Kills";
  const blocked = props.locked || props.busy || !props.proofUrl || !props.results.length || rosterChanged;
  return <dialog ref={dialog} className="match-review-dialog" aria-labelledby="match-review-title" aria-describedby="match-review-description"
    onCancel={event => { event.preventDefault(); if (!props.busy) props.onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !props.busy) props.onClose(); }}>
    <div className="flex max-h-[calc(100dvh_-_2rem)] flex-col">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e3e8df] px-5 py-5 sm:px-6">
        <div><p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#a76643]">Final check</p><h2 id="match-review-title" className="text-xl font-extrabold tracking-tight text-[#17211e]">Review match #{props.matchNumber}</h2><p id="match-review-description" className="mt-2 text-xs leading-relaxed text-[#69776d]">Check every score against the screenshot before sending it for admin review.</p></div>
        <button type="button" disabled={props.busy} onClick={props.onClose} aria-label="Close match review" className="shrink-0 rounded-lg p-2 text-[#69776d] hover:bg-[#f0f3ec] disabled:opacity-40"><X className="h-4 w-4" /></button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        {props.locked && <p className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800"><Lock className="mt-0.5 h-4 w-4 shrink-0" />This campus is locked. You can review this draft, but submitting is disabled.</p>}
        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-[#e1e6dd] bg-[#f7f8f4] p-4 sm:grid-cols-4">
          {[{label:"Campus",value:props.campusName},{label:"Game",value:props.gameName},{label:"Match",value:`#${props.matchNumber}`},{label:"Teams",value:props.results.length}].map(item => <div key={item.label}><dt className="text-[10px] text-[#87938a]">{item.label}</dt><dd className="mt-1 text-xs font-bold text-[#17211e]">{item.value}</dd></div>)}
        </dl>
        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
          <section aria-label="Scores to submit" className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xs font-bold text-[#3f4b43]">Team results</h3><p className="text-[11px] text-[#69776d]">Combined points <strong className="ml-1 text-[#17211e]">{totalDraftPoints(props.results)}</strong></p></div>
            <div className="overflow-x-auto rounded-xl border border-[#e1e6dd]"><table className="w-full min-w-[340px] text-left text-xs">
              <thead className="bg-[#f7f8f4] text-[#69776d]"><tr><th className="px-3 py-3">Rank</th><th className="px-3 py-3">Team / player</th><th className="px-3 py-3 text-right">Placement</th>{props.gameId !== "VALORANT" && <th className="px-3 py-3 text-right">{statLabel}</th>}<th className="px-3 py-3 text-right">Total</th></tr></thead>
              <tbody>{props.results.map(result => <tr key={result.teamId} className="border-t border-[#eef0eb]"><td className="px-3 py-3 tabular-nums text-[#87938a]">{result.placement}</td><td className="px-3 py-3 font-semibold text-[#3f4b43]">{names.get(result.teamId) || "Team unavailable"}</td><td className="px-3 py-3 text-right tabular-nums text-[#69776d]">{result.placementPoints}</td>{props.gameId !== "VALORANT" && <td className="px-3 py-3 text-right tabular-nums text-[#69776d]">{result.kills}</td>}<td className="px-3 py-3 text-right font-bold tabular-nums text-[#17211e]">{result.placementPoints + result.kills}</td></tr>)}</tbody>
            </table></div>
          </section>
          <aside className="min-w-0"><h3 className="mb-3 text-xs font-bold text-[#3f4b43]">Evidence</h3>{props.proofUrl ? <><Image src={props.proofUrl} alt="Screenshot included with this match" width={400} height={300} unoptimized className="max-h-48 w-full rounded-xl border border-[#e1e6dd] bg-[#f7f8f4] object-contain" /><p className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" />Screenshot attached</p></> : <p className="text-xs text-red-700">Screenshot required.</p>}
            {props.notes.trim() && <div className="mt-4"><h3 className="mb-1 text-xs font-bold text-[#3f4b43]">Notes</h3><p className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-[#69776d]">{props.notes}</p></div>}
          </aside>
        </div>
        {(props.error || rosterChanged) && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{rosterChanged ? "The roster changed. Return to editing and refresh the roster before submitting." : props.error}</p>}
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#e3e8df] bg-white px-5 py-4 sm:px-6">
        <button type="button" disabled={props.busy} onClick={props.onClose} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d1d9ce] px-4 py-2 text-xs font-semibold text-[#48564d] disabled:opacity-40"><ArrowLeft className="h-3.5 w-3.5" />Back to editing</button>
        <button type="button" disabled={blocked} onClick={props.onConfirm} className="ops-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-40">{props.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{props.busy ? "Sending…" : props.locked ? "Campus locked" : "Send for admin review"}</button>
      </footer>
    </div>
  </dialog>;
}
