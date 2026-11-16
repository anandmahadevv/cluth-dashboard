"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  MapPin,
  Trophy,
} from "lucide-react";
import { EVENT_DETAILS } from "@/lib/constants";
import { ShareModal } from "../shared/share-modal";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide default navbar on the dedicated single-screen college selector home page
  if (pathname === "/") {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: "Choose College", href: "/" },
    { name: "Live Leaderboard", href: "/leaderboards" },
    { name: "Match Results", href: "/results" },
    { name: "Winners", href: "/winners" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all shadow-2xs">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-black border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/images/clutch-logo.jpg"
              alt="CLUTCH"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight text-slate-900 leading-none font-display">
              {EVENT_DETAILS.brand}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              NIAT Championship 2026
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                isActive(link.href)
                  ? "bg-slate-100 text-slate-900 font-black"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right CTA / Campus Indicator */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-mono font-semibold text-orange-700 hover:bg-orange-100 transition"
            title="Switch College Campus"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
            <MapPin className="h-3 w-3 text-orange-600" />
            <span>Mangalore (Yenepoya)</span>
          </Link>

          <div className="h-8 w-8 rounded-lg bg-[#7a1c22] border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center p-0.5 shrink-0" title="NIAT">
            <img
              src="/images/niat-logo.jpg"
              alt="NIAT Crest"
              className="w-full h-full object-contain"
            />
          </div>
          <ShareModal label="Share" />
        </div>

        {/* Mobile menu trigger */}
        <div className="sm:hidden flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-mono font-bold text-orange-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
            <span>Mangalore</span>
          </Link>

          <div className="h-7 w-7 rounded-md bg-[#7a1c22] border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center p-0.5 shrink-0">
            <img
              src="/images/niat-logo.jpg"
              alt="NIAT Crest"
              className="w-full h-full object-contain"
            />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-xs font-bold rounded-lg ${
                isActive(link.href)
                  ? "bg-slate-100 text-slate-900 font-black"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
