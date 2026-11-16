"use client";

import { useState } from "react";
import { CollegeDetail } from "@/lib/colleges-data";
import { Radio, Crosshair, MapPin, Activity, Sparkles } from "lucide-react";

interface ClutchRadarMapProps {
  colleges: CollegeDetail[];
  selectedCollegeId: string | null;
  onSelectCollege: (college: CollegeDetail) => void;
}

export function ClutchRadarMap({
  colleges,
  selectedCollegeId,
  onSelectCollege,
}: ClutchRadarMapProps) {
  const [hoveredCollege, setHoveredCollege] = useState<CollegeDetail | null>(null);

  const activeOrHovered = hoveredCollege || colleges.find((c) => c.id === selectedCollegeId) || colleges[0];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-orange-500/30 bg-radial-[at_top_right] from-zinc-900 via-black to-zinc-950 p-4 sm:p-6 text-white shadow-2xl">
      {/* Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="clutch-blink absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-600"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase tracking-widest text-orange-400">
                CLUTCH TACTICAL RADAR
              </span>
              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-orange-300">
                V2.6 LIVE
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              ARENA SECTOR: ALL-INDIA COLLEGIATE GRID
            </span>
          </div>
        </div>

        {/* Selected College Telemetry */}
        {activeOrHovered && (
          <div className="hidden sm:flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Crosshair className="h-3.5 w-3.5 text-orange-400" />
              <span className="font-bold text-white">{activeOrHovered.city}</span>
              <span className="text-zinc-500">[{activeOrHovered.slug.toUpperCase()}]</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span>LAT/LONG:</span>
              <span className="text-orange-400">
                {activeOrHovered.coordinates.x.toFixed(1)}°E / {activeOrHovered.coordinates.y.toFixed(1)}°N
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main 3D Radar Container */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-center pt-4">
        {/* Radar Canvas Box */}
        <div className="cmap-perspective-box relative mx-auto h-[360px] sm:h-[420px] w-full max-w-[500px]">
          {/* 3D Isometric Tilt Plane */}
          <div className="cmap-plane">
            {/* Grid Mesh */}
            <div className="cmap-grid-bg" />

            {/* Radar Arc Signals */}
            <svg
              className="cmap-arcs-svg pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M 10 90 Q 50 20 90 90" />
              <path d="M 20 80 Q 50 35 80 80" />
              <path d="M 30 70 Q 50 50 70 70" />
              <line
                x1="50"
                y1="0"
                x2="50"
                y2="100"
                stroke="rgba(255, 85, 0, 0.25)"
                strokeDasharray="2 4"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                stroke="rgba(255, 85, 0, 0.25)"
                strokeDasharray="2 4"
                strokeWidth="1"
              />
            </svg>

            {/* College Beacon Nodes */}
            {colleges.map((col) => {
              const isSelected = selectedCollegeId === col.id;
              const isHovered = hoveredCollege?.id === col.id;
              const isLive = col.status === "live";

              return (
                <div
                  key={col.id}
                  style={{
                    left: `${col.coordinates.x}%`,
                    top: `${col.coordinates.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  onClick={() => onSelectCollege(col)}
                  onMouseEnter={() => setHoveredCollege(col)}
                  onMouseLeave={() => setHoveredCollege(null)}
                >
                  {/* Vertical Light Beam for Live/Selected Nodes */}
                  {(isLive || isSelected) && (
                    <div
                      className={`cmap-light-beam ${
                        isLive ? "h-24 sm:h-32" : "h-16"
                      }`}
                    />
                  )}

                  {/* Pulsing Sonar Ring for Live Beacons */}
                  {isLive && (
                    <>
                      <span className="cmap-beacon-ring" />
                      <span className="cmap-beacon-ring cmap-beacon-ring-2" />
                    </>
                  )}

                  {/* Node Core Pin */}
                  <div
                    className={`relative flex items-center justify-center rounded-full transition-transform duration-300 ${
                      isLive
                        ? "h-4 w-4 bg-orange-500 shadow-[0_0_15px_#ff5500]"
                        : col.status === "soon"
                        ? "h-3 w-3 bg-cyan-400 shadow-[0_0_10px_#06b6d4]"
                        : "h-2.5 w-2.5 bg-zinc-500 shadow-[0_0_6px_#71717a]"
                    } ${isHovered || isSelected ? "scale-150 ring-2 ring-white" : ""}`}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>

                  {/* Node Label Popover */}
                  <div
                    className={`pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider backdrop-blur-md transition-all duration-200 z-30 ${
                      isSelected || isHovered
                        ? "border-orange-500 bg-black/90 text-orange-400 opacity-100 scale-105"
                        : "border-white/10 bg-black/60 text-zinc-300 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.city}</span>
                      {isLive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactical Info Panel for Active/Hovered Node */}
        {activeOrHovered && (
          <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-900/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider ${
                  activeOrHovered.status === "live"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : activeOrHovered.status === "soon"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "bg-zinc-700/30 text-zinc-400 border border-zinc-700"
                }`}
              >
                {activeOrHovered.status === "live" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 clutch-blink" />
                )}
                {activeOrHovered.statusLabel}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {activeOrHovered.editionName}
              </span>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold tracking-tight text-white">
                {activeOrHovered.name}
              </h3>
              <p className="text-xs text-orange-400/90 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {activeOrHovered.city}, {activeOrHovered.state}
              </p>
            </div>

            <p className="line-clamp-2 text-xs text-zinc-400 leading-relaxed">
              {activeOrHovered.description}
            </p>

            <div className="border-t border-white/10 pt-3">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">
                Competitive Titles
              </div>
              <div className="flex flex-wrap gap-1">
                {activeOrHovered.games.map((g) => (
                  <span
                    key={g.slug}
                    className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectCollege(activeOrHovered)}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white transition hover:bg-orange-500 active:scale-95 shadow-lg shadow-orange-600/30"
            >
              <Crosshair className="h-3.5 w-3.5" />
              Focus {activeOrHovered.city} Sector
            </button>
          </div>
        )}
      </div>

      {/* Bottom Scanning Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 clutch-blink" />
            <span className="text-white font-bold">Live Sector (2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>Coming Up (7)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-500" />
            <span>Hall of Fame (2)</span>
          </div>
        </div>
        <div className="text-zinc-500">
          Click any radar beacon to choose college
        </div>
      </div>
    </div>
  );
}
