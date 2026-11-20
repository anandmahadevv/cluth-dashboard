"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {ALL_GAME_IDS} from "@/lib/campus-games";
import { PocMatchStatus } from "@/components/operations/poc-match-status";
import { parsePocDraft, pocDraftKey, type PocDraft } from "@/lib/poc-draft-storage";
import {
  ShieldCheck,
  Lock,
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
  Search,
  Crown,
  X,
  Award,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { MatchReviewDialog } from "@/components/operations/match-review-dialog";
import { buildMatchDraftResults } from "@/lib/match-draft";
import { EvidenceUpload } from "@/components/operations/evidence-upload";
import { AccessShell } from "@/components/operations/access-shell";
import { GameId } from "@/types";
import { GAMES_CONFIG } from "@/lib/constants";
import { PLACEMENT_POINTS, getFreeFireGroupInfo } from "@/lib/tournament-constants";

interface TeamEntry {
  id: string;
  teamName: string;
  gameId: GameId;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  rank: number;
  hidden?: boolean;
  qualified?: boolean;
}

interface TeamScoreInput {
  teamId: string;
  placement: number;
  kills: number;
  placementPoints: number;
  matchTotal: number;
}

export default function PocPortalPage() {
  const pocGameOptions=ALL_GAME_IDS.map(id=>({id,label:GAMES_CONFIG[id].name,icon:({FREE_FIRE:Flame,BGMI:Crosshair,COD:Crosshair,VALORANT:Target,EFOOTBALL:Gamepad2,MATIKS:Brain})[id],color:"text-emerald-700"}));
  const [activeScoringTeam, setActiveScoringTeam] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameId>("FREE_FIRE");
  const [pocCode, setPocCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Multi-Campus Role Scope
  const [campusId, setCampusId] = useState<string>("mangalore");
  const [campusName, setCampusName] = useState<string>("Mangalore Arena");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  // Scoring Step state
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [orderedTeamIds, setOrderedTeamIds] = useState<string[]>([]);
  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [scores, setScores] = useState<Record<string, TeamScoreInput>>({});
  const [proofUrl, setProofUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [draftStorageError, setDraftStorageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [togglingQualifiedId, setTogglingQualifiedId] = useState<string | null>(null);
  const [qualifiedError, setQualifiedError] = useState("");
  const [qualifiedNotice, setQualifiedNotice] = useState<string>("");
  const [ffGroupFilter, setFfGroupFilter] = useState<"ALL" | "A" | "B" | "QUALIFIED">("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isUnlocked || submitSuccess || !orderedTeamIds.length) return;
    const draft: PocDraft = {
      version: 1, savedAt: Date.now(), matchNumber, notes, orderedTeamIds,
      scores: Object.fromEntries(orderedTeamIds.map(id => [id, {
        placementPoints: scores[id]?.placementPoints ?? 0, kills: scores[id]?.kills ?? 0,
      }])),
    };
    try {
      localStorage.setItem(pocDraftKey(campusId, selectedGame), JSON.stringify(draft));
      setDraftStorageError(false);
    } catch { setDraftStorageError(true); }
  }, [isUnlocked, submitSuccess, campusId, selectedGame, matchNumber, notes, orderedTeamIds, scores]);

  // Special Awards State (Winner, Runner-up, MVP & Top Fragger)
  const [winnerTeam, setWinnerTeam] = useState("");
  const [winnerScore, setWinnerScore] = useState("");
  const [runnerUpTeam, setRunnerUpTeam] = useState("");
  const [runnerUpScore, setRunnerUpScore] = useState("");
  const [mvpName, setMvpName] = useState("");
  const [mvpTeam, setMvpTeam] = useState("");
  const [mvpStats, setMvpStats] = useState("");
  const [topFraggerName, setTopFraggerName] = useState("");
  const [topFraggerTeam, setTopFraggerTeam] = useState("");
  const [topFraggerKills, setTopFraggerKills] = useState<number | string>("");
  const [isSavingAwards, setIsSavingAwards] = useState(false);
  const [awardsMessage, setAwardsMessage] = useState("");
  const [awardsError, setAwardsError] = useState("");
  const [awardsSubmission, setAwardsSubmission] = useState<{
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    timestamp: string;
    rejectionReason?: string;
    approvedAt?: string;
  } | null>(null);

  const fetchAwards = async () => {
    try {
      const res = await fetch(`/api/poc/awards?gameId=${selectedGame}&campusId=${campusId}&t=${Date.now()}`, {headers:{"x-poc-code":pocCode},cache:"no-store"});
      const data = await res.json();
      if (data.success) {
        if (data.latestSubmission) {
          setAwardsSubmission(data.latestSubmission);
          const subAwards = data.latestSubmission.awards;
          if (subAwards && (data.latestSubmission.status === "PENDING" || !data.awards?.winnerTeam)) {
            if (subAwards.winnerTeam) setWinnerTeam(subAwards.winnerTeam);
            if (subAwards.winnerScore) setWinnerScore(subAwards.winnerScore);
            if (subAwards.runnerUpTeam) setRunnerUpTeam(subAwards.runnerUpTeam);
            if (subAwards.runnerUpScore) setRunnerUpScore(subAwards.runnerUpScore);
            if (subAwards.mvp) {
              setMvpName(subAwards.mvp.playerName || "");
              setMvpTeam(subAwards.mvp.teamName || "");
              setMvpStats(subAwards.mvp.stats || "");
            }
            if (subAwards.topFragger) {
              setTopFraggerName(subAwards.topFragger.playerName || "");
              setTopFraggerTeam(subAwards.topFragger.teamName || "");
              setTopFraggerKills(subAwards.topFragger.kills ?? "");
            }
          }
        }
        if (data.awards) {
          if (data.awards.winnerTeam && (!data.latestSubmission || data.latestSubmission.status === "APPROVED")) {
            setWinnerTeam(data.awards.winnerTeam);
            if (data.awards.winnerScore) setWinnerScore(data.awards.winnerScore);
            if (data.awards.runnerUpTeam) setRunnerUpTeam(data.awards.runnerUpTeam);
            if (data.awards.runnerUpScore) setRunnerUpScore(data.awards.runnerUpScore);
            if (data.awards.mvp) {
              setMvpName(data.awards.mvp.playerName || "");
              setMvpTeam(data.awards.mvp.teamName || "");
              setMvpStats(data.awards.mvp.stats || "");
            }
            if (data.awards.topFragger) {
              setTopFraggerName(data.awards.topFragger.playerName || "");
              setTopFraggerTeam(data.awards.topFragger.teamName || "");
              setTopFraggerKills(data.awards.topFragger.kills ?? "");
            }
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isUnlocked) void fetchAwards();
    // Fetch only after the verified assignment has committed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked, campusId, selectedGame]);

  const handleSaveAwards = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAwards(true);
    setAwardsMessage("");
    setAwardsError("");

    try {
      const res = await fetch("/api/poc/awards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame,
          campusId,
          pocCode,
          awards: {
            winnerTeam: winnerTeam.trim(),
            winnerScore: winnerScore.trim(),
            runnerUpTeam: runnerUpTeam.trim(),
            runnerUpScore: runnerUpScore.trim(),
            mvp: {
              playerName: mvpName.trim(),
              teamName: mvpTeam.trim(),
              stats: mvpStats.trim(),
            },
            topFragger: {
              playerName: topFraggerName.trim(),
              teamName: topFraggerTeam.trim(),
              kills: topFraggerKills !== "" ? Number(topFraggerKills) : undefined,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit awards request.");
      }

      if (data.submission) {
        setAwardsSubmission(data.submission);
      }
      setAwardsMessage(data.message || "Awards request submitted! Awaiting Super Admin approval before broadcasting live.");
      setTimeout(() => setAwardsMessage(""), 5000);
    } catch (err: any) {
      setAwardsError(err.message || "Failed to submit awards request.");
    } finally {
      setIsSavingAwards(false);
    }
  };

  // Live refresh teams from server
  const refreshTeams = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `/api/poc/teams?gameId=${selectedGame}&campusId=${campusId}&includeHidden=true&t=${Date.now()}`,
        { cache: "no-store", headers: { "Cache-Control": "no-cache", "x-poc-code": pocCode } }
      );
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.teams)) {
        setTeams(data.teams);
      }
    } catch (err) {
      console.error("Failed to refresh teams:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


  // Toggle Qualified Status for Finals (Q mark)
  const handleToggleQualified = async (teamId: string) => {
    setTogglingQualifiedId(teamId);
    setQualifiedNotice("");
    setQualifiedError("");

    const currentTeam = teams.find((t) => t.id === teamId);
    const targetQualified = currentTeam ? !currentTeam.qualified : true;

    // Instant optimistic update
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, qualified: targetQualified } : t))
    );

    try {
      const res = await fetch("/api/poc/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame,
          campusId,
          teamId,
          qualified: targetQualified,
          action: "TOGGLE_QUALIFIED",
          pocCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback optimistic update
        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, qualified: !targetQualified } : t))
        );
        throw new Error(data.error || "Failed to update qualified status.");
      }

      setQualifiedNotice(
        data.message || (targetQualified ? `Team "${currentTeam?.teamName}" marked as QUALIFIED!` : `Team "${currentTeam?.teamName}" removed from qualifiers.`)
      );
      if (Array.isArray(data.teams)) {
        setTeams(data.teams);
      }
      setTimeout(() => setQualifiedNotice(""), 3500);
    } catch (err: any) {
      setQualifiedError(err.message || "Error updating qualified status.");
    } finally {
      setTogglingQualifiedId(null);
    }
  };

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

      const assignedGame = data.gameId as GameId;
      if (!GAMES_CONFIG[assignedGame] || !data.campusId) throw new Error("The key has no valid campus/game assignment. Contact your admin.");
      setSelectedGame(assignedGame);
      setWinnerTeam(""); setWinnerScore(""); setRunnerUpTeam(""); setRunnerUpScore("");
      setMvpName(""); setMvpTeam(""); setMvpStats("");
      setTopFraggerName(""); setTopFraggerTeam(""); setTopFraggerKills("");
      setAwardsSubmission(null); setAwardsMessage(""); setAwardsError("");
      setActiveScoringTeam(null);
      setSearchFilter("");
      setFfGroupFilter("ALL");
      if (data.campusId) setCampusId(data.campusId);
      if (data.campusName) setCampusName(data.campusName);
      if (data.isLocked !== undefined) setIsLocked(data.isLocked);
      if (data.isSuperAdmin !== undefined) setIsSuperAdmin(data.isSuperAdmin);

      setTeams(data.teams);
      const teamIdList = data.teams.map((t: TeamEntry) => t.id);
      setOrderedTeamIds(teamIdList);

      // Initialize scores in order 1..N
      const initialScores: Record<string, TeamScoreInput> = {};
      teamIdList.forEach((id: string, idx: number) => {
        const place = idx + 1;
        const pts = calcMatchPoints(place, 0, assignedGame);
        initialScores[id] = {
          teamId: id,
          placement: place,
          kills: 0,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        };
      });

      setMatchNumber(1);
      setNotes("");
      setProofUrl("");
      setSubmitSuccess(false);
      setSubmitError("");
      setIsReviewOpen(false);
      setDraftNotice("");
      setDraftStorageError(false);
      try {
        const key = pocDraftKey(data.campusId, assignedGame);
        const raw = localStorage.getItem(key);
        const draft = parsePocDraft(raw, teamIdList);
        if (draft) {
          setOrderedTeamIds(draft.orderedTeamIds);
          draft.orderedTeamIds.forEach((id, index) => {
            const saved = draft.scores[id];
            initialScores[id] = { teamId: id, placement: index + 1, kills: saved.kills,
              placementPoints: saved.placementPoints, matchTotal: saved.placementPoints + saved.kills };
          });
          setMatchNumber(draft.matchNumber);
          setNotes(draft.notes);
          setDraftNotice("Draft restored. Check the scores and reattach screenshot evidence before submitting.");
        } else if (raw) {
          localStorage.removeItem(key);
          setDraftNotice("The previous draft expired or its roster changed. A fresh draft is ready.");
        }
      } catch { setDraftStorageError(true); }
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

  const draftResults = buildMatchDraftResults(orderedTeamIds, scores);

  // Submit Match Results
  const handleSubmitMatch = async () => {
    if (submissionInFlight.current || submitSuccess) return;
    if (isLocked && !isSuperAdmin) { setSubmitError("This campus is locked. Submissions are disabled."); return; }
    if (!draftResults.length || draftResults.some(result => !teams.some(team => team.id === result.teamId))) {
      setSubmitError("The roster changed. Refresh the roster before submitting."); return;
    }
    if (isUploading) { setSubmitError("Wait until the screenshot is ready before submitting."); return; }
    if (!proofUrl) {
      setSubmitError(
        "Mandatory Proof Required: Please upload, take a photo, or paste a match screenshot before submitting."
      );
      return;
    }

    submissionInFlight.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const teamResults = draftResults;

      const res = await fetch("/api/poc/submit-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame,
          campusId: campusId,
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

      try { localStorage.removeItem(pocDraftKey(campusId, selectedGame)); } catch {}
      setDraftNotice("");
      setIsReviewOpen(false);
      setSubmitSuccess(true);
      setSuccessMessage(
        data.pending
          ? `Match ${matchNumber} results & proof submitted! Your submission is now in the review queue and will be published live to the public dashboard once approved by the Super Admin.`
          : `Match ${matchNumber} results verified & published live to the public dashboard!`
      );
    } catch (err: any) {
      setSubmitError(err.message || "Error submitting match results.");
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleNextMatch = () => {
    setDraftNotice("");
    setIsReviewOpen(false);
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

  // Filtered list for display (with search + Free Fire Group / Qualifier filter)
  const filteredTeamIds = orderedTeamIds.filter((tId) => {
    const team = teams.find((t) => t.id === tId);
    if (!team) return false;
    if (searchFilter.trim() && !team.teamName.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    if (selectedGame === "FREE_FIRE") {
      if (ffGroupFilter === "QUALIFIED") {
        return !!team.qualified;
      }
      if (ffGroupFilter === "A" || ffGroupFilter === "B") {
        const grp = getFreeFireGroupInfo(team.teamName);
        return grp.group === ffGroupFilter;
      }
    }
    return true;
  });

  if (!isUnlocked) return <AccessShell kind="poc">
            <form
              onSubmit={handleVerify}
              className="space-y-5"
            >
              <p className="text-xs leading-relaxed text-[#69776d]">Enter your game POC key. Your campus and game open automatically.</p>
              <p className="text-xs text-[#69776d]">Campus organizers: <Link href="/campus-admin" className="font-bold text-emerald-800 underline">open Campus Admin</Link>.</p>
              <details className="text-xs text-[#69776d]"><summary className="cursor-pointer font-semibold">Super Admin game selection</summary>
              {/* Game Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#48564d] uppercase tracking-wider block">
                  Select Game
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {pocGameOptions.map((g) => {
                    const Icon = g.icon;
                    const isSelected = selectedGame === g.id;
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => setSelectedGame(g.id as GameId)}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10 text-[#17211e] shadow-xs"
                            : "border-[#dfe4db] bg-[#f7f8f4] hover:bg-[#edf0e9]/50 text-[#69776d]"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${g.color}`} />
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              </details>

              {/* POC Code Input */}
              <div className="space-y-1.5">
                <label htmlFor="poc-code" className="text-xs font-bold text-[#48564d] uppercase tracking-wider block">
                  Room verification code
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#69776d] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="poc-code"
                    type="password"
                    autoComplete="off"
                    value={pocCode}
                    onChange={(e) => setPocCode(e.target.value.toUpperCase())}
                    placeholder="Enter your room code"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#f7f8f4] border border-[#d1d9ce] font-mono text-sm uppercase tracking-wider text-[#17211e] focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || !pocCode}
                className="ops-primary w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-[#17211e] font-bold text-sm shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Room Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open scoring workspace</span>
                  </>
                )}
              </button>
            </form>
  </AccessShell>;

  return (
    <div className="ops-panel poc-workspace min-h-screen bg-[#f7f8f4] text-[#17211e] flex flex-col font-sans">
      <MatchReviewDialog open={isReviewOpen} campusName={campusName} gameName={GAMES_CONFIG[selectedGame].name} gameId={selectedGame} matchNumber={matchNumber} results={draftResults} teams={teams} proofUrl={proofUrl} notes={notes} locked={isLocked && !isSuperAdmin} busy={isSubmitting} error={submitError} onClose={() => setIsReviewOpen(false)} onConfirm={handleSubmitMatch} />
      {/* Top Header */}
      <header className="border-b border-[#dfe4db] bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#d1d9ce] overflow-hidden flex items-center justify-center p-0.5 shrink-0">
              <img
                src="/images/clutch-logo.jpg"
                alt="CLUTCH"
                className="w-full h-full object-contain"
              />
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#69776d] hover:text-[#17211e] transition px-2.5 py-1.5 rounded-lg hover:bg-[#edf0e9]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public Broadcast Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Referee workspace</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isUnlocked && (
          /* ==================================================== */
          /* STEP 2: FAST DRAG-AND-DROP SCORING & PROOF UPLOAD    */
          /* ==================================================== */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="poc-desk-heading flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#69776d]">Referee workspace · {campusName}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17211e]">{GAMES_CONFIG[selectedGame].name} score desk</h1>
                <p className="mt-1 text-xs text-[#69776d]">{teams.length} teams · Score, attach evidence, then review.</p></div>
              <button type="button" onClick={() => { setIsUnlocked(false); setPocCode(""); }} className="rounded-lg border border-[#dfe4db] bg-white px-3 py-2 text-xs font-semibold text-[#48564d]">Use another key</button>
            </div>
            {!submitSuccess && <div className="poc-match-toolbar" role="region" aria-label="Current match controls">
              <div className="flex items-center gap-2">
                <label htmlFor="poc-match-number" className="text-xs font-bold text-[#48564d]">Match</label>
                <button type="button" aria-label="Previous match number" disabled={matchNumber <= 1} onClick={() => setMatchNumber(n => Math.max(1,n - 1))} className="poc-toolbar-step">−</button>
                <input id="poc-match-number" aria-label="Match number" type="number" min="1" value={matchNumber} onChange={e => setMatchNumber(Math.max(1,parseInt(e.target.value) || 1))} className="w-14 rounded-lg border border-[#d1d9ce] bg-[#f7f8f4] text-center text-sm font-bold" />
                <button type="button" aria-label="Next match number" onClick={() => setMatchNumber(n => n + 1)} className="poc-toolbar-step">+</button>
              </div>
              <span role="status" className="poc-toolbar-status text-xs text-[#69776d]">{draftStorageError ? "Draft not saved" : "Draft saved"} · {isUploading ? "Preparing evidence…" : proofUrl ? "Evidence ready" : "Evidence needed"}</span>
              <button type="button" onClick={() => { setSubmitError(""); setIsReviewOpen(true); }} disabled={isSubmitting || isUploading || !proofUrl || !draftResults.length} className="ops-primary flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50"><ShieldCheck className="h-4 w-4" />Review match</button>
            </div>}

            {!submitSuccess && <div role="status" className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${draftStorageError ? "border-amber-200 bg-amber-50 text-amber-800" : "border-[#dfe4db] bg-white text-[#69776d]"}`}>
              {draftStorageError ? "Draft could not be saved on this browser. Keep this page open to avoid losing your work." : draftNotice || "Draft saved automatically on this browser for 7 days. Scores, order, match number and notes are recovered after sign-in; reattach evidence after a refresh."}
            </div>}

            <PocMatchStatus code={pocCode} gameId={selectedGame} campusId={campusId} submitted={submitSuccess} />

            {/* Campus Locked Alert Notice if locked and not super admin */}
            {isLocked && !isSuperAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-start gap-3 shadow-md">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-bold">Campus locked by admin</div>
                  <div className="text-xs text-amber-800/80 leading-relaxed">
                    {campusName} has concluded. You can view the roster; match submissions are disabled.
                  </div>
                </div>
              </div>
            )}

            <details className="px-1 py-1 text-xs text-[#69776d]">
              <summary className="cursor-pointer font-semibold text-[#48564d]">Scoring shortcuts</summary>
              <p className="mt-3 leading-relaxed">Drag a team using its grip to change the match order. Use the + and − buttons to adjust kills. Paste screenshot evidence with <kbd className="rounded border border-[#d1d9ce] bg-[#f7f8f4] px-1.5 py-0.5">Ctrl + V</kbd>.</p>
            </details>

            {submitSuccess ? (
              <div className="bg-white border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#17211e]">Results Submitted Successfully!</h3>
                  <p className="text-xs sm:text-sm text-[#48564d] max-w-lg mx-auto leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleNextMatch}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-[#17211e] font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Match #{matchNumber + 1} Results</span>
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2.5 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] font-semibold text-xs transition"
                  >
                    View Public Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
                {/* Left 2 Cols: Drag & Drop Table */}
                <div className="lg:col-span-2 bg-white border border-[#dfe4db] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                  {/* Top 3 Live Visualizer Bar */}
                  <div className="rounded-xl border border-[#dfe4db] bg-[#f7f8f4]/70 p-3">
                    <div className="text-[11px] font-bold text-[#69776d] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-700" />
                        <span>Match #{matchNumber} · podium preview</span>
                      </span>
                      <span className="text-[#87938a]">Auto-updates as you drag</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* 1st Place */}
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="text-[10px] font-black text-amber-700">🥇 1ST PLACE</div>
                        <div className="font-bold text-[#17211e] truncate text-xs mt-0.5">
                          {top1Team?.teamName || "—"}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-amber-700 mt-0.5">
                          +{scores[orderedTeamIds[0]]?.matchTotal || 0} pts
                        </div>
                      </div>

                      {/* 2nd Place */}
                      <div className="p-2 rounded-lg bg-[#edf0e9]/80 border border-[#d1d9ce]">
                        <div className="text-[10px] font-black text-[#48564d]">🥈 2ND PLACE</div>
                        <div className="font-bold text-[#17211e] truncate text-xs mt-0.5">
                          {top2Team?.teamName || "—"}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-[#48564d] mt-0.5">
                          +{scores[orderedTeamIds[1]]?.matchTotal || 0} pts
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="p-2 rounded-lg bg-amber-900/20 border border-amber-700/40">
                        <div className="text-[10px] font-black text-amber-700">🥉 3RD PLACE</div>
                        <div className="font-bold text-[#17211e] truncate text-xs mt-0.5">
                          {top3Team?.teamName || "—"}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-amber-700 mt-0.5">
                          +{scores[orderedTeamIds[2]]?.matchTotal || 0} pts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Free Fire Qualifiers Status Banner & Fast Room Filters */}
                  {selectedGame === "FREE_FIRE" && (
                    <div className="p-3 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs font-bold text-[#17211e]">
                          Grand Finals Qualifiers:{" "}
                          <span className="text-emerald-700 font-mono text-sm font-black">
                            {teams.filter((t) => t.qualified).length} / 12
                          </span>{" "}
                          <span className="text-[#69776d] font-normal text-[11px]">
                            (Top 6 Group A + Top 6 Group B)
                          </span>
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-[#dfe4db] text-xs">
                        <button
                          type="button"
                          onClick={() => setFfGroupFilter("ALL")}
                          className={`px-2.5 py-1 rounded-md transition font-semibold text-xs ${
                            ffGroupFilter === "ALL"
                              ? "bg-[#edf0e9] text-[#17211e] shadow-xs font-bold"
                              : "text-[#69776d] hover:text-[#17211e]"
                          }`}
                        >
                          All ({teams.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFfGroupFilter("A")}
                          className={`px-2.5 py-1 rounded-md transition font-semibold text-xs ${
                            ffGroupFilter === "A"
                              ? "bg-blue-600 text-[#17211e] font-bold"
                              : "text-[#69776d] hover:text-blue-700"
                          }`}
                        >
                          Group A (LH18)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFfGroupFilter("B")}
                          className={`px-2.5 py-1 rounded-md transition font-semibold text-xs ${
                            ffGroupFilter === "B"
                              ? "bg-purple-600 text-[#17211e] font-bold"
                              : "text-[#69776d] hover:text-purple-700"
                          }`}
                        >
                          Group B (LH19)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFfGroupFilter("QUALIFIED")}
                          className={`px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5 ${
                            ffGroupFilter === "QUALIFIED"
                              ? "bg-emerald-600 text-[#17211e] font-bold"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          <span>⭐ Qualifiers (Q)</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-[10px] font-mono font-bold">
                            {teams.filter((t) => t.qualified).length}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {qualifiedError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">{qualifiedError}</p>}
                  {qualifiedNotice && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{qualifiedNotice}</span>
                    </div>
                  )}

                  {/* Toolbar & Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-[#69776d] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter by team name..."
                        aria-label="Search roster"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#f7f8f4] border border-[#dfe4db] text-xs text-[#17211e] placeholder-slate-500 focus:border-blue-500 outline-none"
                      />
                      {searchFilter && (
                        <button
                          onClick={() => setSearchFilter("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#69776d] hover:text-[#17211e]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={refreshTeams}
                        disabled={isRefreshing}
                        className="px-2.5 py-1.5 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] border border-[#d1d9ce] text-[11px] font-semibold flex items-center gap-1.5 transition"
                        title="Sync latest roster and qualifier status from server"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-blue-700" : ""}`} />
                        <span>{isRefreshing ? "Refreshing..." : "Refresh Roster"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetOrder}
                        className="px-2.5 py-1.5 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] border border-[#d1d9ce] text-[11px] font-semibold"
                        title="Recalculate 1 to N placement points"
                      >
                        Recalculate Points
                      </button>
                    </div>
                  </div>

                  <div className="poc-score-columns" aria-hidden="true">
                    <span>Rank / team</span><span className="text-center">Reorder</span>
                    <div className="flex justify-between"><span>{selectedGame === "VALORANT" ? "" : selectedGame === "EFOOTBALL" ? "Goals" : selectedGame === "MATIKS" ? "Bonus" : "Kills"}</span><span>Match total</span></div>
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
                          role="group"
                          aria-label={`${t.teamName}, match rank ${rank}`}
                          data-active={activeScoringTeam === teamId}
                          onFocusCapture={() => setActiveScoringTeam(teamId)}
                          onClick={() => setActiveScoringTeam(teamId)}
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
                          className={`poc-score-row ${isDragging ? "opacity-40" : ""} ${isDragOver ? "poc-score-drop-target" : ""}`}
                        >
                          {/* Left: Drag Handle, Rank Badge, Team Name */}
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            {/* Grip Drag Handle */}
                            <div
                              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[#87938a] hover:text-[#48564d] transition"
                              title="Drag up or down to reorder"
                            >
                              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            {/* Rank Badge */}
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black border shrink-0 ${
                                isFirst
                                  ? "bg-amber-500/20 text-amber-700 border-amber-500/40 shadow-xs"
                                  : isSecond
                                  ? "bg-slate-300/20 text-[#3f4b43] border-slate-400/40"
                                  : isThird
                                  ? "bg-amber-700/20 text-amber-700 border-amber-700/40"
                                  : "bg-[#edf0e9] text-[#69776d] border-[#d1d9ce]"
                              }`}
                            >
                              <span className="tabular-nums">{String(rank).padStart(2, "0")}</span>
                            </span>

                            {/* Team Name & Overall stats + Group & Q Mark */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="w-full break-words font-bold text-[#17211e] text-sm leading-snug">
                                  {t.teamName}
                                </span>
                                {selectedGame === "FREE_FIRE" && (() => {
                                  const grp = getFreeFireGroupInfo(t.teamName);
                                  return (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                        grp.group === "A"
                                          ? "bg-blue-500/20 text-blue-700 border-blue-500/40"
                                          : "bg-purple-500/20 text-purple-700 border-purple-500/40"
                                      }`}
                                    >
                                      {grp.badge}
                                    </span>
                                  );
                                })()}
                                {selectedGame === "FREE_FIRE" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleQualified(t.id);
                                    }}
                                    disabled={togglingQualifiedId === t.id}
                                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-black transition flex items-center gap-1.5 ${
                                      t.qualified
                                        ? "bg-emerald-500/25 text-emerald-700 border-emerald-400/60 shadow-xs"
                                        : "bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] border-[#d1d9ce]"
                                    }`}
                                    title={
                                      t.qualified
                                        ? "Team Qualified for Grand Finals! Click to unmark"
                                        : "Click to add Q mark (Grand Finals Qualifier)"
                                    }
                                  >
                                    {togglingQualifiedId === t.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                                    ) : (
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                          t.qualified
                                            ? "bg-emerald-400 text-slate-950 font-black"
                                            : "bg-[#dfe6db] text-[#48564d]"
                                        }`}
                                      >
                                        Q
                                      </span>
                                    )}
                                    <span>{t.qualified ? "QUALIFIED" : "Mark Q"}</span>
                                  </button>
                                )}
                              </div>
                              <div className="text-[10px] text-[#69776d] flex items-center gap-2 mt-0.5">
                                {activeScoringTeam === teamId && <span className="font-semibold text-[#ad522b]">Editing</span>}
                                <span className="font-mono text-[#69776d]">{t.totalPoints} overall pts</span>
                              </div>
                            </div>
                          </div>

                          {/* Rank controls remain keyboard and touch accessible. */}
                          <div className="poc-order-controls">
                            {isFirst && <span aria-hidden="true" />}
                            {!isFirst && (
                              <button
                                type="button"
                                aria-label={`Move ${t.teamName} to first place`}
                                onClick={() => pinToFirst(teamId)}
                                className="px-1.5 py-1 rounded bg-[#edf0e9] hover:bg-[#dfe6db] text-amber-700 hover:text-amber-700 text-[10px] font-bold border border-[#d1d9ce] inline-flex items-center justify-center gap-1"
                                title="Move this squad directly to 1st place"
                              >
                                <Crown className="w-3 h-3" />
                                <span>#1</span>
                              </button>
                            )}

                            <div className="contents">
                              <button
                                type="button"
                                aria-label={`Move ${t.teamName} up`}
                                onClick={() => moveOneSlot(teamId, "UP")}
                                disabled={actualIndex === 0}
                                className="p-1 rounded bg-[#edf0e9] disabled:opacity-20 text-[9px] text-[#48564d]"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                aria-label={`Move ${t.teamName} down`}
                                onClick={() => moveOneSlot(teamId, "DOWN")}
                                disabled={actualIndex === orderedTeamIds.length - 1}
                                className="p-1 rounded bg-[#edf0e9] disabled:opacity-20 text-[9px] text-[#48564d]"
                              >
                                ▼
                              </button>
                            </div>
                          </div>

                          {/* Right: Kills Stepper & Match Total */}
                          <div className="poc-score-values">
                            {selectedGame !== "VALORANT" && (
                              <div className="flex items-center gap-1">
                                <span className="poc-score-stat-label text-[10px] text-[#69776d] mr-1 font-semibold">
                                  {selectedGame === "EFOOTBALL"
                                    ? "Goals:"
                                    : selectedGame === "MATIKS"
                                    ? "Bonus:"
                                    : "Kills:"}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Decrease score for ${t.teamName}`}
                                  onClick={() => handleKillsChange(teamId, (sc.kills || 0) - 1)}
                                  disabled={(sc.kills || 0) <= 0}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] active:scale-95 disabled:opacity-30 text-[#17211e] font-bold text-xs flex items-center justify-center transition border border-[#d1d9ce] select-none"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  aria-label={`Score for ${t.teamName}`}
                                  value={sc.kills || 0}
                                  onChange={(e) =>
                                    handleKillsChange(teamId, parseInt(e.target.value) || 0)
                                  }
                                  className="w-10 sm:w-12 h-7 sm:h-8 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-[#17211e] text-center font-bold text-xs focus:border-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  aria-label={`Increase score for ${t.teamName}`}
                                  onClick={() => handleKillsChange(teamId, (sc.kills || 0) + 1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] active:scale-95 text-[#17211e] font-bold text-xs flex items-center justify-center transition border border-[#d1d9ce] select-none"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* Match Points Earned Pill */}
                            <div className="poc-match-total">
                              <div className="text-lg font-extrabold tabular-nums text-[#17211e]">
                                {sc.matchTotal}
                              </div>
                              <div className="text-[9px] text-[#69776d] font-mono">
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
                      <div className="text-center py-8 text-xs text-[#87938a]">
                        No squads found matching &quot;{searchFilter}&quot;.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Match Number & Fast Screenshot Upload */}
                <div role="region" aria-label="Match evidence and submission" tabIndex={0} className="poc-evidence-panel bg-white border border-[#dfe4db] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 lg:sticky lg:top-40">
                  <h3 className="text-xs font-bold text-[#48564d] uppercase tracking-wider border-b border-[#dfe4db] pb-2">
                    Match evidence
                  </h3>

                  {/* Mandatory Screenshot / Photo Proof Area */}
                  <EvidenceUpload value={proofUrl} onChange={setProofUrl} onProcessingChange={setIsUploading} disabled={isSubmitting || isReviewOpen} />

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-[#48564d] mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Clean finish, 4 kills final circle"
                      className="w-full px-3 py-2 rounded-xl bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] resize-none outline-none focus:border-blue-500"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button type="button" onClick={() => { setSubmitError(""); setIsReviewOpen(true); }} disabled={isSubmitting || isUploading || !proofUrl || !draftResults.length}
                    className="ops-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition disabled:opacity-50">
                    <ShieldCheck className="h-4 w-4" />Review match #{matchNumber}
                  </button>
                  {isLocked && !isSuperAdmin && <p className="text-[10px] leading-relaxed text-amber-700">Draft review is available. Submitting remains disabled while this campus is locked.</p>}

                  <div className="p-2.5 rounded-lg bg-[#f7f8f4] border border-[#dfe4db] text-[11px] text-[#69776d] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Results will be verified by the Super Admin before appearing live on the public dashboard.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Special Accolades Editor (MVP & Top Fragger) */}
            <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfe4db] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#17211e] uppercase tracking-wider font-display">
                      Tournament Special Awards (MVP & Top Fragger)
                    </h3>
                    <p className="text-xs text-[#69776d]">
                      Submit official player awards nomination. Requires Super Admin verification before broadcasting live.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {awardsSubmission?.status === "PENDING" && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> AWAITING ADMIN APPROVAL
                    </span>
                  )}
                  {awardsSubmission?.status === "APPROVED" && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> RATIFIED & LIVE
                    </span>
                  )}
                  {awardsSubmission?.status === "REJECTED" && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-700 font-bold border border-red-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> REVISION REQUESTED
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold border border-amber-500/30">
                    GRAND FINALS ACCOLADES
                  </span>
                </div>
              </div>

              {/* Approval Status Banners */}
              {awardsSubmission?.status === "PENDING" && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span>AWARDS NOMINATION PENDING SUPER ADMIN APPROVAL</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono">
                        {awardsSubmission.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Your nominated champions and accolades have been submitted to the Super Admin. Once approved, they will immediately appear on the public dashboard and podium. You may adjust and resubmit the details below anytime.
                    </p>
                  </div>
                </div>
              )}

              {awardsSubmission?.status === "APPROVED" && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">AWARDS RATIFIED & LIVE ON PUBLIC DASHBOARD</div>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Super Admin has officially ratified these tournament accolades. They are live on the leaderboard, game results, and winners podium.
                    </p>
                  </div>
                </div>
              )}

              {awardsSubmission?.status === "REJECTED" && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">REVISION REQUESTED BY SUPER ADMIN</div>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      <strong>Reason:</strong> {awardsSubmission.rejectionReason || "Please adjust scores or player details."}
                    </p>
                    <p className="text-[10px] text-red-600 mt-0.5">
                      Please review the feedback, update the fields below, and resubmit for approval.
                    </p>
                  </div>
                </div>
              )}

              {awardsMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{awardsMessage}</span>
                </div>
              )}

              {awardsError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{awardsError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAwards} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1st Place Champion Input Block */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <Trophy className="w-4 h-4" />
                      <span>1st PLACE CHAMPION (WINNER CUP)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Winning Squad Name
                      </label>
                      <input
                        type="text"
                        value={winnerTeam}
                        onChange={(e) => setWinnerTeam(e.target.value)}
                        placeholder="e.g. TOTAL DOMINANCE"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Grand Finals Score / Subtext (Optional)
                      </label>
                      <input
                        type="text"
                        value={winnerScore}
                        onChange={(e) => setWinnerScore(e.target.value)}
                        placeholder="e.g. 52 Pts • 2 Booyahs"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* 2nd Place Runner-Up Input Block */}
                  <div className="p-4 rounded-xl border border-[#b8c4b4]/30 bg-[#edf0e9]/20 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#48564d]">
                      <Award className="w-4 h-4 text-[#69776d]" />
                      <span>2nd PLACE (RUNNER-UP CUP)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Runner-Up Squad Name
                      </label>
                      <input
                        type="text"
                        value={runnerUpTeam}
                        onChange={(e) => setRunnerUpTeam(e.target.value)}
                        placeholder="e.g. BROTHERHOOD"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-slate-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Grand Finals Score / Subtext (Optional)
                      </label>
                      <input
                        type="text"
                        value={runnerUpScore}
                        onChange={(e) => setRunnerUpScore(e.target.value)}
                        placeholder="e.g. 46 Pts • 1 Booyah"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Tournament MVP Input Block */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <Crown className="w-4 h-4" />
                      <span>TOURNAMENT MVP</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        MVP Player Name (IGN)
                      </label>
                      <input
                        type="text"
                        value={mvpName}
                        onChange={(e) => setMvpName(e.target.value)}
                        placeholder="e.g. Akash 'CLUTCH' Verma"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={mvpTeam}
                        onChange={(e) => setMvpTeam(e.target.value)}
                        placeholder="e.g. Khopdi Phodu gng"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Highlight / Impact Stat (Optional)
                      </label>
                      <input
                        type="text"
                        value={mvpStats}
                        onChange={(e) => setMvpStats(e.target.value)}
                        placeholder="e.g. 10 Kills • 2 Booyahs"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Top Fragger Input Block */}
                  <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                      <Crosshair className="w-4 h-4" />
                      <span>TOP FRAGGER (HIGHEST INDIVIDUAL KILLS)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Player Name (IGN)
                      </label>
                      <input
                        type="text"
                        value={topFraggerName}
                        onChange={(e) => setTopFraggerName(e.target.value)}
                        placeholder="e.g. Rahul 'SNIPER' Kumar"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-rose-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={topFraggerTeam}
                        onChange={(e) => setTopFraggerTeam(e.target.value)}
                        placeholder="e.g. BROTHERHOOD"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-rose-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                        Total Confirmed Kills
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topFraggerKills}
                        onChange={(e) => setTopFraggerKills(e.target.value)}
                        placeholder="e.g. 14"
                        className="w-full px-3 py-2 rounded-lg bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-rose-400 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingAwards}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingAwards ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Awards Request...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {awardsSubmission?.status === "PENDING"
                          ? "Update & Resubmit Awards Request"
                          : awardsSubmission?.status === "REJECTED"
                          ? "Resubmit Awards for Admin Approval"
                          : "Submit Awards Request for Super Admin Approval"}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
