"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Flame,
  Crosshair,
  Gamepad2,
  Brain,
  Maximize2,
} from "lucide-react";
import { EVENT_DETAILS } from "@/lib/constants";
import { ShareModal } from "../shared/share-modal";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: "Leaderboard", href: "/" },
    { name: "Match Results", href: "/results" },
    { name: "Winners", href: "/winners" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all shadow-2xs">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
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

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
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
