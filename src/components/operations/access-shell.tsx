import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import "./operations.css";

export function AccessShell({ kind, children }: { kind: "admin" | "poc" | "campus-admin"; children: ReactNode }) {
  const admin = kind !== "poc";
  const campus = kind === "campus-admin";
  const steps = admin ? ["Review submitted match evidence", "Publish verified scores and awards", campus ? "Manage your campus rosters" : "Manage campus access and rosters"] : ["Enter your assigned POC key", "Enter match scores and rankings", "Attach evidence for admin review"];
  return <div className="ops-panel ops-access min-h-screen bg-[#f5f4f0] px-4 py-5 text-[#17211e] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3"><Image src="/images/clutch-logo.jpg" alt="CLUTCH" width={36} height={36} className="rounded-lg" /><div><span className="block text-sm font-black tracking-tight">CLUTCH</span><span className="text-[10px] text-[#7d867f]">Tournament operations</span></div></Link>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-[#69766d]"><ArrowLeft className="h-3.5 w-3.5" />Leaderboard</Link>
      </div>
      <div className="grid overflow-hidden rounded-[28px] border border-[#e0e3dc] bg-white shadow-[0_16px_60px_-32px_rgba(23,33,30,.2)] lg:min-h-[620px] lg:grid-cols-2">
        <div className="ops-access-story relative flex flex-col justify-between overflow-hidden bg-[#17211e] p-7 text-white sm:p-10 lg:p-12">
          <div className="relative"><div className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#ffad83]"><span className="h-1.5 w-1.5 rounded-full bg-[#ff986b]" />{campus ? "Campus admin" : admin ? "Super admin" : "Referee access"}</div>
            <h1 className="max-w-md text-4xl font-extrabold leading-[1.05] tracking-[-.05em] sm:text-5xl">{admin ? <>Behind every<br />great <span className="text-[#ff986b]">game.</span></> : <>Your arena.<br />Your <span className="text-[#ff986b]">call.</span></>}</h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#bdc9bf]">{admin ? "The control room for a championship that runs as well as it plays." : "A focused workspace for accurate scores, clear evidence, and a fair competition."}</p>
          </div>
          <div className="relative mt-10 hidden space-y-4 sm:block">{steps.map((step, index) => <div key={step} className="flex items-center gap-3 text-xs text-[#d0d9d2]"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-[9px] text-[#ffad83]">0{index + 1}</span>{step}</div>)}</div>
          <div className="relative mt-8 flex items-center justify-between border-t border-white/15 pt-5 text-[10px] text-[#9cafa1]"><span>NIAT Esports Championship · 2026</span><ArrowUpRight className="h-4 w-4" /></div>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-7"><span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0e6] text-[#ad522b]"><ShieldCheck className="h-5 w-5" /></span>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#8a6552]">{admin ? "Admin workspace" : "Match operations"}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{admin ? "Welcome back." : "Get your arena ready."}</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#7d867f]">{admin ? "Sign in to review results and manage the championship." : "Enter your assigned key. Your campus and game are selected automatically."}</p>
          </div>
          {children}
          <div className="mt-7 flex items-start gap-2 border-t border-[#e8ece4] pt-5 text-[10px] leading-relaxed text-[#7d867f]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{admin ? campus ? "Restricted to your assigned campus. Super Admin retains global controls." : "Restricted to authorized tournament administrators." : "Your access is scoped to your assigned game and campus."}</div>
        </div>
      </div>
    </div>
  </div>;
}

export function WorkspaceIntro({ role, title, description, metrics }: {
  role: string; title: string; description: string; metrics: { label: string; value: string | number }[];
}) {
  return <section className="ops-intro overflow-hidden rounded-[24px] bg-[#17211e] p-6 text-white sm:p-8" aria-label={title}>
    <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#ffad83]">{role}</p><h1 className="text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">{title}</h1><p className="mt-3 max-w-lg text-xs leading-relaxed text-[#bdc9bf]">{description}</p></div>
    <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-5">{metrics.map(metric => <div key={metric.label}><p className={`break-words font-bold tracking-tight text-[#ffad83] ${typeof metric.value === "string" && metric.value.length > 8 ? "text-sm leading-snug sm:text-base" : "text-xl sm:text-2xl"}`}>{metric.value}</p><p className="mt-1 text-[10px] text-[#bdc9bf]">{metric.label}</p></div>)}</div>
  </section>;
}
