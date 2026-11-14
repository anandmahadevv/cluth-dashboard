"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Flame,
  Crosshair,
  Gamepad2,
  Brain,
  Loader2,
  FileImage,
  ArrowLeft,
  RotateCcw,
  Clock,
  Sparkles,
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setAuthError(data.error || "Invalid verification code. Please check with Tournament Admin.");
        setIsVerifying(false);
        return;
      }

      setTeams(data.teams);

      // Initialize empty score inputs for each team
      const initialScores: Record<string, TeamScoreInput> = {};
      data.teams.forEach((t: TeamEntry, idx: number) => {
        const matrix = PLACEMENT_POINTS[selectedGame];
        const defaultPlace = idx + 1;
        const defaultPlacePts = matrix && defaultPlace <= matrix.length ? matrix[defaultPlace - 1] : 0;
        initialScores[t.id] = {
          teamId: t.id,
          placement: defaultPlace,
          kills: 0,
          placementPoints: defaultPlacePts,
          matchTotal: defaultPlacePts,
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

  // Helper to calculate placement and match points for any game
  const calcMatchPoints = (placement: number, kills: number, gameId: GameId) => {
    const matrix = PLACEMENT_POINTS[gameId];
    const placePts = matrix && placement >= 1 && placement <= matrix.length ? matrix[placement - 1] : 0;
    return {
      placementPoints: placePts,
      matchTotal: placePts + (kills || 0),
    };
  };

  // Update Score for a Team (Smart rank assignment with auto-swapping to keep ranks unique and ordered)
  const handleScoreChange = (teamId: string, field: "placement" | "kills", value: number) => {
    setScores((prev) => {
      const updated = { ...prev };
      const current = updated[teamId] || { teamId, placement: 1, kills: 0, placementPoints: 0, matchTotal: 0 };

      if (field === "kills") {
        const kills = Math.max(0, value);
        const pts = calcMatchPoints(current.placement, kills, selectedGame);
        updated[teamId] = {
          ...current,
          kills,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        };
        return updated;
      }

      // field === "placement"
      const newPlacement = Math.max(1, Math.min(teams.length, value));
      const oldPlacement = current.placement;

      if (newPlacement === oldPlacement) return prev;

      // Find if another team already holds newPlacement
      const conflictTeam = Object.values(updated).find(
        (s) => s.teamId !== teamId && s.placement === newPlacement
      );

      if (conflictTeam) {
        // Swap placements between the two teams so there are never duplicate ranks!
        const swappedPts = calcMatchPoints(oldPlacement, conflictTeam.kills, selectedGame);
        updated[conflictTeam.teamId] = {
          ...conflictTeam,
          placement: oldPlacement,
          placementPoints: swappedPts.placementPoints,
          matchTotal: swappedPts.matchTotal,
        };
      }

      const myPts = calcMatchPoints(newPlacement, current.kills, selectedGame);
      updated[teamId] = {
        ...current,
        placement: newPlacement,
        placementPoints: myPts.placementPoints,
        matchTotal: myPts.matchTotal,
      };

      return updated;
    });
  };

  // Quick Move Up / Down
  const handleMoveRank = (teamId: string, direction: "UP" | "DOWN") => {
    const currentPlace = scores[teamId]?.placement || 1;
    const targetPlace = direction === "UP" ? currentPlace - 1 : currentPlace + 1;
    if (targetPlace < 1 || targetPlace > teams.length) return;
    handleScoreChange(teamId, "placement", targetPlace);
  };

  // Auto-fill placements 1 to N
  const handleAutoFill = () => {
    setScores((prev) => {
      const updated = { ...prev };
      teams.forEach((t, idx) => {
        const place = idx + 1;
        const currentKills = updated[t.id]?.kills || 0;
        const pts = calcMatchPoints(place, currentKills, selectedGame);
        updated[t.id] = {
          teamId: t.id,
          placement: place,
          kills: currentKills,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        };
      });
      return updated;
    });
  };

  // In-Browser Canvas Image Compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Submit Match Results
  const handleSubmitMatch = async () => {
    if (!proofUrl) {
      setSubmitError("Mandatory Proof Required: Please upload a match screenshot before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const teamResults = Object.values(scores).map((s) => ({
        teamId: s.teamId,
        placement: s.placement,
        placementPoints: s.placementPoints,
        kills: s.kills,
      }));

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Broadcast Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Referee & POC Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {!isUnlocked ? (
          /* ==================================================== */
          /* STEP 1: ARENA SELECTION & ROOM CODE VERIFICATION    */
          /* ==================================================== */
          <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-1">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                Referee Point Entry Portal
              </h1>
              <p className="text-xs text-slate-400">
                Select your assigned game arena and enter the confidential room code.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              {/* Game Arena Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Select Game Arena
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "FREE_FIRE" as GameId, label: "Free Fire", icon: Flame, color: "text-orange-400" },
                    { id: "BGMI" as GameId, label: "BGMI", icon: Crosshair, color: "text-amber-400" },
                    { id: "FIFA" as GameId, label: "FIFA 24", icon: Gamepad2, color: "text-emerald-400" },
                    { id: "MATIKS" as GameId, label: "MATIKS", icon: Brain, color: "text-purple-400" },
                  ].map((g) => {
                    const Icon = g.icon;
                    const isSelected = selectedGame === g.id;
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => setSelectedGame(g.id)}
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
                    placeholder="Enter assigned room code"
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
          /* STEP 2: SCORING TABLE & EVIDENCE SCREENSHOT UPLOAD   */
          /* ==================================================== */
          <div className="space-y-6">
            {/* Arena Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedGame.replace("_", " ")} Arena</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      VERIFIED POC
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Room Code: <strong className="font-mono text-slate-300">{pocCode}</strong> • {teams.length} pre-registered squads
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                >
                  Change Code
                </button>
              </div>
            </div>

            {/* Submission Success Banner */}
            {submitSuccess ? (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Results Submitted Successfully!</h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
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
                {/* Left 2 Cols: Scores Table */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Participating Squads Scoring
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Assign match rank and kills. Points are auto-calculated using official rulebooks.
                      </p>
                    </div>

                    {(selectedGame === "FREE_FIRE" || selectedGame === "BGMI") && (
                      <button
                        onClick={handleAutoFill}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
                      >
                        Auto-Fill Placements (1 to {teams.length})
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                          <th className="py-2.5 px-3">Team (Rank Ordered)</th>
                          <th className="py-2.5 px-2 text-center w-28">Match Rank</th>
                          <th className="py-2.5 px-2 text-center w-24">
                            {selectedGame === "FIFA" ? "Goals" : selectedGame === "MATIKS" ? "Bonus Pts" : "Kills"}
                          </th>
                          <th className="py-2.5 px-3 text-right">Match Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {[...teams]
                          .sort((a, b) => (scores[a.id]?.placement || 999) - (scores[b.id]?.placement || 999))
                          .map((t) => {
                            const sc = scores[t.id] || { placement: 1, kills: 0, placementPoints: 0, matchTotal: 0 };
                            const place = sc.placement || 1;
                            const isFirst = place === 1;
                            const isSecond = place === 2;
                            const isThird = place === 3;

                            return (
                              <tr
                                key={t.id}
                                className={`transition ${
                                  isFirst
                                    ? "bg-amber-500/10 hover:bg-amber-500/15"
                                    : isSecond
                                    ? "bg-slate-800/40 hover:bg-slate-800/60"
                                    : isThird
                                    ? "bg-amber-900/10 hover:bg-amber-900/20"
                                    : "hover:bg-slate-800/30"
                                }`}
                              >
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border ${
                                        isFirst
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20"
                                          : isSecond
                                          ? "bg-slate-300/20 text-slate-200 border-slate-400/40"
                                          : isThird
                                          ? "bg-amber-700/20 text-amber-400 border-amber-700/40"
                                          : "bg-slate-800 text-slate-400 border-slate-700"
                                      }`}
                                    >
                                      {isFirst ? "🥇" : isSecond ? "🥈" : isThird ? "🥉" : `#${place}`}
                                    </span>
                                    <div>
                                      <div className="font-bold text-white text-xs">{t.teamName}</div>
                                      <div className="text-[10px] text-slate-500">
                                        Overall: {t.totalPoints} pts • {t.matchesPlayed} matches
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-2.5 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {/* Quick nudge up */}
                                    <button
                                      type="button"
                                      onClick={() => handleMoveRank(t.id, "UP")}
                                      disabled={place <= 1}
                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-[10px]"
                                      title="Move Rank Up"
                                    >
                                      ▲
                                    </button>

                                    {/* Rank Selector */}
                                    <select
                                      value={place}
                                      onChange={(e) =>
                                        handleScoreChange(t.id, "placement", parseInt(e.target.value) || 1)
                                      }
                                      className={`px-2 py-1 rounded-lg border font-bold text-xs text-center outline-none ${
                                        isFirst
                                          ? "bg-amber-950/80 border-amber-500 text-amber-300"
                                          : "bg-slate-950 border-slate-700 text-white"
                                      }`}
                                    >
                                      {teams.map((_, idx) => (
                                        <option key={idx + 1} value={idx + 1}>
                                          Rank #{idx + 1}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Quick nudge down */}
                                    <button
                                      type="button"
                                      onClick={() => handleMoveRank(t.id, "DOWN")}
                                      disabled={place >= teams.length}
                                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-[10px]"
                                      title="Move Rank Down"
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </td>

                                <td className="py-2.5 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={sc.kills || 0}
                                    onChange={(e) =>
                                      handleScoreChange(t.id, "kills", parseInt(e.target.value) || 0)
                                    }
                                    className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-center font-bold text-xs"
                                  />
                                </td>

                                <td className="py-2.5 px-3 text-right">
                                  <div className="font-extrabold text-blue-400 font-mono text-xs">
                                    +{sc.matchTotal}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    ({sc.placementPoints}p + {sc.kills}k)
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Col: Match Configuration & Mandatory Proof Screenshot */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                    Match Verification Details
                  </h3>

                  {/* Match Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Match Number / Round
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={matchNumber}
                      onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                    />
                  </div>

                  {/* Mandatory Proof Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Result Screenshot / Proof <span className="text-red-400">*</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2">
                      Attach photo of the in-game post-match leaderboard.
                    </p>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                        proofUrl
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-slate-700 hover:border-slate-500 bg-slate-950/60"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {isUploading ? (
                        <div className="py-3 flex flex-col items-center gap-1.5 text-slate-400">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                          <span className="text-[11px]">Compressing image...</span>
                        </div>
                      ) : proofUrl ? (
                        <div className="py-1 flex flex-col items-center gap-1.5">
                          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">Proof Screenshot Attached</span>
                          {proofUrl.startsWith("data:") && (
                            <img
                              src={proofUrl}
                              alt="Proof Preview"
                              className="max-h-24 rounded border border-slate-700 object-cover mt-1"
                            />
                          )}
                          <span className="text-[10px] text-slate-400 underline">Click to change</span>
                        </div>
                      ) : (
                        <div className="py-3 flex flex-col items-center gap-1.5">
                          <UploadCloud className="w-7 h-7 text-slate-400" />
                          <span className="text-xs font-bold text-slate-300">Click to upload screenshot</span>
                          <span className="text-[10px] text-slate-500">PNG, JPG, WebP</span>
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
                      placeholder="e.g. Clean match, zone finish"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitMatch}
                    disabled={isSubmitting || !proofUrl}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Match Results...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Match {matchNumber} for Approval</span>
                      </>
                    )}
                  </button>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Submissions are verified by the Super Admin before appearing on the public broadcast.</span>
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

