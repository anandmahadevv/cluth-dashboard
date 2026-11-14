"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Flame,
  Crosshair,
  Target,
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
  Lock,
  Unlock,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  Inbox,
  Clock,
  UserCheck,
  Ban,
  Maximize2,
  Users,
  Plus,
  Trash2,
  Pencil,
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

interface SubmissionRecord {
  id: string;
  gameId: GameId;
  matchNumber: number | string;
  timestamp: string;
  pocCode: string;
  proofUrl: string;
  notes?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
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
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Main UI Mode
  const [mainTab, setMainTab] = useState<"inbox" | "direct" | "history" | "teams">("inbox");
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Teams Management State
  const [rosterGame, setRosterGame] = useState<GameId>("FREE_FIRE");
  const [rosterTeams, setRosterTeams] = useState<TeamEntry[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [rosterSuccess, setRosterSuccess] = useState("");
  const [rosterError, setRosterError] = useState("");

  // Submissions Inbox State
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");
  const [rejectionModalSub, setRejectionModalSub] = useState<SubmissionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Lightbox for Proof Image
  const [activeProofModal, setActiveProofModal] = useState<string | null>(null);

  // Direct Scoring State
  const [directGame, setDirectGame] = useState<GameId>("FREE_FIRE");
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [matchNumber, setMatchNumber] = useState<number>(1);
  const [scores, setScores] = useState<Record<string, TeamScoreInput>>({});
  const [directProofUrl, setDirectProofUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [directNotes, setDirectNotes] = useState("");
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directError, setDirectError] = useState("");

  // Reset State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check sessionStorage on mount and validate against server
  useEffect(() => {
    const saved = sessionStorage.getItem("clutch_admin_auth");
    if (saved) {
      fetch("/api/poc/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: saved }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAdminPassword(saved);
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem("clutch_admin_auth");
            setIsAuthenticated(false);
            setAdminPassword("");
          }
        })
        .catch(() => {
          sessionStorage.removeItem("clutch_admin_auth");
          setIsAuthenticated(false);
          setAdminPassword("");
        });
    }
  }, []);

  // Fetch submissions and game data when authenticated + live auto-polling every 4 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
      fetchTeamsForDirectGame(directGame);

      const interval = setInterval(() => {
        fetchSubmissions(true);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, directGame]);

  // Handle Admin Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthenticating(true);

    try {
      const res = await fetch("/api/poc/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect Super Admin password.");
      }

      setIsAuthenticated(true);
      sessionStorage.setItem("clutch_admin_auth", adminPassword);
      fetchSubmissions();
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("clutch_admin_auth");
    setIsAuthenticated(false);
    setAdminPassword("");
  };

  // Fetch all POC submissions
  const fetchSubmissions = async (isBackground = false) => {
    if (!isBackground) setIsLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/poc/submissions?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      if (!isBackground) setIsLoadingSubmissions(false);
    }
  };

  // Fetch Teams for direct scoring
  const fetchTeamsForDirectGame = async (gameId: GameId) => {
    setIsLoadingTeams(true);
    try {
      const res = await fetch("/api/poc/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: SUPER_CODE, gameId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTeams(data.teams);

        const initialScores: Record<string, TeamScoreInput> = {};
        data.teams.forEach((t: TeamEntry, idx: number) => {
          const matrix = PLACEMENT_POINTS[gameId];
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
      }
    } catch (err) {
      console.error("Error loading teams for direct scoring", err);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // Fetch Roster for selected game
  const fetchRoster = async (gameId: GameId) => {
    setIsLoadingRoster(true);
    setRosterError("");
    try {
      const res = await fetch(`/api/poc/teams?gameId=${gameId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRosterTeams(data.teams);
      } else {
        setRosterError(data.error || "Failed to load teams.");
      }
    } catch {
      setRosterError("Network error loading teams.");
    } finally {
      setIsLoadingRoster(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && mainTab === "teams") {
      fetchRoster(rosterGame);
    }
  }, [isAuthenticated, mainTab, rosterGame]);

  // Add Team
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsAddingTeam(true);
    setRosterError("");
    setRosterSuccess("");
    try {
      const res = await fetch("/api/poc/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: rosterGame,
          teamName: newTeamName.trim(),
          adminPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRosterTeams(data.teams);
        setNewTeamName("");
        setRosterSuccess(`Team "${data.team?.teamName || newTeamName.trim()}" added successfully!`);
        if (directGame === rosterGame) {
          fetchTeamsForDirectGame(rosterGame);
        }
        setTimeout(() => setRosterSuccess(""), 4000);
      } else {
        setRosterError(data.error || "Failed to add team.");
      }
    } catch {
      setRosterError("Network error adding team.");
    } finally {
      setIsAddingTeam(false);
    }
  };

  // Start Edit Team Name
  const handleStartEdit = (t: TeamEntry) => {
    setEditingTeamId(t.id);
    setEditingTeamName(t.teamName);
    setRosterError("");
  };

  // Cancel Edit Team Name
  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditingTeamName("");
  };

  // Save Edit Team Name
  const handleSaveEdit = async (teamId: string) => {
    if (!editingTeamName.trim()) return;
    setIsSavingEdit(true);
    setRosterError("");
    setRosterSuccess("");
    try {
      const res = await fetch("/api/poc/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: rosterGame,
          teamId,
          newTeamName: editingTeamName.trim(),
          adminPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRosterTeams(data.teams);
        setEditingTeamId(null);
        setEditingTeamName("");
        setRosterSuccess(`Team renamed to "${editingTeamName.trim()}" successfully!`);
        if (directGame === rosterGame) {
          fetchTeamsForDirectGame(rosterGame);
        }
        setTimeout(() => setRosterSuccess(""), 4000);
      } else {
        setRosterError(data.error || "Failed to edit team name.");
      }
    } catch {
      setRosterError("Network error updating team name.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Remove Team
  const handleRemoveTeam = async (t: TeamEntry) => {
    if (!confirm(`Are you sure you want to remove "${t.teamName}" from ${rosterGame}? This will delete the team from the leaderboard and scoring tables.`)) {
      return;
    }
    setDeletingTeamId(t.id);
    setRosterError("");
    setRosterSuccess("");
    try {
      const res = await fetch("/api/poc/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: rosterGame,
          teamId: t.id,
          adminPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRosterTeams(data.teams);
        setRosterSuccess(`Team "${t.teamName}" removed successfully from roster.`);
        if (directGame === rosterGame) {
          fetchTeamsForDirectGame(rosterGame);
        }
        setTimeout(() => setRosterSuccess(""), 4000);
      } else {
        setRosterError(data.error || "Failed to remove team.");
      }
    } catch {
      setRosterError("Network error removing team.");
    } finally {
      setDeletingTeamId(null);
    }
  };

  // Super Admin: Approve Match Submission
  const handleApproveSubmission = async (submissionId: string) => {
    setReviewingId(submissionId);
    setReviewAction("APPROVE");
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/poc/review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          action: "APPROVE",
          adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Approval failed.");
      }

      setActionSuccessMsg("Submission APPROVED & published live to the public dashboard!");
      await fetchSubmissions();
      setTimeout(() => setActionSuccessMsg(""), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error approving submission.");
    } finally {
      setReviewingId(null);
      setReviewAction(null);
    }
  };

  // Super Admin: Reject Match Submission
  const handleConfirmReject = async () => {
    if (!rejectionModalSub) return;

    setReviewingId(rejectionModalSub.id);
    setReviewAction("REJECT");
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/poc/review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: rejectionModalSub.id,
          action: "REJECT",
          adminPassword,
          rejectionReason: rejectReason || "Rejected by Super Admin",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Rejection failed.");
      }

      setRejectionModalSub(null);
      setRejectReason("");
      setActionSuccessMsg("Submission rejected. Leaderboards remain unchanged.");
      await fetchSubmissions();
      setTimeout(() => setActionSuccessMsg(""), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error rejecting submission.");
    } finally {
      setReviewingId(null);
      setReviewAction(null);
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

  // Direct Scoring Change Handlers (Smart rank assignment with auto-swapping to keep ranks unique and ordered)
  const handleScoreChange = (teamId: string, field: "placement" | "kills", value: number) => {
    setScores((prev) => {
      const updated = { ...prev };
      const current = updated[teamId] || { teamId, placement: 1, kills: 0, placementPoints: 0, matchTotal: 0 };

      if (field === "kills") {
        const kills = Math.max(0, value);
        const pts = calcMatchPoints(current.placement, kills, directGame);
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

      // Find if another team currently holds newPlacement
      const conflictTeam = Object.values(updated).find(
        (s) => s.teamId !== teamId && s.placement === newPlacement
      );

      if (conflictTeam) {
        // Swap placements between the two teams so there are never duplicate ranks!
        const swappedPts = calcMatchPoints(oldPlacement, conflictTeam.kills, directGame);
        updated[conflictTeam.teamId] = {
          ...conflictTeam,
          placement: oldPlacement,
          placementPoints: swappedPts.placementPoints,
          matchTotal: swappedPts.matchTotal,
        };
      }

      const myPts = calcMatchPoints(newPlacement, current.kills, directGame);
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

  const handleAutoFillPlacements = () => {
    setScores((prev) => {
      const updated = { ...prev };
      teams.forEach((t, idx) => {
        const place = idx + 1;
        const currentKills = updated[t.id]?.kills || 0;
        const pts = calcMatchPoints(place, currentKills, directGame);
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

  // Direct Upload with Canvas compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
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
              setDirectProofUrl(compressed);
            } else {
              setDirectProofUrl(rawDataUrl);
            }
          } catch {
            setDirectProofUrl(rawDataUrl);
          } finally {
            setIsUploading(false);
          }
        };
        img.onerror = () => {
          setDirectProofUrl(rawDataUrl);
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

  // Direct Match Submission (Auto-approved)
  const handleSubmitDirect = async () => {
    if (!directProofUrl) {
      setDirectError("Screenshot or evidence proof is required.");
      return;
    }

    setIsSubmittingDirect(true);
    setDirectError("");

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
          gameId: directGame,
          pocCode: SUPER_CODE,
          matchNumber,
          proofUrl: directProofUrl,
          notes: directNotes,
          autoApprove: true,
          teamResults,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      setDirectSuccess(true);
      setDirectProofUrl("");
      setDirectNotes("");
      await fetchTeamsForDirectGame(directGame);
      await fetchSubmissions();
    } catch (err: any) {
      setDirectError(err.message || "Error submitting match results.");
    } finally {
      setIsSubmittingDirect(false);
    }
  };

  // Reset Game Data
  const handleResetScores = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/poc/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: SUPER_CODE, gameId: directGame }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Reset failed");
      }
      setResetModalOpen(false);
      await fetchTeamsForDirectGame(directGame);
      await fetchSubmissions();
    } catch (err: any) {
      alert("Reset error: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (selectedGameFilter !== "ALL" && s.gameId !== selectedGameFilter) return false;
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  // ----------------------------------------------------
  // SCREEN 1: SUPER ADMIN PASSWORD LOCK SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">
              Super Admin Gateway
            </h1>
            <p className="text-xs text-slate-400">
              NIAT E-Sports Championship • Authoritative Match Approval & Publishing Console
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Security Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter confidential passkey"
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              disabled={isAuthenticating || !adminPassword}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Broadcast Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 2: AUTHENTICATED SUPER ADMIN CONSOLE
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-slate-700 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
              <img src="/images/clutch-logo.jpg" alt="CLUTCH" className="w-full h-full object-contain" />
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Live Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>SLUG: /43517 • SUPER ADMIN LOGGED IN</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7a1c22] border border-slate-700 overflow-hidden flex items-center justify-center p-0.5 shrink-0" title="NIAT">
              <img src="/images/niat-logo.jpg" alt="NIAT" className="w-full h-full object-contain" />
            </div>
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} Pending Approvals</span>
              </span>
            )}
            <button
              onClick={() => fetchSubmissions(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainTab("inbox")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                mainTab === "inbox"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>POC Submissions Queue</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMainTab("direct")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                mainTab === "direct"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Direct Score Entry</span>
            </button>

            <button
              onClick={() => setMainTab("teams")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                mainTab === "teams"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manage Teams & Rosters</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden md:block">
            Verified Submissions: {submissions.filter((s) => s.status === "APPROVED").length} Approved • {submissions.filter((s) => s.status === "REJECTED").length} Rejected
          </div>
        </div>

        {/* Global Action Alerts */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="underline flex items-center gap-1 hover:text-emerald-300"
            >
              <span>View Leaderboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {actionErrorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: POC SUBMISSIONS QUEUE & APPROVAL PIPELINE     */}
        {/* ---------------------------------------------------- */}
        {mainTab === "inbox" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-300">Filter Submissions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                >
                  <option value="ALL">All Statuses ({submissions.length})</option>
                  <option value="PENDING">Pending Review ({pendingCount})</option>
                  <option value="APPROVED">Approved ({submissions.filter((s) => s.status === "APPROVED").length})</option>
                  <option value="REJECTED">Rejected ({submissions.filter((s) => s.status === "REJECTED").length})</option>
                </select>

                {/* Game Filter */}
                <select
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                >
                  <option value="ALL">All Games</option>
                  <option value="FREE_FIRE">Free Fire</option>
                  <option value="BGMI">BGMI</option>
                  <option value="VALORANT">Valorant</option>
                  <option value="EFOOTBALL">eFootball</option>
                  <option value="MATIKS">MATIKS</option>
                </select>
              </div>
            </div>

            {/* Submissions List */}
            {isLoadingSubmissions ? (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                <p className="text-xs">Loading POC submissions pipeline...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
                <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No submissions matching criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When POCs enter their game codes and submit match results with proof screenshots, they will appear here awaiting your approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((sub) => {
                  const isPending = sub.status === "PENDING";
                  const isApproved = sub.status === "APPROVED";
                  const isRejected = sub.status === "REJECTED";
                  const isProcessing = reviewingId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className={`border rounded-2xl p-5 space-y-4 transition ${
                        isPending
                          ? "bg-slate-900 border-amber-500/40 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20"
                          : isApproved
                          ? "bg-slate-900 border-emerald-500/30"
                          : "bg-slate-900/60 border-red-500/30 opacity-75"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                              sub.gameId === "FREE_FIRE"
                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                : sub.gameId === "BGMI"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : sub.gameId === "VALORANT"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : sub.gameId === "EFOOTBALL"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}
                          >
                            {sub.gameId.replace("_", " ")}
                          </span>

                          <span className="text-sm font-black text-white">
                            Match #{sub.matchNumber}
                          </span>

                          <span className="text-xs font-mono text-slate-400">
                            POC: <strong className="text-slate-300">{sub.pocCode}</strong>
                          </span>

                          <span className="text-xs text-slate-400">
                            {new Date(sub.timestamp).toLocaleTimeString()} • {new Date(sub.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>PENDING APPROVAL</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>APPROVED & PUBLISHED</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5">
                              <Ban className="w-3.5 h-3.5" />
                              <span>REJECTED</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content: Proof & Team Scores Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        {/* Proof Screenshot Column */}
                        <div className="md:col-span-1 space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Photographic Proof:
                          </label>
                          {sub.proofUrl ? (
                            <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                              <img
                                src={sub.proofUrl}
                                alt="Proof Screenshot"
                                className="w-full h-36 object-cover cursor-pointer hover:scale-105 transition duration-200"
                                onClick={() => setActiveProofModal(sub.proofUrl)}
                              />
                              <button
                                onClick={() => setActiveProofModal(sub.proofUrl)}
                                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black text-[10px] flex items-center gap-1 font-semibold"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Zoom</span>
                              </button>
                            </div>
                          ) : (
                            <div className="h-36 rounded-xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs">
                              <FileImage className="w-6 h-6 mb-1" />
                              <span>No screenshot</span>
                            </div>
                          )}

                          {sub.notes && (
                            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 italic">
                              <span className="font-bold text-slate-400 not-italic block mb-0.5">POC Notes:</span>
                              "{sub.notes}"
                            </div>
                          )}

                          {isRejected && sub.rejectionReason && (
                            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                              <span className="font-bold block">Rejection Reason:</span>
                              {sub.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Reported Scores Table */}
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Reported Team Placements & Points:</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              ({sub.teamResults.length} participating squads)
                            </span>
                          </label>

                          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900/80 sticky top-0 border-b border-slate-800 text-slate-400">
                                <tr>
                                  <th className="py-2 px-3">Place</th>
                                  <th className="py-2 px-3">Team Name</th>
                                  <th className="py-2 px-2 text-center">Place Pts</th>
                                  <th className="py-2 px-2 text-center">Kills</th>
                                  <th className="py-2 px-3 text-right">Match Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {sub.teamResults.map((t) => (
                                  <tr key={t.teamId} className="hover:bg-slate-800/40">
                                    <td className="py-2 px-3 font-bold text-amber-400">
                                      #{t.placement}
                                    </td>
                                    <td className="py-2 px-3 font-semibold text-white">
                                      {t.teamName}
                                    </td>
                                    <td className="py-2 px-2 text-center text-slate-300">
                                      {t.placementPoints}
                                    </td>
                                    <td className="py-2 px-2 text-center text-slate-300">
                                      {t.kills}
                                    </td>
                                    <td className="py-2 px-3 text-right font-extrabold text-blue-400 font-mono">
                                      +{t.matchPoints}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Approval Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                        <div className="text-[11px] text-slate-400">
                          {isPending
                            ? "Review the reported proof and points above. Approving will update team standings live on the dashboard."
                            : isApproved
                            ? `Published live on ${sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleString() : "tournament dashboard"}.`
                            : "This submission was rejected and will not affect standings."}
                          {reviewingId === sub.id && actionErrorMsg && (
                            <div className="text-red-400 font-bold mt-1 text-xs">
                              ⚠️ {actionErrorMsg}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => setRejectionModalSub(sub)}
                                disabled={isProcessing}
                                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>

                              <button
                                onClick={() => handleApproveSubmission(sub.id)}
                                disabled={isProcessing}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                              >
                                {isProcessing && reviewAction === "APPROVE" ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Publishing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Approve & Publish to Dashboard</span>
                                  </>
                                )}
                              </button>
                            </>
                          )}

                          {!isPending && (
                            <button
                              onClick={() => handleApproveSubmission(sub.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                            >
                              Re-Publish / Sync Standings
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: DIRECT SCORING ENGINE (BY SUPER ADMIN)        */}
        {/* ---------------------------------------------------- */}
        {mainTab === "direct" && (
          <div className="space-y-6">
            {/* Game Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span>Direct Super Admin Scoring (Auto-Approved)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Scores entered here bypass the review queue and publish directly to the live broadcast dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {[
                  { id: "FREE_FIRE" as GameId, label: "Free Fire", icon: Flame, color: "text-orange-400" },
                  { id: "BGMI" as GameId, label: "BGMI", icon: Crosshair, color: "text-amber-400" },
                  { id: "VALORANT" as GameId, label: "Valorant", icon: Target, color: "text-red-400" },
                  { id: "EFOOTBALL" as GameId, label: "eFootball", icon: Gamepad2, color: "text-emerald-400" },
                  { id: "MATIKS" as GameId, label: "MATIKS", icon: Brain, color: "text-purple-400" },
                ].map((g) => {
                  const Icon = g.icon;
                  const isActive = directGame === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setDirectGame(g.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                        isActive
                          ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${g.color}`} />
                      <span>{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Form Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Teams Table */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {directGame} Team Roster ({teams.length} Squads)
                  </h3>

                  <button
                    onClick={handleAutoFillPlacements}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
                  >
                    Auto-Fill (1 to {teams.length})
                  </button>
                </div>

                {isLoadingTeams ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 px-3">Team (Rank Ordered)</th>
                          <th className="py-2.5 px-2 text-center w-28">Match Rank</th>
                          <th className="py-2.5 px-2 text-center w-24">
                            {directGame === "EFOOTBALL" ? "Goals" : directGame === "MATIKS" ? "Bonus Pts" : "Kills"}
                          </th>
                          <th className="py-2.5 px-3 text-right">Points</th>
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
                )}
              </div>

              {/* Match Details & Upload */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Match Details
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Match Number</label>
                  <input
                    type="number"
                    min="1"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                  />
                </div>

                {/* Proof screenshot */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Proof Screenshot <span className="text-red-400">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-400" />
                    ) : directProofUrl ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                        <span className="text-xs text-emerald-400 font-bold block">Screenshot Attached</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                        <span className="text-xs text-slate-300 font-semibold block">Click to upload screenshot</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={directNotes}
                    onChange={(e) => setDirectNotes(e.target.value)}
                    placeholder="Optional match notes..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white resize-none"
                  />
                </div>

                {directError && (
                  <p className="text-xs text-red-400">{directError}</p>
                )}

                {directSuccess && (
                  <p className="text-xs text-emerald-400 font-bold">Match results published live!</p>
                )}

                <button
                  onClick={handleSubmitDirect}
                  disabled={isSubmittingDirect || isLoadingTeams}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingDirect ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Publish Match {matchNumber} Standings</span>
                </button>

                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setResetModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset {directGame} Standings to 0</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ROSTER MANAGEMENT (ADD, REMOVE, EDIT TEAM)    */}
        {/* ---------------------------------------------------- */}
        {mainTab === "teams" && (
          <div className="space-y-6">
            {/* Header & Game Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Tournament Teams & Roster Manager</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add new squads, rename existing teams, or remove participants across all 5 official arenas. Changes sync immediately to Supabase and the live leaderboard.
                  </p>
                </div>

                <button
                  onClick={() => fetchRoster(rosterGame)}
                  disabled={isLoadingRoster}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRoster ? "animate-spin text-purple-400" : ""}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {/* Game Selector Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { id: "FREE_FIRE" as GameId, label: "Free Fire", icon: Flame, color: "text-amber-500" },
                  { id: "BGMI" as GameId, label: "BGMI", icon: Crosshair, color: "text-blue-500" },
                  { id: "VALORANT" as GameId, label: "Valorant", icon: Target, color: "text-rose-500" },
                  { id: "EFOOTBALL" as GameId, label: "eFootball", icon: Gamepad2, color: "text-emerald-500" },
                  { id: "MATIKS" as GameId, label: "MATIKS", icon: Brain, color: "text-purple-500" },
                ].map((g) => {
                  const Icon = g.icon;
                  const isSelected = rosterGame === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setRosterGame(g.id);
                        setEditingTeamId(null);
                        setRosterSuccess("");
                        setRosterError("");
                      }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                        isSelected
                          ? `bg-purple-600/10 border-purple-500 text-white shadow-md`
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${g.color}`} />
                      <span>{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notifications */}
            {rosterSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{rosterSuccess}</span>
                </div>
                <button onClick={() => setRosterSuccess("")} className="text-emerald-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {rosterError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{rosterError}</span>
                </div>
                <button onClick={() => setRosterError("")} className="text-red-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Add Team Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Add New Team to {rosterGame}</span>
              </h3>
              <form onSubmit={handleAddTeam} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder={`Enter team or player name for ${rosterGame} (e.g. 'GodLike Kudla')`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingTeam || !newTeamName.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                >
                  {isAddingTeam ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Add Team to Roster</span>
                </button>
              </form>
            </div>

            {/* Teams Roster List Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {rosterGame} Registered Roster
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {rosterTeams.length} Teams
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Click 'Edit' to rename a team inline • 'Remove' to delete
                </span>
              </div>

              {isLoadingRoster ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
                  <p className="text-xs text-slate-400">Loading roster...</p>
                </div>
              ) : rosterTeams.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No teams registered yet for {rosterGame}.</p>
                  <p className="text-xs text-slate-500">Use the form above to add the first team.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Team / Player Name</th>
                        <th className="py-3 px-4 text-center">Matches</th>
                        <th className="py-3 px-4 text-center">Total Points</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rosterTeams.map((t, idx) => {
                        const isEditing = editingTeamId === t.id;
                        return (
                          <tr key={t.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                              {idx + 1}
                            </td>

                            <td className="py-3 px-4">
                              {isEditing ? (
                                <div className="flex items-center gap-2 max-w-md">
                                  <input
                                    type="text"
                                    value={editingTeamName}
                                    onChange={(e) => setEditingTeamName(e.target.value)}
                                    autoFocus
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-purple-500 text-xs text-white focus:outline-none"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveEdit(t.id);
                                      if (e.key === "Escape") handleCancelEdit();
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveEdit(t.id)}
                                    disabled={isSavingEdit || !editingTeamName.trim()}
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                                    title="Save Name"
                                  >
                                    {isSavingEdit ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">
                                    {t.teamName}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    ({t.id})
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center font-mono text-slate-300">
                              {t.matchesPlayed}
                            </td>

                            <td className="py-3 px-4 text-center font-mono font-bold text-purple-400">
                              {t.totalPoints}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {!isEditing && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleStartEdit(t)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold"
                                    title="Rename Team"
                                  >
                                    <Pencil className="w-3 h-3 text-purple-400" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handleRemoveTeam(t)}
                                    disabled={deletingTeamId === t.id}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition text-xs font-semibold disabled:opacity-50"
                                    title="Remove Team from Roster"
                                  >
                                    {deletingTeamId === t.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                    <span>Remove</span>
                                  </button>
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
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: HIGH-RES PROOF LIGHTBOX                    */}
      {/* ---------------------------------------------------- */}
      {activeProofModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-emerald-400" />
                <span>Match Verification Screenshot Proof</span>
              </span>
              <button
                onClick={() => setActiveProofModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img
                src={activeProofModal}
                alt="Full Proof"
                className="max-h-[75vh] w-auto rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: REJECTION REASON PROMPT                    */}
      {/* ---------------------------------------------------- */}
      {rejectionModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <Ban className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">
                Reject Match #{rejectionModalSub.matchNumber} ({rejectionModalSub.gameId})?
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Please provide a reason for rejecting this submission. The POC will see this note and can resubmit with corrected points or screenshot.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Screenshot blurry, kill counts do not match official lobby results"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-red-500 outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectionModalSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: RESET GAME SCORES CONFIRMATION             */}
      {/* ---------------------------------------------------- */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <RotateCcw className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Reset {directGame} Standings?</h3>
            </div>
            <p className="text-xs text-slate-300">
              This will reset all team points and match counts back to <strong>0</strong> for <strong>{directGame}</strong>.
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
