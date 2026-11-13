"use client";

import { useState } from "react";
import { Share2, Check, Copy, X } from "lucide-react";

interface ShareModalProps {
  title?: string;
  url?: string;
  label?: string;
}

export function ShareModal({
  title = "CLUTCH – NIAT E-Sports Championship Mangalore Edition",
  url,
  label = "Share",
}: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return url || window.location.href;
    }
    return url || "https://clutch-dashboard.vercel.app";
  };

  const handleShareClick = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: "Check out the live standings at CLUTCH – NIAT E-Sports Championship 2026!",
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to modal
      }
    }
    setIsOpen(true);
  };

  const handleCopy = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={handleShareClick}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        title="Share leaderboard"
      >
        <Share2 className="h-3 w-3 text-slate-500" />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-bold text-slate-900 text-sm mb-1">Share Leaderboard</h3>
            <p className="text-xs text-slate-500 mb-4">
              Share official live standings with students and spectators.
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
              <input
                type="text"
                readOnly
                value={getShareUrl()}
                className="w-full bg-transparent px-2 text-xs font-mono text-slate-700 outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
