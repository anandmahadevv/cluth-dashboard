"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  MapPin,
  ChevronDown,
  Check,
  Sparkles,
  Trophy,
} from "lucide-react";
import { EVENT_DETAILS } from "@/lib/constants";
import { ShareModal } from "../shared/share-modal";

export interface CampusItem {
  id: string;
  name: string;
  university: string;
  status: string;
  statusBadge: string;
  isLive?: boolean;
}

const CAMPUSES: CampusItem[] = [
  {
    id: "mangalore",
    name: "Mangalore",
    university: "Yenepoya University",
    status: "Concluded",
    statusBadge: "bg-emerald-500",
    isLive: true,
  },
  {
    id: "kanyakumari",
    name: "Kanyakumari",
    university: "NIAT Kanyakumari",
    status: "Live Arena",
    statusBadge: "bg-amber-500",
    isLive: true,
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    university: "NIAT Coimbatore",
    status: "Arena Ready",
    statusBadge: "bg-blue-500",
    isLive: true,
  },
  {
    id: "bangalore",
    name: "Bangalore",
    university: "NIAT Bangalore",
    status: "Arena Ready",
    statusBadge: "bg-purple-500",
    isLive: true,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<CampusItem>(CAMPUSES[0]);
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setCampusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync initial campus from URL or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCampus = params.get("campus") || params.get("college");
      const stored = localStorage.getItem("clutch_selected_campus");
      const targetId = urlCampus || stored || "mangalore";
      const match = CAMPUSES.find((c) => c.id === targetId);
      if (match) setSelectedCampus(match);
    }
  }, [pathname]);

  const handleSelectCampus = (campus: CampusItem) => {
    setSelectedCampus(campus);
    setCampusDropdownOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("clutch_selected_campus", campus.id);
      window.dispatchEvent(new CustomEvent("clutch_campus_change", { detail: campus.id }));
      router.push(`${pathname}?campus=${campus.id}`);
    }
  };

  const getHrefWithCampus = (path: string) => {
    if (selectedCampus && selectedCampus.id && selectedCampus.id !== "mangalore") {
      return `${path}${path.includes("?") ? "&" : "?"}campus=${selectedCampus.id}`;
    }
    return path;
  };

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

  if (pathname === "/43517" || pathname === "/poc" || pathname === "/campus-admin") return null;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e1e4dd] bg-[#f5f4f0]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link href={getHrefWithCampus("/")} className="flex items-center gap-2.5">
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
                href={getHrefWithCampus(link.href)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  isActive(link.href)
                    ? "bg-[#e8eae2] text-[#17211e] font-black"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action & Campus Selector */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Campus Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition shadow-2xs hover:border-slate-300 select-none cursor-pointer"
                title="Change Campus Arena"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedCampus.name}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    campusDropdownOpen ? "rotate-180 text-slate-700" : ""
                  }`}
                />
              </button>

              {campusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Select Campus Arena
                  </div>
                  <div className="space-y-1">
                    {CAMPUSES.map((c) => {
                      const isChosen = selectedCampus.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCampus(c)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition ${
                            isChosen
                              ? "bg-slate-100 text-slate-900 font-bold border border-slate-200/80 shadow-2xs"
                              : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${c.statusBadge}`} />
                            <div>
                              <div className="text-xs font-bold leading-snug flex items-center gap-1">
                                <span>{c.name}</span>
                                {isChosen && <Check className="w-3 h-3 text-emerald-600" />}
                              </div>
                              <div className="text-[10px] text-slate-400">{c.university}</div>
                            </div>
                          </div>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                            {c.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1.5 border-t border-slate-100">
                    <Link
                      href="/choose-campus"
                      onClick={() => setCampusDropdownOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-orange-600 hover:bg-orange-50 transition"
                    >
                      <span>Explore All Campus Hubs</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* NIAT Logo */}
            <div
              className="h-8 w-8 rounded-lg bg-[#7a1c22] border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center p-0.5 shrink-0"
              title="NIAT Crest"
            >
              <img
                src="/images/niat-logo.jpg"
                alt="NIAT Crest"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Share */}
            <ShareModal label="Share" />
          </div>

          {/* Mobile Right Controls */}
          <div className="sm:hidden flex items-center gap-1.5">
            {/* Mobile Campus Selector Button */}
            <button
              type="button"
              onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-800"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{selectedCampus.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

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

        {/* Mobile Dropdown & Menu */}
        {campusDropdownOpen && (
          <div className="sm:hidden border-b border-slate-200 bg-white p-3 space-y-1.5 shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
              Select Campus Arena
            </div>
            {CAMPUSES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCampus(c)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs ${
                  selectedCampus.id === c.id
                    ? "bg-slate-100 text-slate-900 font-bold border border-slate-200"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.statusBadge}`} />
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.university}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {c.status}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Mobile Nav Links */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={getHrefWithCampus(link.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-bold rounded-lg ${
                  isActive(link.href)
                    ? "bg-[#e8eae2] text-[#17211e] font-black"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Floating Notice when selecting upcoming campuses */}
      {noticeMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-slate-900 text-white p-3.5 shadow-2xl border border-slate-700 flex items-start gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold leading-relaxed text-slate-200">
              {noticeMessage}
            </p>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
