"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Flame,
  Crosshair,
  Gamepad2,
  Brain,
  Loader2,
  FileImage,
  ExternalLink,
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

interface PocScoringModalProps {
  initialGame?: GameId;
  onSuccess?: () => void;
}

export function PocScoringModal({ initialGame = "FREE_FIRE", onSuccess }: PocScoringModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId>(initialGame);
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
        setAuthError(data.error || "Invalid code. Please recheck with Super Admin.");
        setIsVerifying(false);
        return;
      }

      setTeams(data.teams);

      // Initialize empty score inputs for each team
      const initialScores: Record<string, TeamScoreInput> = {};
      data.teams.forEach((t: TeamEntry, idx: number) => {
        const matrix = PLACEMENT_POINTS[selectedGame as "FREE_FIRE" | "BGMI"];
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

  // Update Score for a Team
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
        // FIFA or MATIKS
        updated.matchTotal = updated.kills || 0;
      }

      return { ...prev, [teamId]: updated };
    });
  };

  // Client-Side Image Upload & Compression (Zero-server, 100% Vercel & mobile compatible)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File is too large. Please select an image under 10MB.");
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;

        // Auto-compress image in-browser using Canvas
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
      setSubmitError("Please upload an evidence screenshot or enter a proof URL before submitting.");
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
          ? "Match results & proof submitted! Queued for Super Admin approval before publishing."
          : "Match results verified & broadcast directly to leaderboard!"
      );
      if (onSuccess) onSuccess();

      // Auto close after 2.5 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSubmitSuccess(false);
        setIsUnlocked(false);
        setPocCode("");
        setProofUrl("");
        window.location.reload();
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.message || "Error submitting match results.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button in Header/Toolbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-sm transition active:scale-95"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Referee / POC Portal</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">CLUTCH Referee Scoring Portal</h3>
                  <p className="text-[11px] text-slate-400">Pre-seeded Roster • Live Verified Point Entry</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {!isUnlocked ? (
                /* Step 1: Code Authentication */
                <form onSubmit={handleVerify} className="space-y-5">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800 mb-1">Confidential POC Access:</p>
                    Select your championship game arena and enter the confidential room code provided for your match.
                  </div>

                  {/* Game Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Game Arena
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "FREE_FIRE", label: "Free Fire", icon: Flame, color: "text-amber-500" },
                        { id: "BGMI", label: "BGMI", icon: Crosshair, color: "text-blue-500" },
                        { id: "FIFA", label: "FIFA", icon: Gamepad2, color: "text-emerald-500" },
                        { id: "MATIKS", label: "MATIKS", icon: Brain, color: "text-purple-500" },
                      ].map((g) => {
                        const Icon = g.icon;
                        const isSelected = selectedGame === g.id;
                        return (
                          <button
                            type="button"
                            key={g.id}
                            onClick={() => setSelectedGame(g.id as GameId)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-white" : g.color}`} />
                            <span>{g.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* POC Code Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Assigned Game Verification Code</span>
                      <span className="text-[11px] text-slate-400 lowercase font-normal">(e.g. CLT-FF-2026X)</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={pocCode}
                        onChange={(e) => setPocCode(e.target.value.toUpperCase())}
                        placeholder="CLT-XX-2026X"
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase tracking-wider focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || !pocCode}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Unlock Scoring Table</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <Link
                      href="/43517"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Super Admin Controller Portal (/43517)</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </form>
              ) : (
                /* Step 2: Scoring Table & Proof Upload */
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          {selectedGame === "FREE_FIRE"
                            ? "Free Fire (Squads)"
                            : selectedGame === "BGMI"
                            ? "BGMI (BGIS Matrix)"
                            : selectedGame}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Verified POC
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 pt-0.5">
                        {teams.length} pre-registered teams initialized. Assign match points below.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-xs font-bold text-slate-700">Match #</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={matchNumber}
                        onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
                        className="w-16 px-2.5 py-1 text-center rounded-lg border border-slate-300 font-bold text-sm"
                      />
                    </div>
                  </div>

                  {/* Pre-seeded Team Points Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Team Name</th>
                            <th className="py-2.5 px-2 text-center">Prev Pts</th>
                            <th className="py-2.5 px-2 text-center w-20">Rank</th>
                            <th className="py-2.5 px-2 text-center w-20">Kills</th>
                            <th className="py-2.5 px-3 text-right">Match + Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {teams.map((t) => {
                            const sc = scores[t.id] || { placement: 1, kills: 0, placementPoints: 0, matchTotal: 0 };
                            return (
                              <tr key={t.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-2 px-3 text-slate-900 font-semibold">{t.teamName}</td>
                                <td className="py-2 px-2 text-center font-mono text-slate-500">
                                  {t.totalPoints}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    min="1"
                                    max={teams.length}
                                    value={sc.placement}
                                    onChange={(e) =>
                                      handleScoreChange(t.id, "placement", parseInt(e.target.value) || 1)
                                    }
                                    className="w-14 px-1.5 py-1 text-center rounded border border-slate-200 font-mono text-xs font-bold"
                                  />
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={sc.kills}
                                    onChange={(e) =>
                                      handleScoreChange(t.id, "kills", parseInt(e.target.value) || 0)
                                    }
                                    className="w-14 px-1.5 py-1 text-center rounded border border-slate-200 font-mono text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-2 px-3 text-right font-mono">
                                  <span className="font-bold text-emerald-600">+{sc.matchTotal}</span>
                                  <span className="text-slate-400 text-[11px] ml-1.5">
                                    ({t.totalPoints + sc.matchTotal})
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Proof Screenshot Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Mandatory Verification Proof (Screenshot / Photo)</span>
                      <span className="text-emerald-600 text-[11px] font-bold">
                        {proofUrl ? "✓ Proof Attached" : "* Required"}
                      </span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                            <span>Uploading Screenshot...</span>
                          </>
                        ) : proofUrl ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Replace Screenshot</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 text-slate-500" />
                            <span>Upload End-Screen Screenshot</span>
                          </>
                        )}
                      </button>

                      {/* Manual URL input fallback */}
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="Or paste screenshot URL / Google Drive link"
                        className="w-full sm:flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    {proofUrl && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
                        {proofUrl.startsWith("data:image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={proofUrl}
                            alt="Proof preview"
                            className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shrink-0 shadow-xs"
                          />
                        ) : (
                          <FileImage className="w-6 h-6 text-emerald-600 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Proof Screenshot Verified</span>
                          </p>
                          <p className="text-[11px] text-emerald-700 truncate font-mono">
                            {proofUrl.startsWith("data:image/")
                              ? "Compressed in-browser (~100KB) • Ready for commit"
                              : proofUrl}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProofUrl("")}
                          className="px-2 py-1 rounded hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Referee Notes / Disqualifications</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Bermuda Map • Clean finish, no rule violations"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUnlocked(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitMatch}
                      disabled={isSubmitting || !proofUrl || submitSuccess}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Publishing Results...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Commit Match {matchNumber} Results</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
