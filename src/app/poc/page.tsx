"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Flame,
  Crosshair,
  Target,
  Gamepad2,
  Brain,
  Loader2,
  ArrowLeft,
  Clock,
  Sparkles,
  GripVertical,
  Plus,
  Minus,
  Camera,
  Search,
  Crown,
  X,
  FileImage,
} from "lucide-react";
import { GameId } from "@/types";
import { PLACEMENT_POINTS } from "@/lib/tournament-constants";

interface TeamEntry {
  id: string;
  teamName: string;
  gameId: GameId;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  rank: number;
}

interface TeamScoreInput {
  teamId: string;
  placement: number;
  kills: number;
  placementPoints: number;
  matchTotal: number;
}

export default function PocPortalPage() {
  const [selectedGame, setSelectedGame] = useState<GameId>("FREE_FIRE");
  const [pocCode, setPocCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Scoring Step state
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [orderedTeamIds, setOrderedTeamIds] = useState<string[]>([]);
  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [scores, setScores] = useState<Record<string, TeamScoreInput>>({});
  const [proofUrl, setProofUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [pasteNotice, setPasteNotice] = useState(false);

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Helper to calculate placement and match points for any game
  const calcMatchPoints = (placement: number, kills: number, gameId: GameId) => {
    const matrix = PLACEMENT_POINTS[gameId];
    const placePts =
      matrix && placement >= 1 && placement <= matrix.length
        ? matrix[placement - 1]
        : 0;
    const effectiveKills = gameId === "VALORANT" ? 0 : kills || 0;
    return {
      placementPoints: placePts,
      matchTotal: placePts + effectiveKills,
    };
  };

  // Reorder teams when dragged or nudged
  const reorderTeams = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= orderedTeamIds.length ||
      toIndex >= orderedTeamIds.length
    ) {
      return;
    }

    const newOrder = [...orderedTeamIds];
    const [movedId] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedId);
    setOrderedTeamIds(newOrder);

    // Auto-update placements 1 to N based on the new array order
    setScores((prev) => {
      const updated = { ...prev };
      newOrder.forEach((teamId, idx) => {
        const place = idx + 1;
        const current = updated[teamId] || {
          teamId,
          placement: place,
          kills: 0,
          placementPoints: 0,
          matchTotal: 0,
        };
        const pts = calcMatchPoints(place, current.kills, selectedGame);
        updated[teamId] = {
          ...current,
          placement: place,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        };
      });
      return updated;
    });
  };

  // Fast pin to Rank #1
  const pinToFirst = (teamId: string) => {
    const fromIndex = orderedTeamIds.indexOf(teamId);
    if (fromIndex > 0) {
      reorderTeams(fromIndex, 0);
    }
  };

  // Move 1 position up or down
  const moveOneSlot = (teamId: string, direction: "UP" | "DOWN") => {
    const curIdx = orderedTeamIds.indexOf(teamId);
    if (curIdx === -1) return;
    const targetIdx = direction === "UP" ? curIdx - 1 : curIdx + 1;
    reorderTeams(curIdx, targetIdx);
  };

  // Verify Code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/poc/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: pocCode, gameId: selectedGame }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(
          data.error || "Invalid verification code. Please check with Tournament Admin."
        );
        setIsVerifying(false);
        return;
      }

      setTeams(data.teams);
      const teamIdList = data.teams.map((t: TeamEntry) => t.id);
      setOrderedTeamIds(teamIdList);

      // Initialize scores in order 1..N
      const initialScores: Record<string, TeamScoreInput> = {};
      teamIdList.forEach((id: string, idx: number) => {
        const place = idx + 1;
        const pts = calcMatchPoints(place, 0, selectedGame);
        initialScores[id] = {
          teamId: id,
          placement: place,
          kills: 0,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        };
      });

      setScores(initialScores);
      setIsUnlocked(true);
    } catch (err: any) {
      setAuthError(err.message || "Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Update Kills for a Team
  const handleKillsChange = (teamId: string, newKills: number) => {
    const safeKills = Math.max(0, newKills);
    setScores((prev) => {
      const current = prev[teamId] || {
        teamId,
        placement: 1,
        kills: 0,
        placementPoints: 0,
        matchTotal: 0,
      };
      const pts = calcMatchPoints(current.placement, safeKills, selectedGame);
      return {
        ...prev,
        [teamId]: {
          ...current,
          kills: safeKills,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        },
      };
    });
  };

  // Auto-fill placements 1 to N in current order
  const handleResetOrder = () => {
    setScores((prev) => {
      const updated = { ...prev };
      orderedTeamIds.forEach((tId, idx) => {
        const place = idx + 1;
        const currentKills = updated[tId]?.kills || 0;
        const pts = calcMatchPoints(place, currentKills, selectedGame);
        updated[tId] = {
          teamId: tId,
          placement: place,
          kills: currentKills,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        };
      });
      return updated;
    });
  };

  // Unified In-Browser Canvas Image Compression (File, Camera & Clipboard Paste)
  const processImageFile = (file: File) => {
    setIsUploading(true);
    setUploadError("");

    try {
      if (file.size > 15 * 1024 * 1024) {
        throw new Error("File is too large (>15MB). Please choose a smaller screenshot.");
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL("image/jpeg", 0.75);
              setProofUrl(compressed);
            } else {
              setProofUrl(rawDataUrl);
            }
          } catch {
            setProofUrl(rawDataUrl);
          } finally {
            setIsUploading(false);
          }
        };

        img.onerror = () => {
          setProofUrl(rawDataUrl);
          setIsUploading(false);
        };

        img.src = rawDataUrl;
      };

      reader.onerror = () => {
        setUploadError("Failed to read image file.");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || "Failed to process image.");
      setIsUploading(false);
    }
  };

  // Global Clipboard Paste Listener (Ctrl + V anywhere)
  useEffect(() => {
    if (!isUnlocked) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            setPasteNotice(true);
            setTimeout(() => setPasteNotice(false), 3000);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isUnlocked]);

  // Submit Match Results
  const handleSubmitMatch = async () => {
    if (!proofUrl) {
      setSubmitError(
        "Mandatory Proof Required: Please upload, take a photo, or paste a match screenshot before submitting."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const teamResults = orderedTeamIds.map((tId, idx) => {
        const sc = scores[tId] || {
          teamId: tId,
          placement: idx + 1,
          placementPoints: 0,
          kills: 0,
        };
        return {
          teamId: tId,
          placement: sc.placement,
          placementPoints: sc.placementPoints,
          kills: sc.kills,
        };
      });

      const res = await fetch("/api/poc/submit-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame,
          pocCode: pocCode,
          matchNumber: matchNumber,
          proofUrl: proofUrl,
          notes: notes,
          teamResults,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      setSubmitSuccess(true);
      setSuccessMessage(
        data.pending
          ? `Match ${matchNumber} results & proof submitted! Your submission is now in the review queue and will be published live to the public dashboard once approved by the Super Admin.`
          : `Match ${matchNumber} results verified & published live to the public dashboard!`
      );
    } catch (err: any) {
      setSubmitError(err.message || "Error submitting match results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextMatch = () => {
    setMatchNumber((prev) => prev + 1);
    setProofUrl("");
    setNotes("");
    setSubmitSuccess(false);
    setSubmitError("");
  };

  // Top 3 preview squads
  const top1Team = teams.find((t) => t.id === orderedTeamIds[0]);
  const top2Team = teams.find((t) => t.id === orderedTeamIds[1]);
  const top3Team = teams.find((t) => t.id === orderedTeamIds[2]);

  // Filtered list for display
  const filteredTeamIds = orderedTeamIds.filter((tId) => {
    if (!searchFilter.trim()) return true;
    const team = teams.find((t) => t.id === tId);
    return team?.teamName.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black border border-slate-700 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
              <img
                src="/images/clutch-logo.jpg"
                alt="CLUTCH"
                className="w-full h-full object-contain"
              />
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public Broadcast Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official POC Verification Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!isUnlocked ? (
          /* ==================================================== */
          /* STEP 1: AUTHENTICATION LOCKSCREEN                    */
          /* ==================================================== */
          <div className="max-w-md mx-auto pt-6 sm:pt-12">
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/5">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white font-display">
                POC Arena Login
              </h1>
              <p className="text-xs text-slate-400">
                Select your assigned game tournament and enter your official room verification code.
              </p>
            </div>

            <form
              onSubmit={handleVerify}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              {/* Game Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Game
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "FREE_FIRE", label: "Free Fire", icon: Flame, color: "text-amber-500" },
                    { id: "BGMI", label: "BGMI", icon: Crosshair, color: "text-blue-500" },
                    { id: "VALORANT", label: "Valorant", icon: Target, color: "text-rose-500" },
                    { id: "EFOOTBALL", label: "eFootball", icon: Gamepad2, color: "text-emerald-500" },
                    { id: "MATIKS", label: "MATIKS", icon: Brain, color: "text-purple-500" },
                  ].map((g) => {
                    const Icon = g.icon;
                    const isSelected = selectedGame === g.id;
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => setSelectedGame(g.id as GameId)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10 text-white shadow-xs"
                            : "border-slate-800 bg-slate-950 hover:bg-slate-800/50 text-slate-400"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${g.color}`} />
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* POC Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Assigned Verification Code
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pocCode}
                    onChange={(e) => setPocCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CLT-FF-2026X"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm uppercase tracking-wider text-white focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || !pocCode}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Room Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Scoring Table</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ==================================================== */
          /* STEP 2: FAST DRAG-AND-DROP SCORING & PROOF UPLOAD    */
          /* ==================================================== */
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Arena Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedGame.replace("_", " ")} Live Arena</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      AUTHENTICATED POC
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Room Code: <strong className="font-mono text-slate-300">{pocCode}</strong> •{" "}
                    {teams.length} Official Registered Contenders
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                >
                  Switch Game / Code
                </button>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Tip for Fast Scoring:</strong> Drag the grip icon{" "}
                  <strong className="font-mono bg-blue-900/60 px-1 py-0.5 rounded">⠿</strong> to
                  instantly order squads 1st to {teams.length}th. Use{" "}
                  <strong className="font-mono bg-blue-900/60 px-1 py-0.5 rounded">+</strong> /{" "}
                  <strong className="font-mono bg-blue-900/60 px-1 py-0.5 rounded">-</strong> buttons
                  for kills!
                </span>
              </div>
              <div className="text-[11px] font-mono text-blue-400/80">
                Paste Screenshot: <kbd className="px-1.5 py-0.5 bg-blue-950 rounded border border-blue-700">Ctrl + V</kbd>
              </div>
            </div>

            {/* Submission Success Banner */}
            {submitSuccess ? (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Results Submitted Successfully!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleNextMatch}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Match #{matchNumber + 1} Results</span>
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                  >
                    View Public Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Drag & Drop Table */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                  {/* Top 3 Live Visualizer Bar */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Live Podium Preview (Match #{matchNumber})</span>
                      </span>
                      <span className="text-slate-500">Auto-updates as you drag</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* 1st Place */}
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="text-[10px] font-black text-amber-400">🥇 1ST PLACE</div>
                        <div className="font-bold text-white truncate text-xs mt-0.5">
                          {top1Team?.teamName || "—"}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-amber-300 mt-0.5">
                          +{scores[orderedTeamIds[0]]?.matchTotal || 0} pts
                        </div>
                      </div>

                      {/* 2nd Place */}
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                        <div className="text-[10px] font-black text-slate-300">🥈 2ND PLACE</div>
                        <div className="font-bold text-white truncate text-xs mt-0.5">
                          {top2Team?.teamName || "—"}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-300 mt-0.5">
                          +{scores[orderedTeamIds[1]]?.matchTotal || 0} pts
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="p-2 rounded-lg bg-amber-900/20 border border-amber-700/40">
                        <div className="text-[10px] font-black text-amber-500">🥉 3RD PLACE</div>
                        <div className="font-bold text-white truncate text-xs mt-0.5">
                          {top3Team?.teamName || "—"}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-amber-400 mt-0.5">
                          +{scores[orderedTeamIds[2]]?.matchTotal || 0} pts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar & Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter by team name..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                      {searchFilter && (
                        <button
                          onClick={() => setSearchFilter("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetOrder}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold"
                        title="Recalculate 1 to N placement points"
                      >
                        Recalculate Points
                      </button>
                    </div>
                  </div>

                  {/* Drag-and-Drop Contenders List */}
                  <div className="space-y-2">
                    {filteredTeamIds.map((teamId) => {
                      const actualIndex = orderedTeamIds.indexOf(teamId);
                      const t = teams.find((item) => item.id === teamId);
                      if (!t) return null;

                      const sc = scores[teamId] || {
                        placement: actualIndex + 1,
                        kills: 0,
                        placementPoints: 0,
                        matchTotal: 0,
                      };
                      const rank = actualIndex + 1;
                      const isFirst = rank === 1;
                      const isSecond = rank === 2;
                      const isThird = rank === 3;
                      const isDragging = draggedIndex === actualIndex;
                      const isDragOver = dragOverIndex === actualIndex;

                      return (
                        <div
                          key={teamId}
                          draggable
                          onDragStart={(e) => {
                            setDraggedIndex(actualIndex);
                            e.dataTransfer.setData("text/plain", String(actualIndex));
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverIndex !== actualIndex) {
                              setDragOverIndex(actualIndex);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverIndex === actualIndex) {
                              setDragOverIndex(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedIndex !== null && draggedIndex !== actualIndex) {
                              reorderTeams(draggedIndex, actualIndex);
                            }
                            setDraggedIndex(null);
                            setDragOverIndex(null);
                          }}
                          onDragEnd={() => {
                            setDraggedIndex(null);
                            setDragOverIndex(null);
                          }}
                          className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition-all select-none ${
                            isDragging
                              ? "opacity-40 border-blue-500 scale-[0.98] bg-blue-950/20"
                              : isDragOver
                              ? "border-blue-400 bg-blue-500/10 shadow-md"
                              : isFirst
                              ? "bg-amber-500/10 border-amber-500/40 hover:border-amber-400"
                              : isSecond
                              ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                              : isThird
                              ? "bg-amber-900/10 border-amber-800/40 hover:border-amber-700"
                              : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          {/* Left: Drag Handle, Rank Badge, Team Name */}
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            {/* Grip Drag Handle */}
                            <div
                              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-slate-300 transition"
                              title="Drag up or down to reorder"
                            >
                              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            {/* Rank Badge */}
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black border shrink-0 ${
                                isFirst
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs"
                                  : isSecond
                                  ? "bg-slate-300/20 text-slate-200 border-slate-400/40"
                                  : isThird
                                  ? "bg-amber-700/20 text-amber-400 border-amber-700/40"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {isFirst ? "🥇" : isSecond ? "🥈" : isThird ? "🥉" : `#${rank}`}
                            </span>

                            {/* Team Name & Overall stats */}
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-white text-xs sm:text-sm truncate">
                                {t.teamName}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span>Seed #{actualIndex + 1}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-500">
                                  Overall: {t.totalPoints} pts
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Center: Mobile Move Nudges (Top / Up / Down) */}
                          <div className="flex items-center gap-1 shrink-0">
                            {!isFirst && (
                              <button
                                type="button"
                                onClick={() => pinToFirst(teamId)}
                                className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-[10px] font-bold border border-slate-700 hidden sm:inline-flex items-center gap-1"
                                title="Move this squad directly to 1st place"
                              >
                                <Crown className="w-3 h-3" />
                                <span>#1</span>
                              </button>
                            )}

                            <div className="flex flex-col gap-0.5 sm:hidden">
                              <button
                                type="button"
                                onClick={() => moveOneSlot(teamId, "UP")}
                                disabled={actualIndex === 0}
                                className="p-1 rounded bg-slate-800 disabled:opacity-20 text-[9px] text-slate-300"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                onClick={() => moveOneSlot(teamId, "DOWN")}
                                disabled={actualIndex === orderedTeamIds.length - 1}
                                className="p-1 rounded bg-slate-800 disabled:opacity-20 text-[9px] text-slate-300"
                              >
                                ▼
                              </button>
                            </div>
                          </div>

                          {/* Right: Kills Stepper & Match Total */}
                          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            {selectedGame !== "VALORANT" && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 hidden sm:inline mr-1 font-semibold">
                                  {selectedGame === "EFOOTBALL"
                                    ? "Goals:"
                                    : selectedGame === "MATIKS"
                                    ? "Bonus:"
                                    : "Kills:"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleKillsChange(teamId, (sc.kills || 0) - 1)}
                                  disabled={(sc.kills || 0) <= 0}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center transition border border-slate-700 select-none"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={sc.kills || 0}
                                  onChange={(e) =>
                                    handleKillsChange(teamId, parseInt(e.target.value) || 0)
                                  }
                                  className="w-10 sm:w-12 h-7 sm:h-8 rounded-lg bg-slate-950 border border-slate-700 text-white text-center font-bold text-xs focus:border-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleKillsChange(teamId, (sc.kills || 0) + 1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center transition border border-slate-700 select-none"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* Match Points Earned Pill */}
                            <div className="text-right w-14 sm:w-16">
                              <div className="font-extrabold text-blue-400 font-mono text-xs sm:text-sm">
                                +{sc.matchTotal}
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono">
                                {selectedGame === "VALORANT"
                                  ? `${sc.placementPoints}p`
                                  : `${sc.placementPoints}p+${sc.kills}k`}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredTeamIds.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-500">
                        No squads found matching &quot;{searchFilter}&quot;.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Match Number & Fast Screenshot Upload */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                    Match Verification & Proof
                  </h3>

                  {/* Match Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Match / Round Number
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatchNumber((prev) => Math.max(1, prev - 1))}
                        className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center border border-slate-700"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={matchNumber}
                        onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setMatchNumber((prev) => prev + 1)}
                        className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center border border-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Mandatory Screenshot / Photo Proof Area */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300">
                        Match Screenshot / Scoreboard <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Auto-compressed</span>
                    </div>

                    {pasteNotice && (
                      <div className="p-2 mb-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Screenshot pasted from clipboard!</span>
                      </div>
                    )}

                    {/* Hidden Native File Pickers */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processImageFile(file);
                      }}
                      className="hidden"
                    />

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processImageFile(file);
                      }}
                      className="hidden"
                    />

                    {/* Screenshot Dropzone */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          processImageFile(file);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
                        proofUrl
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-slate-700 hover:border-slate-500 bg-slate-950/60"
                      }`}
                    >
                      {isUploading ? (
                        <div className="py-4 flex flex-col items-center gap-2 text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                          <span className="text-xs font-semibold">Compressing image...</span>
                        </div>
                      ) : proofUrl ? (
                        <div className="py-2 flex flex-col items-center gap-2 w-full">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Proof Attached Successfully</span>
                          </div>
                          {proofUrl.startsWith("data:") && (
                            <img
                              src={proofUrl}
                              alt="Proof Preview"
                              className="max-h-32 w-auto rounded-lg border border-slate-700 object-contain mt-1"
                            />
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[11px] text-slate-400 hover:text-white underline font-semibold"
                            >
                              Replace Image
                            </button>
                            <span className="text-slate-600">•</span>
                            <button
                              type="button"
                              onClick={() => setProofUrl("")}
                              className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 flex flex-col items-center gap-2.5 w-full">
                          <UploadCloud className="w-8 h-8 text-slate-400" />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-200 block">
                              Drag & Drop Screenshot Here
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              or press <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-slate-300">Ctrl + V</kbd> to paste
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
                            {/* Snap Photo Camera Button */}
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Take Photo</span>
                            </button>

                            {/* File Upload Button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                            >
                              <span>Browse Files</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {uploadError && (
                      <p className="text-xs text-red-400 mt-1">{uploadError}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Clean finish, 4 kills final circle"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white resize-none outline-none focus:border-blue-500"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitMatch}
                    disabled={isSubmitting || !proofUrl}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Match Results...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Match #{matchNumber} for Approval</span>
                      </>
                    )}
                  </button>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Results will be verified by the Super Admin before appearing live on the public dashboard.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
