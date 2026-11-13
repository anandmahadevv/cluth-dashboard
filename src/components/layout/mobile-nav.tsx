"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { GAMES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games", isSection: true },
  ...Object.values(GAMES).map((game) => ({
    href: `/games/${game.slug}`,
    label: game.name,
    indent: true,
  })),
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/results", label: "Results" },
  { href: "/winners", label: "Winners" },
];

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  isLive: boolean;
}

export function MobileNav({ open, onClose, isLive }: MobileNavProps) {
  const pathname = usePathname();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-72 bg-card border-l border-border shadow-2xl shadow-black/40 transition-transform duration-300 ease-out md:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CLUTCH
            </span>
            {isLive && (
              <Badge
                variant="destructive"
                className="animate-pulse text-[10px] px-1.5 py-0"
              >
                LIVE
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    "indent" in link && link.indent && "pl-8 text-xs",
                    "isSection" in link &&
                      link.isSection &&
                      "text-xs uppercase tracking-wider text-muted-foreground mt-4 mb-1 pointer-events-none",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-4">
          <p className="text-[11px] text-muted-foreground text-center">
            Public Dashboard — Read Only
          </p>
        </div>
      </div>
    </>
  );
}
