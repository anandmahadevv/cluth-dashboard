"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Flame,
  Crosshair,
  Gamepad2,
  Brain,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Trophy,
  History,
  FileImage,
  Award,
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

interface MatchRecord {
  id: string;
  gameId: GameId;
  matchNumber: number | string;
  timestamp: string;
  proofUrl: string;
  notes?: string;
  teamResults: {
    teamId: string;
    teamName: string;
    placement: number;
    placementPoints: number;
    kills: number;
    matchPoints: number;
  }[];
}

const SUPER_CODE = "43517";

export default function SuperAdminPortalPage() {
  const [selectedGame, setSelectedGame] = useState<GameId>("FREE_FIRE");
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Match Scoring State
  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [scores, setScores] = useState<Record<string, TeamScoreInput>>({});
  const [proofUrl, setProofUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [notes, setNotes] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // History State
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"scoring" | "history">("scoring");

  // Reset State
  const [isResetting, setIsResetting] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Teams & Match History when selectedGame changes
  useEffect(() => {
    fetchGameData(selectedGame);
  }, [selectedGame]);

  const fetchGameData = async (gameId: GameId) => {
    setIsLoadingTeams(true);
    setLoadError("");
    setSubmitSuccess(false);

    try {
      // 1. Verify / Fetch teams via verify-code using Super Admin code 43517
      const res = await fetch("/api/poc/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: SUPER_CODE, gameId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load teams");
      }

      setTeams(data.teams);

      // Initialize score inputs
      const initialScores: Record<string, TeamScoreInput> = {};
      data.teams.forEach((t: TeamEntry, idx: number) => {
        const matrix = PLACEMENT_POINTS[gameId as "FREE_FIRE" | "BGMI"];
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

      // 2. Fetch match history
      const matchRes = await fetch(`/api/public/matches?game=${gameId}`);
      if (matchRes.ok) {
        const matchData = await matchRes.json();
        const gameMatches = (matchData.matches || []).filter((m: any) => m.gameId === gameId);
        setMatches(gameMatches);
        if (gameMatches.length > 0) {
          setMatchNumber(gameMatches.length + 1);
        } else {
          setMatchNumber(1);
        }
      }
    } catch (err: any) {
      setLoadError(err.message || "Could not fetch tournament data.");
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleScoreChange = (teamId: string, field: "placement" | "kills", value: number) => {
    setScores((prev) => {
      const current = prev[teamId] || { teamId, placement: 1, kills: 0, placementPoints: 0, matchTotal: 0 };
      const updated = { ...current, [field]: value };

      if (selectedGame === "FREE_FIRE" || selectedGame === "BGMI") {
        const matrix = PLACEMENT_POINTS[selectedGame];
        const placePts = updated.placement >= 1 && updated.placement <= matrix.length ? matrix[updated.placement - 1] : 0;
        updated.placementPoints = placePts;
        updated.matchTotal = placePts + (updated.kills || 0);
      } else {
        updated.matchTotal = updated.kills || 0;
      }

      return { ...prev, [teamId]: updated };
    });
  };

  const handleAutoFillPlacements = () => {
    setScores((prev) => {
      const updated = { ...prev };
      teams.forEach((t, idx) => {
        const place = idx + 1;
        const matrix = PLACEMENT_POINTS[selectedGame as "FREE_FIRE" | "BGMI"];
        const placePts = matrix && place <= matrix.length ? matrix[place - 1] : 0;
        const currentKills = updated[t.id]?.kills || 0;
        updated[t.id] = {
          teamId: t.id,
          placement: place,
          kills: currentKills,
          placementPoints: placePts,
          matchTotal: placePts + currentKills,
        };
      });
      return updated;
    });
  };

  // Client-Side Canvas Image Compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      if (file.size > 15 * 1024 * 1024) {
        throw new Error("File is too large (>15MB). Please upload a smaller screenshot.");
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
      setUploadError(err.message || "Image upload failed.");
      setIsUploading(false);
    }
  };

  // Submit Match Results
  const handleSubmitMatch = async () => {
    if (!proofUrl) {
      setSubmitError("Mandatory Proof Required: Please upload a match result screenshot or enter a proof URL.");
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
          pocCode: SUPER_CODE,
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
      setProofUrl("");
      setNotes("");

      // Refresh data
      await fetchGameData(selectedGame);
    } catch (err: any) {
      setSubmitError(err.message || "Error submitting match results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Scores (Super Admin Only)
  const handleResetScores = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/poc/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: SUPER_CODE, gameId: selectedGame }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Reset failed");
      }
      setResetModalOpen(false);
      await fetchGameData(selectedGame);
    } catch (err: any) {
      alert("Reset error: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SLUG: /43517 • SUPER ADMIN UNLOCKED</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchGameData(selectedGame)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setResetModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title & Game Selection Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <ShieldCheck className="w-6 h-6" />
              </span>
              CLUTCH Referee & Super Admin Scoring Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authoritative Point Scoring • Proof Verification • Live Broadcast Synchronization
            </p>
          </div>

          {/* Game Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {[
              { id: "FREE_FIRE" as GameId, label: "Free Fire", icon: Flame, color: "text-orange-400" },
              { id: "BGMI" as GameId, label: "BGMI", icon: Crosshair, color: "text-amber-400" },
              { id: "FIFA" as GameId, label: "FIFA 24", icon: Gamepad2, color: "text-emerald-400" },
              { id: "MATIKS" as GameId, label: "MATIKS", icon: Brain, color: "text-purple-400" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedGame === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGame(tab.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Switcher: Scoring Entry vs. Match History */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("scoring")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "scoring"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Score Current Match</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Matches & Proofs ({matches.length})</span>
          </button>
        </div>

        {/* Feedback Alert Messages */}
        {submitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                <strong>Match results verified & committed!</strong> The public dashboard and leaderboards have been updated.
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold underline flex items-center gap-1 hover:text-emerald-300 ml-4 shrink-0"
            >
              <span>View Live Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {loadError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* TAB 1: Scoring Entry View */}
        {activeTab === "scoring" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Team Scores Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>Participating Teams Roster</span>
                      <span className="text-[11px] font-normal text-slate-400">({teams.length} teams pre-loaded)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Assign placement and kills. Points are auto-calculated using official rulebooks.
                    </p>
                  </div>

                  {(selectedGame === "FREE_FIRE" || selectedGame === "BGMI") && (
                    <button
                      onClick={handleAutoFillPlacements}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                    >
                      Auto-Fill Placements (1 to {teams.length})
                    </button>
                  )}
                </div>

                {isLoadingTeams ? (
                  <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-xs">Loading {selectedGame} teams...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                          <th className="py-2.5 px-3">Team / Player</th>
                          <th className="py-2.5 px-2 text-center">Standings</th>
                          <th className="py-2.5 px-2 text-center w-24">
                            {selectedGame === "FREE_FIRE" || selectedGame === "BGMI" ? "Placement" : "Rank"}
                          </th>
                          <th className="py-2.5 px-2 text-center w-24">
                            {selectedGame === "FREE_FIRE" || selectedGame === "BGMI" ? "Kills" : "Score/Goals"}
                          </th>
                          <th className="py-2.5 px-3 text-right">Match Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {teams.map((t) => {
                          const sc = scores[t.id] || { placement: 1, kills: 0, placementPoints: 0, matchTotal: 0 };
                          return (
                            <tr key={t.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-3 px-3">
                                <div className="font-bold text-white text-sm">{t.teamName}</div>
                                <div className="text-[11px] text-slate-400">
                                  Current: {t.totalPoints} pts • {t.matchesPlayed} matches
                                </div>
                              </td>

                              <td className="py-3 px-2 text-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">
                                  #{t.rank}
                                </span>
                              </td>

                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  max={teams.length}
                                  value={sc.placement || 1}
                                  onChange={(e) =>
                                    handleScoreChange(t.id, "placement", parseInt(e.target.value) || 1)
                                  }
                                  className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-center font-bold text-sm focus:border-blue-500 outline-none"
                                />
                              </td>

                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={sc.kills || 0}
                                  onChange={(e) =>
                                    handleScoreChange(t.id, "kills", parseInt(e.target.value) || 0)
                                  }
                                  className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-center font-bold text-sm focus:border-blue-500 outline-none"
                                />
                              </td>

                              <td className="py-3 px-3 text-right">
                                <span className="font-extrabold text-blue-400 text-sm font-mono">
                                  +{sc.matchTotal}
                                </span>
                                {(selectedGame === "FREE_FIRE" || selectedGame === "BGMI") && (
                                  <div className="text-[10px] text-slate-500">
                                    ({sc.placementPoints} place + {sc.kills} kills)
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Match Configuration & Proof Upload */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-400" />
                  <span>Match Verification Details</span>
                </h2>

                {/* Match Number Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Match Number / Round
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Proof Screenshot Upload (Mandatory) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Proof Screenshot / Result Sheet <span className="text-red-400">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2.5">
                    Official rules require photographic proof for each match point update.
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
                      <div className="flex flex-col items-center gap-2 text-slate-400 py-3">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="text-xs font-semibold">Compressing & optimizing image...</span>
                      </div>
                    ) : proofUrl ? (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Proof Image Attached!</span>
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
                      <div className="flex flex-col items-center gap-1.5 py-3">
                        <UploadCloud className="w-8 h-8 text-slate-400" />
                        <span className="text-xs font-bold text-slate-200">Click to upload screenshot</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WebP supported</span>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-red-400 mt-1.5">{uploadError}</p>
                  )}

                  {/* Fallback URL Input */}
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Or Paste Image / Drive URL:
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={proofUrl.startsWith("data:") ? "" : proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Match Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Map: Bermuda • Fast zone • Clean match"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Commit Button */}
                <button
                  onClick={handleSubmitMatch}
                  disabled={isSubmitting || isLoadingTeams}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Commit Match {matchNumber} Results</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Match History View */}
        {activeTab === "history" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <span>Verified Match History — {selectedGame}</span>
            </h2>

            {matches.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileImage className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs">No match results committed for {selectedGame} yet.</p>
                <button
                  onClick={() => setActiveTab("scoring")}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Score Match 1 Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-800 bg-slate-950/60 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 font-bold text-xs">
                          Match #{m.matchNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(m.timestamp).toLocaleTimeString()} • {new Date(m.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      {m.proofUrl && (
                        <a
                          href={m.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                        >
                          <FileImage className="w-3.5 h-3.5" />
                          <span>View Proof Screenshot</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {m.notes && (
                      <p className="text-xs text-slate-400 italic">Notes: {m.notes}</p>
                    )}

                    {/* Team results snippet */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                      {m.teamResults.slice(0, 6).map((r) => (
                        <div
                          key={r.teamId}
                          className="bg-slate-900 border border-slate-800/80 rounded-lg p-2 text-[11px]"
                        >
                          <div className="font-bold text-white truncate">{r.teamName}</div>
                          <div className="text-slate-400 flex items-center justify-between mt-0.5">
                            <span>Rank #{r.placement}</span>
                            <span className="font-bold text-blue-400">+{r.matchPoints} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Resetting Game Data */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <RotateCcw className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Reset {selectedGame} Scores?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset all team points, kills, and match counts back to <strong>0</strong> for <strong>{selectedGame}</strong>, and clear its match logs.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetScores}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5"
              >
                {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
