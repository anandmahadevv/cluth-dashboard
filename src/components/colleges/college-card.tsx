"use client";

import Link from "next/link";
import { CollegeDetail } from "@/lib/colleges-data";
import {
  MapPin,
  Calendar,
  Gamepad2,
  Trophy,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

interface CollegeCardProps {
  college: CollegeDetail;
  isSelected?: boolean;
  onSelect?: (college: CollegeDetail) => void;
  onOpenDetails?: (college: CollegeDetail) => void;
}

export function CollegeCard({
  college,
  isSelected,
  onSelect,
  onOpenDetails,
}: CollegeCardProps) {
  const isLive = college.status === "live";
  const isMangaloreLive = college.slug === "mangalore";

  return (
    <div
      onClick={() => onSelect?.(college)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? "border-orange-500 bg-zinc-950 shadow-xl shadow-orange-500/10 ring-2 ring-orange-500/50"
          : isLive
          ? "border-orange-500/30 bg-zinc-900/90 hover:border-orange-500/70 hover:shadow-lg hover:shadow-orange-500/5"
          : "border-slate-800 bg-zinc-900/40 hover:border-slate-700 hover:bg-zinc-900/70"
      }`}
    >
      {/* HUD Sweep animation on live cards */}
      {isLive && <div className="clutch-hud absolute inset-0 pointer-events-none" />}

      {/* Top Header & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider ${
              isLive
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                : college.status === "soon"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            {isLive && (
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
            )}
            {college.statusLabel}
          </span>

          {/* Edition / City Monospace Tag */}
          <span className="font-mono text-[11px] font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
            {college.editionName}
          </span>
        </div>

        {/* College Name & University */}
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
            {college.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium line-clamp-1">
            {college.university}
          </p>
          <div className="flex items-center gap-1 text-xs text-orange-400/90 font-medium mt-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>
              {college.city}, {college.state}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
          {college.description}
        </p>

        {/* Key Dates Box */}
        {college.dates && college.dates.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/5 bg-black/40 p-2.5 space-y-1.5">
            {college.dates.map((d, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-[11px] font-mono"
              >
                <span className="text-zinc-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                  {d.label}:
                </span>
                <span className="text-zinc-200 font-semibold flex items-center gap-1">
                  {d.value}
                  {d.badge && (
                    <span className="rounded bg-orange-500/20 px-1 py-0.2 text-[9px] text-orange-300">
                      {d.badge}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competitive Titles & Action Footer */}
      <div className="border-t border-white/10 bg-black/30 p-4 pt-3 mt-2">
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">
            Games:
          </span>
          {college.games.slice(0, 3).map((g) => (
            <span
              key={g.slug}
              className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300"
            >
              {g.name}
            </span>
          ))}
          {college.games.length > 3 && (
            <span className="text-[10px] font-mono text-zinc-500">
              +{college.games.length - 3} more
            </span>
          )}
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          {isMangaloreLive ? (
            <Link
              href="/leaderboards"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orange-500 active:scale-95 shadow-md shadow-orange-600/20"
            >
              <Trophy className="h-3.5 w-3.5" />
              Enter Live Leaderboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : college.slug === "kanyakumari" ? (
            <a
              href="https://niat-clutch.vercel.app/join"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orange-500 active:scale-95 shadow-md shadow-orange-600/20"
            >
              <Users className="h-3.5 w-3.5" />
              Build Squad / Join
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails?.(college);
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-display text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              View Campus Brief
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails?.(college);
            }}
            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Campus Information"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
