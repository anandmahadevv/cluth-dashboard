"use client";

import { useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

interface ProjectorToggleProps {
  onToggle?: (isExpanded: boolean) => void;
  className?: string;
}

export function ProjectorToggle({ onToggle, className }: ProjectorToggleProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (onToggle) onToggle(active);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [onToggle]);

  const toggleScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        if (onToggle) onToggle(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
        if (onToggle) onToggle(false);
      }
    } catch (err) {
      // Fallback for browsers blocking requestFullscreen
      setIsFullscreen(!isFullscreen);
      if (onToggle) onToggle(!isFullscreen);
    }
  };

  return (
    <button
      onClick={toggleScreen}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs ${className}`}
      title={isFullscreen ? "Exit Projector Poster View" : "Expand to Projector Poster View"}
    >
      {isFullscreen ? (
        <>
          <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
          <span>Exit Projector</span>
        </>
      ) : (
        <>
          <Maximize2 className="w-3.5 h-3.5 text-[#d97706]" />
          <span>Projector Mode</span>
        </>
      )}
    </button>
  );
}
