"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

interface MatchStatus {
  id: string;
  matchNumber: number | string;
  timestamp: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt?: string;
  rejectionReason?: string;
  teamCount: number;
}
interface StatusData {
  counts: { pending: number; approved: number; rejected: number };
  submissions: MatchStatus[];
}
const statusLabels = { PENDING: "Awaiting review", APPROVED: "Approved", REJECTED: "Needs correction" };
const statusColors = { PENDING: "bg-amber-50 text-amber-800", APPROVED: "bg-emerald-50 text-emerald-800", REJECTED: "bg-red-50 text-red-800" };

export function PocMatchStatus({ code, gameId, campusId, submitted }: { code: string; gameId: string; campusId: string; submitted: boolean }) {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let disposed = false;
    let active: AbortController | null = null;
    const load = async () => {
      if (active || document.visibilityState === "hidden") return;
      active = new AbortController();
      try {
        const response = await fetch("/api/poc/match-status", { method: "POST", cache: "no-store",
          headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, gameId, campusId }), signal: active.signal });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Could not load match status.");
        if (!disposed) { setData(result); setError(""); }
      } catch (err) {
        if (!disposed) setError(err instanceof Error ? err.message : "Could not load match status.");
      } finally { active = null; if (!disposed) setLoading(false); }
    };
    setLoading(true);
    setData(null);
    setError("");
    void load();
    const timer = window.setInterval(() => { void load(); }, 30000);
    const onVisible = () => { void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { disposed = true; active?.abort(); window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [code, gameId, campusId, submitted, refresh]);

  return <section aria-labelledby="poc-match-status-title" className="rounded-2xl border border-[#dfe4db] bg-white p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div><h2 id="poc-match-status-title" className="text-sm font-bold text-[#17211e]">Submitted matches</h2>
        <p className="mt-1 text-xs text-[#69776d]">Your game and campus · Updates every 30 seconds</p></div>
      <button type="button" disabled={loading} onClick={() => setRefresh(n => n + 1)} aria-label="Refresh match status" className="flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[#dfe4db] text-emerald-800 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      </button>
    </div>
    {error && <div role="alert" className="mt-3 text-xs text-red-800">{error} Use refresh to retry.{data && " Displayed statuses may be out of date."}</div>}
    {loading && <p role="status" className="mt-3 text-xs text-[#69776d]">Checking match status…</p>}
    {data && <>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">{data.counts.pending} pending</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">{data.counts.approved} approved</span>
        <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-800">{data.counts.rejected} rejected</span>
      </div>
      {data.submissions.length === 0 ? <p className="mt-4 text-sm text-[#69776d]">No matches submitted yet. After you send results, their review status appears here.</p> : <details className="mt-4">
        <summary className="cursor-pointer text-xs font-bold text-emerald-800">View recent submissions ({data.submissions.length})</summary>
        <ul className="mt-3 divide-y divide-[#dfe4db]">
          {data.submissions.map(match => <li key={match.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold text-[#17211e]">Match #{match.matchNumber}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColors[match.status]}`}>{statusLabels[match.status]}</span></div>
            <p className="mt-1 text-xs text-[#69776d]">{match.teamCount} teams · Sent {new Date(match.timestamp).toLocaleString()}</p>
            {match.reviewedAt && <p className="mt-1 text-xs text-[#69776d]">Reviewed {new Date(match.reviewedAt).toLocaleString()}</p>}
            {match.status === "REJECTED" && <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-900">
              <p><strong>Admin feedback:</strong> {match.rejectionReason || "Contact your admin for the correction details."}</p>
              <p className="mt-1">Use this match number when sending corrected results.</p>
            </div>}
          </li>)}
        </ul>
        <p className="mt-3 text-[11px] text-[#69776d]">Showing the latest 20 submissions at most.</p>
      </details>}
    </>}
  </section>;
}
