"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  COLLEGES_DATA,
  CollegeDetail,
  CollegeStatus,
} from "@/lib/colleges-data";
import { ClutchRadarMap } from "./clutch-radar-map";
import { CollegeCard } from "./college-card";
import {
  Search,
  Filter,
  Trophy,
  Flame,
  Radio,
  Gamepad2,
  Calendar,
  MapPin,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function CollegeSelectorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<CollegeStatus | "all">("all");
  const [selectedCollege, setSelectedCollege] = useState<CollegeDetail | null>(
    COLLEGES_DATA[0] // Default to Yenepoya Mangalore
  );
  const [modalCollege, setModalCollege] = useState<CollegeDetail | null>(null);

  // Filter and search logic
  const filteredColleges = useMemo(() => {
    return COLLEGES_DATA.filter((col) => {
      const matchesFilter =
        selectedFilter === "all" ? true : col.status === selectedFilter;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesFilter;

      const matchesQuery =
        col.name.toLowerCase().includes(query) ||
        col.city.toLowerCase().includes(query) ||
        col.university.toLowerCase().includes(query) ||
        col.editionName.toLowerCase().includes(query) ||
        col.games.some((g) => g.name.toLowerCase().includes(query));

      return matchesFilter && matchesQuery;
    });
  }, [searchQuery, selectedFilter]);

  const liveCount = COLLEGES_DATA.filter((c) => c.status === "live").length;
  const soonCount = COLLEGES_DATA.filter((c) => c.status === "soon").length;
  const finishedCount = COLLEGES_DATA.filter((c) => c.status === "finished").length;

  return (
    <div className="relative min-h-screen bg-[#070709] text-white selection:bg-orange-500 selection:text-white">
      {/* Dynamic Cyber Grid Floor Background */}
      <div className="cyber-grid-floor absolute inset-0 pointer-events-none opacity-40 overflow-hidden" />

      {/* Top Infinite Marquee Ticker */}
      <div className="relative w-full border-b border-orange-500/20 bg-black/80 backdrop-blur-md py-2 overflow-hidden z-20">
        <div className="clutch-marquee-track flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
          <div className="flex items-center gap-8 shrink-0">
            <span className="flex items-center gap-2 text-orange-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-orange-500 clutch-blink" />
              KANYAKUMARI ARENA LIVE
            </span>
            <span className="text-zinc-600">///</span>
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <Trophy className="h-3 w-3" />
              YENEPOYA UNIVERSITY MANGALORE EDITION LIVE
            </span>
            <span className="text-zinc-600">///</span>
            <span className="text-zinc-300">
              BENGALURU • PUNE • DELHI-NCR • JAIPUR • COIMBATORE • NASHIK • NCR
            </span>
            <span className="text-zinc-600">///</span>
            <span className="text-cyan-400 font-semibold">
              4 TITLES • 4 CHAMPIONS • SEASON ONE
            </span>
            <span className="text-zinc-600">///</span>
          </div>

          <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
            <span className="flex items-center gap-2 text-orange-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-orange-500 clutch-blink" />
              KANYAKUMARI ARENA LIVE
            </span>
            <span className="text-zinc-600">///</span>
            <span className="flex items-center gap-2 text-emerald-400 font-bold">
              <Trophy className="h-3 w-3" />
              YENEPOYA UNIVERSITY MANGALORE EDITION LIVE
            </span>
            <span className="text-zinc-600">///</span>
            <span className="text-zinc-300">
              BENGALURU • PUNE • DELHI-NCR • JAIPUR • COIMBATORE • NASHIK • NCR
            </span>
            <span className="text-zinc-600">///</span>
            <span className="text-cyan-400 font-semibold">
              4 TITLES • 4 CHAMPIONS • SEASON ONE
            </span>
            <span className="text-zinc-600">///</span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* HERO SECTION WITH CLUTCH ANIMATION */}
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-b from-zinc-900/90 via-black to-zinc-950 p-6 sm:p-10 mb-10 shadow-2xl">
          {/* HUD scanline sweep overlay */}
          <div className="clutch-hud absolute inset-0 pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl">
            {/* Live Indicator Pill */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3.5 py-1 text-xs font-mono font-bold text-orange-400 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-orange-500 clutch-blink" />
                <span>CLUTCH CAMPUS TOURNAMENT HUB</span>
              </div>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                CITY BY CITY • SEASON 1
              </span>
            </div>

            {/* Main Glitch Title */}
            <h1 className="clutch-glitch font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300">COLLEGE ARENA</span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Clutch is the official esports championship for NIAT students, played campus by campus across India. Choose your college below to access verified live leaderboards, match results, and squad brackets.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/leaderboards"
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-orange-500 active:scale-95 shadow-lg shadow-orange-600/30"
              >
                <Trophy className="h-4 w-4" />
                View Active Live Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#colleges-grid"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                <MapPin className="h-4 w-4 text-orange-400" />
                Browse All 11 Campuses
              </a>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6">
              <div>
                <div className="font-display text-2xl font-black text-white">11</div>
                <div className="text-[11px] font-mono uppercase text-zinc-500">Campus Arenas</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black text-orange-400">2 LIVE</div>
                <div className="text-[11px] font-mono uppercase text-zinc-500">Active Circuits</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black text-white">5</div>
                <div className="text-[11px] font-mono uppercase text-zinc-500">Esports Titles</div>
              </div>
              <div>
                <div className="font-display text-2xl font-black text-emerald-400">120+</div>
                <div className="text-[11px] font-mono uppercase text-zinc-500">Verified Teams</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D TACTICAL RADAR ARENA MAP */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                <Radio className="h-5 w-5 text-orange-500" />
                TACTICAL RADAR OVERVIEW
              </h2>
              <p className="text-xs text-zinc-400">
                Interactive geographic telemetry mapping of all active and upcoming collegiate circuits.
              </p>
            </div>
          </div>

          <ClutchRadarMap
            colleges={COLLEGES_DATA}
            selectedCollegeId={selectedCollege?.id || null}
            onSelectCollege={(c) => {
              setSelectedCollege(c);
              // scroll down smoothly to grid
              const elem = document.getElementById("colleges-grid");
              if (elem) elem.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        {/* SEARCH, FILTER & ROSTER HEADING */}
        <div id="colleges-grid" className="scroll-mt-12 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-orange-400">
                <span>SECTOR ROSTER</span>
                <span>•</span>
                <span>{filteredColleges.length} CAMPUSES FOUND</span>
              </div>
              <h2 className="font-display text-3xl font-black uppercase text-white mt-0.5">
                SELECT YOUR COLLEGE
              </h2>
            </div>

            {/* Filter Tabs & Search Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search college, city, or game..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-white/10 bg-zinc-900/90 py-2 pl-9 pr-4 text-xs font-medium text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/90 p-1 font-mono text-xs">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition ${
                    selectedFilter === "all"
                      ? "bg-orange-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({COLLEGES_DATA.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("live")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                    selectedFilter === "live"
                      ? "bg-orange-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400 clutch-blink" />
                  Live ({liveCount})
                </button>
                <button
                  onClick={() => setSelectedFilter("soon")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition ${
                    selectedFilter === "soon"
                      ? "bg-orange-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Soon ({soonCount})
                </button>
                <button
                  onClick={() => setSelectedFilter("finished")}
                  className={`rounded-lg px-3 py-1.5 font-bold transition ${
                    selectedFilter === "finished"
                      ? "bg-orange-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Finished ({finishedCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COLLEGES CARDS GRID */}
        {filteredColleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((col) => (
              <CollegeCard
                key={col.id}
                college={col}
                isSelected={selectedCollege?.id === col.id}
                onSelect={(c) => setSelectedCollege(c)}
                onOpenDetails={(c) => setModalCollege(c)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 p-12 text-center">
            <p className="text-zinc-400 text-sm">
              No college arenas match your search query &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFilter("all");
              }}
              className="mt-4 rounded-lg bg-white/5 border border-white/10 px-4 py-2 font-mono text-xs text-orange-400 hover:bg-white/10 transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* FEATURED BANNER FOR YENEPOYA UNIVERSITY LIVE BROADCAST */}
        <div className="mt-14 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-black p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 clutch-blink" />
                Featured Active Tournament
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Yenepoya University, Mangalore Edition
              </h3>
              <p className="text-xs text-zinc-300 max-w-xl mt-1">
                Currently running with live point matrix, Super Admin verified match submissions, awards showcase, and official room codes for LH18 &amp; LH19.
              </p>
            </div>
          </div>

          <Link
            href="/leaderboards"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-600/30"
          >
            Open Live Standings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* COLLEGE DETAILS MODAL */}
      {modalCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-orange-500/30 bg-zinc-950 p-6 shadow-2xl text-white">
            <button
              onClick={() => setModalCollege(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                  modalCollege.status === "live"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : modalCollege.status === "soon"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {modalCollege.statusLabel}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {modalCollege.editionName}
              </span>
            </div>

            <h3 className="font-display text-2xl font-black text-white">
              {modalCollege.name}
            </h3>
            <p className="text-xs text-orange-400 font-medium flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {modalCollege.city}, {modalCollege.state} • {modalCollege.venue}
            </p>

            <div className="my-4 border-t border-b border-white/10 py-3 text-xs text-zinc-300 leading-relaxed">
              {modalCollege.description}
            </div>

            {/* Key Dates */}
            <div className="mb-4 space-y-1.5 bg-black/40 border border-white/5 p-3 rounded-xl">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                Tournament Key Dates
              </div>
              {modalCollege.dates.map((d, i) => (
                <div key={i} className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">{d.label}:</span>
                  <span className="text-white font-semibold">{d.value}</span>
                </div>
              ))}
            </div>

            {/* Games */}
            <div className="mb-6">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                Competitive Titles &amp; Format
              </div>
              <div className="grid grid-cols-2 gap-2">
                {modalCollege.games.map((g) => (
                  <div
                    key={g.slug}
                    className="rounded-lg border border-white/10 bg-white/5 p-2"
                  >
                    <div className="text-xs font-bold text-white">{g.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {g.format} • {g.genre}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-3">
              {modalCollege.slug === "mangalore" ? (
                <Link
                  href="/leaderboards"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-500 transition shadow-lg shadow-orange-600/30"
                >
                  <Trophy className="h-4 w-4" />
                  Launch Live Leaderboard
                </Link>
              ) : modalCollege.slug === "kanyakumari" ? (
                <a
                  href="https://niat-clutch.vercel.app/join"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-500 transition shadow-lg shadow-orange-600/30"
                >
                  <ExternalLink className="h-4 w-4" />
                  Join Kanyakumari Tournament
                </a>
              ) : (
                <button
                  onClick={() => setModalCollege(null)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10"
                >
                  Close Brief
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
