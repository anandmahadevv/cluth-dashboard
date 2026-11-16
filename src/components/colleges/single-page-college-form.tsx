"use client";

import { useState } from "react";
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
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function SinglePageCollegeForm() {
  const router = useRouter();
  // Default to Yenepoya Mangalore (the active tournament)
  const [selectedSlug, setSelectedSlug] = useState<string>("mangalore");

  const currentCollege =
    COLLEGES_DATA.find((c) => c.slug === selectedSlug) || COLLEGES_DATA[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCollege.slug === "kanyakumari" && currentCollege.externalLink) {
      window.open(currentCollege.externalLink, "_blank");
    } else {
      router.push(`/leaderboards?college=${currentCollege.slug}`);
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#070709] text-white selection:bg-orange-500 selection:text-white">
      {/* Background Cyber Grid Floor */}
      <div className="cyber-grid-floor absolute inset-0 pointer-events-none opacity-30 overflow-hidden" />

      {/* Ambient Radial Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[700px] bg-gradient-to-b from-orange-600/20 via-orange-500/5 to-transparent blur-3xl" />

      {/* TOP BRANDING BAR: NIAT & CLUTCH */}
      <header className="relative z-20 w-full border-b border-orange-500/20 bg-black/60 backdrop-blur-md px-4 sm:px-8 py-3 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-black border border-orange-500/40 shadow-lg shadow-orange-500/10 overflow-hidden flex items-center justify-center p-0.5">
              <img
                src="/images/clutch-logo.jpg"
                alt="CLUTCH"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-black tracking-tight text-white leading-none">
                CLUTCH
              </span>
              <span className="font-mono text-xs text-zinc-500">by</span>
              <div className="flex items-center gap-1.5 rounded-md bg-[#7a1c22]/30 border border-[#7a1c22]/60 px-2 py-0.5">
                <span className="font-mono text-xs font-bold text-rose-300 tracking-wider">
                  NIAT
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              <span>ESPORTS CHAMPIONSHIP</span>
            </div>

            <Link
              href="/leaderboards"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/10 transition"
            >
              <Trophy className="h-3.5 w-3.5 text-orange-400" />
              <span>Leaderboards</span>
            </Link>
          </div>
        </div>
      </header>

      {/* CENTER: THE ONE FORM CARD */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 overflow-hidden">
        <div className="w-full max-w-xl">
          {/* Headline with Clutch Glitch animation */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-0.5 font-mono text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              <span>SELECT YOUR CAMPUS ARENA</span>
            </div>
            <h1 className="clutch-glitch font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300">COLLEGE</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              Clutch is played campus by campus. Select your college below to enter the live broadcast arena.
            </p>
          </div>

          {/* THE FORM CARD */}
          <form
            onSubmit={handleSubmit}
            className="clutch-hud relative overflow-hidden rounded-2xl border border-orange-500/40 bg-zinc-950/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl"
          >
            {/* Top Tactical Label */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 font-mono text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                COLLEGE ROSTER SELECTION
              </span>
              <span className="text-orange-400 font-bold">11 CAMPUSES</span>
            </div>

            {/* College Dropdown Field */}
            <div className="space-y-1.5 mb-4">
              <label
                htmlFor="college-select"
                className="block font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-300"
              >
                Choose College / Campus
              </label>

              <div className="relative">
                <select
                  id="college-select"
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-orange-500/30 bg-zinc-900/95 px-4 py-3 text-sm font-semibold text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition cursor-pointer pr-10"
                >
                  <optgroup label="Live Active Tournaments" className="bg-zinc-950 text-orange-400 font-bold">
                    <option value="mangalore" className="text-white">
                      🔴 [LIVE] Yenepoya University — Mangalore
                    </option>
                    <option value="kanyakumari" className="text-white">
                      🔴 [LIVE] NIAT Kanyakumari Campus — Kanyakumari
                    </option>
                  </optgroup>

                  <optgroup label="Upcoming Campus Circuits" className="bg-zinc-950 text-cyan-400 font-bold">
                    <option value="bengaluru" className="text-white">
                      ⏳ [SOON] S-VYASA / St. Peter's — Bengaluru
                    </option>
                    <option value="pune" className="text-white">
                      ⏳ [SOON] Ajeenkya DY Patil University — Pune
                    </option>
                    <option value="delhi-ncr" className="text-white">
                      ⏳ [SOON] NIAT Greater Noida / Meerut — Delhi NCR
                    </option>
                    <option value="jaipur" className="text-white">
                      ⏳ [SOON] NIAT Jaipur Campus — Jaipur
                    </option>
                    <option value="coimbatore" className="text-white">
                      ⏳ [SOON] NIAT Coimbatore Campus — Coimbatore
                    </option>
                    <option value="nashik" className="text-white">
                      ⏳ [SOON] NIAT Nashik Campus — Nashik
                    </option>
                    <option value="ncr" className="text-white">
                      ⏳ [SOON] NCR Tech Division — NCR
                    </option>
                  </optgroup>

                  <optgroup label="Hall of Fame (Completed)" className="bg-zinc-950 text-zinc-400 font-bold">
                    <option value="hyderabad" className="text-white">
                      🏆 [FINISHED] Aurora & Chaitanya — Hyderabad
                    </option>
                    <option value="chennai" className="text-white">
                      🏆 [FINISHED] NIAT Chennai Campus — Chennai
                    </option>
                  </optgroup>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
              </div>
            </div>

            {/* Selected College Preview Box */}
            <div className="rounded-xl border border-white/10 bg-black/50 p-3.5 mb-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    currentCollege.status === "live"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                      : currentCollege.status === "soon"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {currentCollege.status === "live" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
                  )}
                  {currentCollege.statusLabel}
                </span>

                <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-orange-400" />
                  {currentCollege.city}, {currentCollege.state}
                </span>
              </div>

              {/* Campus Name & Venue */}
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  {currentCollege.name}
                </h3>
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {currentCollege.venue}
                </p>
              </div>

              {/* Key Date and Games */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2 text-[11px] font-mono">
                {currentCollege.dates && currentCollege.dates[0] && (
                  <div className="text-zinc-300 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-zinc-400" />
                    <span>{currentCollege.dates[0].label}:</span>
                    <span className="text-orange-400 font-bold">
                      {currentCollege.dates[0].value}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {currentCollege.games.slice(0, 3).map((g) => (
                    <span
                      key={g.slug}
                      className="rounded bg-white/5 border border-white/10 px-1.5 py-0.2 text-[9px] text-zinc-300"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 font-display text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-orange-600/30 transition hover:from-orange-500 hover:to-amber-500 active:scale-[0.99]"
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

      {/* BOTTOM CLUTCH ANIMATED MARQUEE TICKER */}
      <footer className="relative z-20 w-full border-t border-orange-500/20 bg-black/80 backdrop-blur-md py-2 overflow-hidden shrink-0">
        <div className="clutch-marquee-track flex items-center gap-8 text-[11px] font-mono tracking-widest uppercase">
          <div className="flex items-center gap-8 shrink-0">
            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              KANYAKUMARI LIVE
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-bold">
              YENEPOYA UNIVERSITY MANGALORE EDITION LIVE
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              BENGALURU • PUNE • DELHI-NCR • JAIPUR • COIMBATORE • NASHIK • NCR
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 font-bold">
              HYDERABAD &amp; CHENNAI HALL OF FAME
            </span>
            <span className="text-zinc-600">•</span>
          </div>

          <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
              KANYAKUMARI LIVE
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-bold">
              YENEPOYA UNIVERSITY MANGALORE EDITION LIVE
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              BENGALURU • PUNE • DELHI-NCR • JAIPUR • COIMBATORE • NASHIK • NCR
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-cyan-400 font-bold">
              HYDERABAD &amp; CHENNAI HALL OF FAME
            </span>
            <span className="text-zinc-600">•</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
