"use client";

import { usePathname } from "next/navigation";
import { EVENT_DETAILS } from "@/lib/constants";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on the single-screen home landing page
  if (pathname === "/" || pathname === "/43517" || pathname === "/poc") {
    return null;
  }

  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-center gap-2">
        <p className="font-medium text-slate-500">
          © 2026 {EVENT_DETAILS.fullName}. {EVENT_DETAILS.venue}.
        </p>

      </div>
    </footer>
  );
}
