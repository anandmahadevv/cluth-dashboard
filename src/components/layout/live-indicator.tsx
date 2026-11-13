"use client";

import { useState, useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface LiveIndicatorProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  isTabActive?: boolean;
}

export function LiveIndicator({
  lastUpdated,
  isRefreshing,
  onRefresh,
  isTabActive = true,
}: LiveIndicatorProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 shadow-2xs">
      <div className="flex items-center gap-1.5">
        {isTabActive ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        ) : (
          <WifiOff className="h-3 w-3 text-slate-400" />
        )}
        <span className="font-bold tracking-wide uppercase text-slate-700 text-[10px]">
          {isTabActive ? "Live Feed" : "Paused"}
        </span>
      </div>

      <span className="text-slate-300">•</span>

      <span className="text-slate-500 font-mono text-[11px]">
        {formatTimeAgo(lastUpdated.toISOString())}
      </span>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="ml-0.5 rounded p-0.5 text-slate-400 hover:text-slate-700 transition disabled:opacity-50"
        title="Refresh live data"
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-[#d97706]" : ""}`} />
      </button>
    </div>
  );
}
