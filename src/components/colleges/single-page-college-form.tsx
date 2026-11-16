"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  COLLEGES_DATA,
  CollegeDetail,
} from "@/lib/colleges-data";
import {
  Trophy,
  MapPin,
  Calendar,
  Gamepad2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Check,
  ShieldCheck,
  Radio,
  Flame,
} from "lucide-react";

export function SinglePageCollegeForm() {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string>("mangalore");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCollege =
    COLLEGES_DATA.find((c) => c.slug === selectedSlug) || COLLEGES_DATA[0];

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCollege.slug === "kanyakumari" && currentCollege.externalLink) {
      window.open(currentCollege.externalLink, "_blank");
    } else {
      router.push(`/leaderboards?college=${currentCollege.slug}`);
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#060709] text-zinc-100 selection:bg-orange-500 selection:text-white">
      {/* Background Cyber Texture & Lighting */}
      <div className="cyber-grid-floor absolute inset-0 pointer-events-none opacity-20 overflow-hidden" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[800px] bg-gradient-to-b from-orange-500/15 via-orange-600/5 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-64 w-[600px] bg-gradient-to-t from-orange-500/10 to-transparent blur-[100px]" />

      {/* TOP BRANDING: NIAT & CLUTCH */}
      <header className="relative z-30 w-full border-b border-white/[0.08] bg-black/60 backdrop-blur-xl px-4 sm:px-8 py-3.5 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Brand Lockup */}
          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-95">
            {/* Official Stylized CLUTCH Logo */}
            <div className="relative flex items-center">
              <div className="absolute -inset-1 rounded-lg bg-orange-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <img
                src="/brand/clutch-logo-320.webp"
                alt="CLUTCH"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-[0_0_14px_rgba(255,85,0,0.5)]"
              />
            </div>

            {/* Refined 'BY' Separator */}
            <span className="font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] select-none">
              by
            </span>

            {/* NIAT Premium Crest & Badge */}
            <div className="flex items-center gap-2 rounded-lg bg-[#7a1c22]/20 border border-[#7a1c22]/60 px-2.5 py-1 backdrop-blur-md shadow-sm transition-colors group-hover:border-[#7a1c22]/90 group-hover:bg-[#7a1c22]/30">
              <div className="h-4 w-4 rounded-full overflow-hidden border border-rose-400/40 shrink-0">
                <img
                  src="/images/niat-logo.jpg"
                  alt="NIAT Crest"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-mono text-[12px] font-extrabold tracking-[0.14em] text-rose-300 uppercase">
                NIAT
              </span>
              <span className="hidden sm:inline-block h-2.5 w-px bg-rose-400/30" />
              <span className="hidden sm:inline-block font-mono text-[10px] tracking-wider text-rose-300/80">
                ESPORTS
              </span>
            </div>
          </Link>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-mono text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              <span className="font-semibold text-zinc-200">SEASON ONE</span>
              <span className="text-zinc-600">/</span>
              <span className="text-orange-400 font-bold">2 LIVE ARENAS</span>
            </div>

            <Link
              href="/leaderboards"
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-[13px] font-semibold text-zinc-200 hover:text-white hover:bg-white/10 hover:border-white/25 transition shadow-sm"
            >
              <Trophy className="h-3.5 w-3.5 text-orange-400" />
              <span>Leaderboards</span>
            </Link>
          </div>
        </div>
      </header>

      {/* CENTER: STREAMLINED PREMIUM FORM */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-3 sm:py-6 overflow-hidden">
        <div className="w-full max-w-[540px]">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-orange-400 mb-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              <span>COLLEGIATE ESPORTS ARENA</span>
            </div>

            <h1 className="clutch-glitch font-display text-[34px] sm:text-[40px] font-black uppercase tracking-tight text-white leading-none">
              CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">COLLEGE</span>
            </h1>

            <p className="text-[14px] text-zinc-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              Select your NIAT campus to view verified standings, tournament brackets, and live results.
            </p>
          </div>

          {/* Premium Form Card */}
          <form
            onSubmit={handleSubmit}
            className="clutch-hud relative rounded-2xl border border-white/[0.12] bg-zinc-950/85 p-6 shadow-2xl backdrop-blur-2xl"
          >
            {/* Top Tactical Telemetry Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4.5 font-mono text-[12px]">
              <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-orange-400" />
                CAMPUS SECTOR SELECTOR
              </span>
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-zinc-300 font-semibold text-[11px]">
                11 CAMPUSES
              </span>
            </div>

            {/* Custom Interactive College Selector */}
            <div className="relative mb-4" ref={dropdownRef}>
              <label className="block text-[12px] font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Target Campus
              </label>

              {/* Selector Trigger Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-zinc-900/90 px-4 py-3 text-left transition hover:border-orange-500/50 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      currentCollege.status === "live"
                        ? "bg-orange-500 clutch-blink shadow-[0_0_8px_#ff5500]"
                        : currentCollege.status === "soon"
                        ? "bg-cyan-400"
                        : "bg-zinc-500"
                    }`}
                  />
                  <div className="truncate">
                    <span className="text-[15px] font-bold text-white">
                      {currentCollege.name}
                    </span>
                    <span className="text-[13px] text-zinc-400 font-medium ml-2">
                      — {currentCollege.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                      currentCollege.status === "live"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                        : currentCollege.status === "soon"
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {currentCollege.status === "live"
                      ? "LIVE"
                      : currentCollege.status === "soon"
                      ? "UPCOMING"
                      : "ARCHIVED"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-orange-400" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Custom Dropdown Menu */}
              {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-64 overflow-y-auto rounded-xl border border-white/15 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl p-1.5 space-y-1">
                  {/* Category: Live */}
                  <div className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400">
                    Live Active Tournaments
                  </div>
                  {COLLEGES_DATA.filter((c) => c.status === "live").map((col) => {
                    const isSelected = col.slug === selectedSlug;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlug(col.slug);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition ${
                          isSelected
                            ? "bg-orange-500/20 text-white font-bold border border-orange-500/40"
                            : "text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="h-2 w-2 rounded-full bg-orange-500 clutch-blink shrink-0" />
                          <span className="truncate">{col.name}</span>
                          <span className="text-[12px] text-zinc-400 font-mono">
                            ({col.city})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-orange-300">
                            LIVE
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-orange-400" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Category: Upcoming */}
                  <div className="px-2.5 pt-2 pb-1 text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 border-t border-white/[0.06]">
                    Upcoming Campus Circuits
                  </div>
                  {COLLEGES_DATA.filter((c) => c.status === "soon").map((col) => {
                    const isSelected = col.slug === selectedSlug;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlug(col.slug);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition ${
                          isSelected
                            ? "bg-cyan-500/20 text-white font-bold border border-cyan-500/40"
                            : "text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                          <span className="truncate">{col.name}</span>
                          <span className="text-[12px] text-zinc-400 font-mono">
                            ({col.city})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                            SOON
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                        </div>
                      </button>
                    );
                  })}

                  {/* Category: Archived */}
                  <div className="px-2.5 pt-2 pb-1 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 border-t border-white/[0.06]">
                    Hall of Fame (Completed)
                  </div>
                  {COLLEGES_DATA.filter((c) => c.status === "finished").map((col) => {
                    const isSelected = col.slug === selectedSlug;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlug(col.slug);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] transition ${
                          isSelected
                            ? "bg-zinc-800 text-white font-bold border border-zinc-700"
                            : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="h-2 w-2 rounded-full bg-zinc-500 shrink-0" />
                          <span className="truncate">{col.name}</span>
                          <span className="text-[12px] text-zinc-400 font-mono">
                            ({col.city})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-400">
                            ARCHIVED
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-zinc-300" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Campus Information Card */}
            <div className="rounded-xl border border-white/[0.08] bg-black/50 p-4 mb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
                    currentCollege.status === "live"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                      : currentCollege.status === "soon"
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {currentCollege.status === "live" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
                  )}
                  {currentCollege.statusLabel}
                </span>

                <span className="text-[12px] font-mono text-zinc-400 flex items-center gap-1 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  {currentCollege.city}, {currentCollege.state}
                </span>
              </div>

              {/* Campus Name & Venue */}
              <div>
                <h3 className="font-display text-[19px] font-bold text-white tracking-tight">
                  {currentCollege.name}
                </h3>
                <p className="text-[12px] text-zinc-400 line-clamp-1 mt-0.5">
                  {currentCollege.venue}
                </p>
              </div>

              {/* Tournament Key Date & Competitive Titles */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5 text-[12px] font-mono">
                {currentCollege.dates && currentCollege.dates[0] && (
                  <div className="text-zinc-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-zinc-400">{currentCollege.dates[0].label}:</span>
                    <span className="text-orange-400 font-bold">
                      {currentCollege.dates[0].value}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {currentCollege.games.slice(0, 3).map((g) => (
                    <span
                      key={g.slug}
                      className="rounded bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] text-zinc-300 font-mono"
                    >
                      {g.name}
                    </span>
                  ))}
                  {currentCollege.games.length > 3 && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      +{currentCollege.games.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Action Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 px-5 py-3.5 font-display text-[15px] font-black uppercase tracking-wider text-white shadow-xl shadow-orange-600/25 transition hover:brightness-110 active:scale-[0.99]"
            >
              <Trophy className="h-4 w-4" />
              <span>
                {currentCollege.slug === "kanyakumari"
                  ? "Build Squad / Join Kanyakumari"
                  : "Enter Tournament Dashboard"}
              </span>
              {currentCollege.slug === "kanyakumari" ? (
                <ExternalLink className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </main>

      {/* BOTTOM MARQUEE TICKER */}
      <footer className="relative z-30 w-full border-t border-white/[0.08] bg-black/80 backdrop-blur-xl py-2.5 overflow-hidden shrink-0">
        <div className="clutch-marquee-track flex items-center gap-8 text-[12px] font-mono tracking-widest uppercase">
          <div className="flex items-center gap-8 shrink-0">
            <span className="flex items-center gap-2 text-orange-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              KANYAKUMARI LIVE
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-emerald-400 font-bold">
              YENEPOYA UNIVERSITY MANGALORE EDITION LIVE
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-zinc-400">
              BENGALURU • PUNE • DELHI-NCR • JAIPUR • COIMBATORE • NASHIK • NCR
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-cyan-400 font-semibold">
              HYDERABAD &amp; CHENNAI HALL OF FAME
            </span>
            <span className="text-zinc-600">//</span>
          </div>

          <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
            <span className="flex items-center gap-2 text-orange-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              KANYAKUMARI LIVE
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-emerald-400 font-bold">
              YENEPOYA UNIVERSITY MANGALORE EDITION LIVE
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-zinc-400">
              BENGALURU • PUNE • DELHI-NCR • JAIPUR • COIMBATORE • NASHIK • NCR
            </span>
            <span className="text-zinc-600">//</span>
            <span className="text-cyan-400 font-semibold">
              HYDERABAD &amp; CHENNAI HALL OF FAME
            </span>
            <span className="text-zinc-600">//</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
