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
  Minus,
  GripVertical,
  Camera,
  Crown,
  ArrowLeftRight,
  Trash2,
  Pencil,
  Sparkles,
  Key,
  Copy,
} from "lucide-react";
import { AccessShell, WorkspaceIntro } from "@/components/operations/access-shell";
import { GameId } from "@/types";
import {
  PLACEMENT_POINTS,
  getFreeFireGroupInfo,
  CAMPUSES_REGISTRY,
  SUPER_ADMIN_CODE,
} from "@/lib/tournament-constants";
import { SpecialAwardsCard } from "@/components/games/special-awards-card";

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

const SUPER_CODE = "CLUTCH-SUPER-2026";

export default function SuperAdminPortalPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Main UI Mode
  const [mainTab, setMainTab] = useState<"inbox" | "direct" | "history" | "teams" | "awards" | "passkeys">("inbox");
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Multi-Campus State & Controls
  const [selectedCampus, setSelectedCampus] = useState<string>("mangalore");
  const [campusLocks, setCampusLocks] = useState<Record<string, boolean>>({
    mangalore: true,
    kanyakumari: false,
    coimbatore: false,
    bangalore: false,
  });
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Passkeys & Game UIDs Editor State
  const [editingCampusAdminKey, setEditingCampusAdminKey] = useState<string>("");
  const [editingGameKeys, setEditingGameKeys] = useState<Record<GameId, string>>({
    FREE_FIRE: "",
    BGMI: "",
    VALORANT: "",
    EFOOTBALL: "",
    MATIKS: "",
  });
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);
  const [isSavingPasskeys, setIsSavingPasskeys] = useState(false);
  const [isRegeneratingPasskeys, setIsRegeneratingPasskeys] = useState(false);
  const [passkeysSuccessMsg, setPasskeysSuccessMsg] = useState("");
  const [passkeysErrorMsg, setPasskeysErrorMsg] = useState("");
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // Special Awards State (Winner, Runner-up, MVP & Top Fragger)
  const [awardsGame, setAwardsGame] = useState<GameId>("FREE_FIRE");
  const [adminWinnerTeam, setAdminWinnerTeam] = useState("");
  const [adminWinnerScore, setAdminWinnerScore] = useState("");
  const [adminRunnerUpTeam, setAdminRunnerUpTeam] = useState("");
  const [adminRunnerUpScore, setAdminRunnerUpScore] = useState("");
  const [adminMvpName, setAdminMvpName] = useState("");
  const [adminMvpTeam, setAdminMvpTeam] = useState("");
  const [adminMvpStats, setAdminMvpStats] = useState("");
  const [adminTopFraggerName, setAdminTopFraggerName] = useState("");
  const [adminTopFraggerTeam, setAdminTopFraggerTeam] = useState("");
  const [adminTopFraggerKills, setAdminTopFraggerKills] = useState<number | string>("");
  const [isLoadingAwards, setIsLoadingAwards] = useState(false);
  const [isSavingAwards, setIsSavingAwards] = useState(false);
  const [awardsSuccessMsg, setAwardsSuccessMsg] = useState("");
  const [awardsErrorMsg, setAwardsErrorMsg] = useState("");

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
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | "UNDO" | "DELETE" | null>(null);
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
  const [directOrderedTeamIds, setDirectOrderedTeamIds] = useState<string[]>([]);
  const [directDraggedIndex, setDirectDraggedIndex] = useState<number | null>(null);
  const [directDragOverIndex, setDirectDragOverIndex] = useState<number | null>(null);
  const [swapTeamId, setSwapTeamId] = useState<string | null>(null);
  const [swapNotice, setSwapNotice] = useState<string>("");
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null);
  const [directGroupFilter, setDirectGroupFilter] = useState<"ALL" | "A" | "B" | "QUALIFIED">("ALL");
  const [rosterGroupFilter, setRosterGroupFilter] = useState<"ALL" | "A" | "B" | "QUALIFIED">("ALL");

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

  // Campus Lock & Access Helpers
  const fetchCampusLocks = async () => {
    try {
      const res = await fetch(`/api/poc/campus-lock?t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.locks) {
        setCampusLocks(data.locks);
      }
    } catch {}
  };

  const handleToggleLock = async (campusId: string) => {
    const current = !!campusLocks[campusId];
    const newLock = !current;
    setIsTogglingLock(true);
    try {
      const res = await fetch("/api/poc/campus-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campusId,
          isLocked: newLock,
          adminPassword,
          pocCode: SUPER_CODE,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampusLocks((prev) => ({ ...prev, [campusId]: newLock }));
      } else {
        alert(data.error || "Failed to update lock");
      }
    } catch {
      alert("Network error updating campus lock");
    } finally {
      setIsTogglingLock(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Fetch passkeys for chosen campus
  const fetchCampusPasskeys = async (campusId: string = selectedCampus) => {
    setIsLoadingPasskeys(true);
    setPasskeysErrorMsg("");
    try {
      const res = await fetch(`/api/poc/campus-keys?campusId=${campusId}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.passkeys) {
        setEditingCampusAdminKey(data.passkeys.campusAdminKey || "");
        setEditingGameKeys({
          FREE_FIRE: data.passkeys.gameKeys?.FREE_FIRE || "",
          BGMI: data.passkeys.gameKeys?.BGMI || "",
          VALORANT: data.passkeys.gameKeys?.VALORANT || "",
          EFOOTBALL: data.passkeys.gameKeys?.EFOOTBALL || "",
          MATIKS: data.passkeys.gameKeys?.MATIKS || "",
        });
      }
    } catch {
      setPasskeysErrorMsg("Failed to load campus passkeys.");
    } finally {
      setIsLoadingPasskeys(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (mainTab === "passkeys" || showKeysModal)) {
      fetchCampusPasskeys(selectedCampus);
    }
  }, [isAuthenticated, mainTab, selectedCampus, showKeysModal]);

  // Save customized passkeys and game UIDs
  const handleSavePasskeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPasskeys(true);
    setPasskeysSuccessMsg("");
    setPasskeysErrorMsg("");

    const uids = new Set<string>();
    const games: GameId[] = ["FREE_FIRE", "BGMI", "VALORANT", "EFOOTBALL", "MATIKS"];
    for (const g of games) {
      const val = (editingGameKeys[g] || "").trim().toUpperCase();
      if (!val) {
        setPasskeysErrorMsg(`Please enter a valid UID for ${g}.`);
        setIsSavingPasskeys(false);
        return;
      }
      if (uids.has(val)) {
        setPasskeysErrorMsg(`Each game must have a DIFFERENT unique UID! Duplicate found: "${val}"`);
        setIsSavingPasskeys(false);
        return;
      }
      uids.add(val);
    }

    try {
      const res = await fetch("/api/poc/campus-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campusId: selectedCampus,
          adminPassword,
          pocCode: SUPER_CODE,
          passkeys: {
            campusAdminKey: editingCampusAdminKey.trim().toUpperCase(),
            gameKeys: {
              FREE_FIRE: editingGameKeys.FREE_FIRE.trim().toUpperCase(),
              BGMI: editingGameKeys.BGMI.trim().toUpperCase(),
              VALORANT: editingGameKeys.VALORANT.trim().toUpperCase(),
              EFOOTBALL: editingGameKeys.EFOOTBALL.trim().toUpperCase(),
              MATIKS: editingGameKeys.MATIKS.trim().toUpperCase(),
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save passkeys.");
      }

      setPasskeysSuccessMsg(`Passkeys & unique game UIDs for ${CAMPUSES_REGISTRY[selectedCampus]?.name || selectedCampus} saved successfully!`);
      setTimeout(() => setPasskeysSuccessMsg(""), 4500);
    } catch (err: any) {
      setPasskeysErrorMsg(err.message || "Failed to save passkeys.");
    } finally {
      setIsSavingPasskeys(false);
    }
  };

  // Regenerate random unique UIDs for all games
  const handleRegeneratePasskeys = async () => {
    if (!confirm(`Generate new random unique UIDs for ${CAMPUSES_REGISTRY[selectedCampus]?.name || selectedCampus}? Previous game UIDs for this campus will be updated.`)) {
      return;
    }
    setIsRegeneratingPasskeys(true);
    setPasskeysSuccessMsg("");
    setPasskeysErrorMsg("");
    try {
      const res = await fetch("/api/poc/campus-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campusId: selectedCampus,
          adminPassword,
          pocCode: SUPER_CODE,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to regenerate UIDs.");
      }

      if (data.passkeys) {
        setEditingCampusAdminKey(data.passkeys.campusAdminKey || "");
        setEditingGameKeys({
          FREE_FIRE: data.passkeys.gameKeys?.FREE_FIRE || "",
          BGMI: data.passkeys.gameKeys?.BGMI || "",
          VALORANT: data.passkeys.gameKeys?.VALORANT || "",
          EFOOTBALL: data.passkeys.gameKeys?.EFOOTBALL || "",
          MATIKS: data.passkeys.gameKeys?.MATIKS || "",
        });
      }

      setPasskeysSuccessMsg("Fresh unique UIDs generated and saved for all games!");
      setTimeout(() => setPasskeysSuccessMsg(""), 4500);
    } catch (err: any) {
      setPasskeysErrorMsg(err.message || "Error generating UIDs.");
    } finally {
      setIsRegeneratingPasskeys(false);
    }
  };

  // Copy Pre-Formatted WhatsApp / Discord Broadcast Brief
  const handleCopyBroadcast = () => {
    const campus = CAMPUSES_REGISTRY[selectedCampus];
    const text = `🏆 CLUTCH 2026 ESPORTS — ${campus?.name?.toUpperCase() || selectedCampus.toUpperCase()} ACCESS PASSKEYS
University: ${campus?.university || ""}
Official Verification Portal: https://clutch.niat.me/poc

🔑 CAMPUS MASTER PASSKEY (All Games):
${editingCampusAdminKey}

🎮 DEDICATED GAME POC UIDS:
• Free Fire UID: ${editingGameKeys.FREE_FIRE}
• BGMI UID: ${editingGameKeys.BGMI}
• Valorant UID: ${editingGameKeys.VALORANT}
• eFootball UID: ${editingGameKeys.EFOOTBALL}
• MATIKS UID: ${editingGameKeys.MATIKS}

⚠️ Rules:
1. Each Game POC must use their distinct game UID above.
2. Room codes are isolated to this campus.`;

    navigator.clipboard.writeText(text);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 3000);
  };

  // Fetch submissions and game data when authenticated + live auto-polling every 4 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchCampusLocks();
      fetchSubmissions();
      fetchTeamsForDirectGame(directGame, selectedCampus);

      const interval = setInterval(() => {
        fetchSubmissions(true);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, directGame, selectedCampus]);

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
      fetchCampusLocks();
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

  // Fetch all POC submissions for the selected campus
  const fetchSubmissions = async (isBackground = false) => {
    if (!isBackground) setIsLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/poc/submissions?campusId=${selectedCampus}&t=${Date.now()}`, {
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

  // Fetch Teams for direct scoring (always includes all teams for Super Admin)
  const fetchTeamsForDirectGame = async (gameId: GameId, campusId: string = selectedCampus) => {
    setIsLoadingTeams(true);
    try {
      const res = await fetch(`/api/poc/teams?gameId=${gameId}&campusId=${campusId}&includeHidden=true&t=${Date.now()}`);

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.teams)) {
        setTeams(data.teams);
        setDirectOrderedTeamIds(data.teams.map((t: TeamEntry) => t.id));

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
  const fetchRoster = async (gameId: GameId, campusId: string = selectedCampus) => {
    setIsLoadingRoster(true);
    setRosterError("");
    try {
      const res = await fetch(`/api/poc/teams?gameId=${gameId}&campusId=${campusId}&includeHidden=true&t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
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
      fetchRoster(rosterGame, selectedCampus);
    }
  }, [isAuthenticated, mainTab, rosterGame, selectedCampus]);

  // Special Awards Fetch & Save
  const fetchAdminAwards = async (game: GameId, campusId: string = selectedCampus) => {
    setIsLoadingAwards(true);
    try {
      const res = await fetch(`/api/public/awards?gameId=${game}&campusId=${campusId}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.awards) {
        setAdminWinnerTeam(data.awards.winnerTeam || "");
        setAdminWinnerScore(data.awards.winnerScore || "");
        setAdminRunnerUpTeam(data.awards.runnerUpTeam || "");
        setAdminRunnerUpScore(data.awards.runnerUpScore || "");
        if (data.awards.mvp) {
          setAdminMvpName(data.awards.mvp.playerName || "");
          setAdminMvpTeam(data.awards.mvp.teamName || "");
          setAdminMvpStats(data.awards.mvp.stats || "");
        } else {
          setAdminMvpName("");
          setAdminMvpTeam("");
          setAdminMvpStats("");
        }
        if (data.awards.topFragger) {
          setAdminTopFraggerName(data.awards.topFragger.playerName || "");
          setAdminTopFraggerTeam(data.awards.topFragger.teamName || "");
          setAdminTopFraggerKills(data.awards.topFragger.kills ?? "");
        } else {
          setAdminTopFraggerName("");
          setAdminTopFraggerTeam("");
          setAdminTopFraggerKills("");
        }
      } else {
        setAdminWinnerTeam("");
        setAdminWinnerScore("");
        setAdminRunnerUpTeam("");
        setAdminRunnerUpScore("");
        setAdminMvpName("");
        setAdminMvpTeam("");
        setAdminMvpStats("");
        setAdminTopFraggerName("");
        setAdminTopFraggerTeam("");
        setAdminTopFraggerKills("");
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingAwards(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && mainTab === "awards") {
      fetchAdminAwards(awardsGame, selectedCampus);
    }
  }, [isAuthenticated, mainTab, awardsGame, selectedCampus]);

  const handleSaveAdminAwards = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAwards(true);
    setAwardsSuccessMsg("");
    setAwardsErrorMsg("");

    try {
      const savedPass = typeof window !== "undefined" ? sessionStorage.getItem("clutch_admin_auth") || "" : "";
      const pass = adminPassword || savedPass || "43517-AM";

      const res = await fetch("/api/poc/awards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: awardsGame,
          campusId: selectedCampus,
          adminPassword: pass,
          awards: {
            winnerTeam: adminWinnerTeam.trim(),
            winnerScore: adminWinnerScore.trim(),
            runnerUpTeam: adminRunnerUpTeam.trim(),
            runnerUpScore: adminRunnerUpScore.trim(),
            mvp: {
              playerName: adminMvpName.trim(),
              teamName: adminMvpTeam.trim(),
              stats: adminMvpStats.trim(),
            },
            topFragger: {
              playerName: adminTopFraggerName.trim(),
              teamName: adminTopFraggerTeam.trim(),
              kills: adminTopFraggerKills !== "" ? Number(adminTopFraggerKills) : undefined,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update awards.");
      }

      setAwardsSuccessMsg("Tournament accolades (MVP & Top Fragger) saved & broadcast live!");
      setTimeout(() => setAwardsSuccessMsg(""), 4000);
    } catch (err: any) {
      setAwardsErrorMsg(err.message || "Failed to save awards.");
    } finally {
      setIsSavingAwards(false);
    }
  };

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
          campusId: selectedCampus,
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
          campusId: selectedCampus,
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
          campusId: selectedCampus,
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

  // Toggle Team Visibility (Hide / Unhide with instant optimistic update)
  const handleToggleVisibility = async (teamId: string, gameTarget?: GameId) => {
    const game = gameTarget || rosterGame;
    setTogglingVisibilityId(teamId);
    setRosterError("");
    setRosterSuccess("");

    // Identify current hidden state and calculate target
    const currentTeam = (mainTab === "teams" ? rosterTeams : teams).find((t) => t.id === teamId);
    const targetHidden = currentTeam ? !currentTeam.hidden : true;

    // Instant optimistic update in both states
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, hidden: targetHidden } : t))
    );
    setRosterTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, hidden: targetHidden } : t))
    );

    try {
      const savedPass = typeof window !== "undefined" ? sessionStorage.getItem("clutch_admin_auth") || "" : "";
      const pass = adminPassword || savedPass || "43517-AM";

      const res = await fetch("/api/poc/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game,
          campusId: selectedCampus,
          teamId,
          hidden: targetHidden,
          adminPassword: pass,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback optimistic update
        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, hidden: !targetHidden } : t))
        );
        setRosterTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, hidden: !targetHidden } : t))
        );
        throw new Error(data.error || "Failed to update team visibility.");
      }

      setRosterSuccess(data.message || `Team is now ${targetHidden ? "hidden from public view" : "visible on public view"}.`);

      if (Array.isArray(data.teams)) {
        if (game === directGame) {
          setTeams(data.teams);
          setDirectOrderedTeamIds(data.teams.map((t: TeamEntry) => t.id));
        }
        if (game === rosterGame) {
          setRosterTeams(data.teams);
        }
      }

      setTimeout(() => setRosterSuccess(""), 4000);
    } catch (err: any) {
      setRosterError(err.message || "Error updating team visibility.");
      setTimeout(() => setRosterError(""), 4000);
    } finally {
      setTogglingVisibilityId(null);
    }
  };

  // Toggle Team Qualified (Q mark) for Super Admin
  const handleToggleQualified = async (teamId: string, gameTarget?: GameId) => {
    const game = gameTarget || directGame;
    setTogglingVisibilityId(teamId);

    const currentTeam = (mainTab === "teams" ? rosterTeams : teams).find((t) => t.id === teamId);
    const targetQualified = currentTeam ? !currentTeam.qualified : true;

    // Instant optimistic update
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, qualified: targetQualified } : t))
    );
    setRosterTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, qualified: targetQualified } : t))
    );

    try {
      const savedPass = typeof window !== "undefined" ? sessionStorage.getItem("clutch_admin_auth") || "" : "";
      const pass = adminPassword || savedPass || "43517-AM";

      const res = await fetch("/api/poc/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game,
          campusId: selectedCampus,
          teamId,
          qualified: targetQualified,
          action: "TOGGLE_QUALIFIED",
          adminPassword: pass,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, qualified: !targetQualified } : t))
        );
        setRosterTeams((prev) =>
          prev.map((t) => (t.id === teamId ? { ...t, qualified: !targetQualified } : t))
        );
        throw new Error(data.error || "Failed to update qualified status.");
      }

      setRosterSuccess(data.message || (targetQualified ? `Team marked as QUALIFIED!` : `Team qualification removed.`));
      if (Array.isArray(data.teams)) {
        if (game === directGame) {
          setTeams(data.teams);
        }
        if (game === rosterGame) {
          setRosterTeams(data.teams);
        }
      }
      setTimeout(() => setRosterSuccess(""), 3500);
    } catch (err: any) {
      setRosterError(err.message || "Error updating qualified status.");
      setTimeout(() => setRosterError(""), 3500);
    } finally {
      setTogglingVisibilityId(null);
    }
  };

  // Swap Ranks between two teams
  const handleSwapRanks = (teamAId: string, teamBId: string) => {
    if (teamAId === teamBId) {
      setSwapTeamId(null);
      return;
    }

    const currentOrder = directOrderedTeamIds.length > 0 ? directOrderedTeamIds : teams.map((t) => t.id);
    const idxA = currentOrder.indexOf(teamAId);
    const idxB = currentOrder.indexOf(teamBId);
    if (idxA === -1 || idxB === -1) {
      setSwapTeamId(null);
      return;
    }

    const newOrder = [...currentOrder];
    newOrder[idxA] = teamBId;
    newOrder[idxB] = teamAId;
    setDirectOrderedTeamIds(newOrder);

    // Auto-update placements & points for all teams
    setScores((prev) => {
      const updated = { ...prev };
      newOrder.forEach((tId, idx) => {
        const place = idx + 1;
        const current = updated[tId] || {
          teamId: tId,
          placement: place,
          kills: 0,
          placementPoints: 0,
          matchTotal: 0,
        };
        const pts = calcMatchPoints(place, current.kills, directGame);
        updated[tId] = {
          ...current,
          placement: place,
          placementPoints: pts.placementPoints,
          matchTotal: pts.matchTotal,
        };
      });
      return updated;
    });

    const nameA = teams.find((t) => t.id === teamAId)?.teamName || "Team A";
    const nameB = teams.find((t) => t.id === teamBId)?.teamName || "Team B";
    setSwapNotice(`Swapped ranks of ${nameA} (#${idxB + 1}) and ${nameB} (#${idxA + 1})!`);
    setTimeout(() => setSwapNotice(""), 4000);
    setSwapTeamId(null);
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

  // Super Admin: Undo Approval (Revert to Pending & Subtract Points)
  const handleUndoSubmission = async (submissionId: string) => {
    if (!confirm("Are you sure you want to UNDO this approval? All points will be deducted from team scores and this submission will return to the Pending queue.")) {
      return;
    }

    setReviewingId(submissionId);
    setReviewAction("UNDO");
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/poc/review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          action: "UNDO",
          adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to undo approval.");
      }

      setActionSuccessMsg("Approval UNDONE! Points rolled back from leaderboard and match returned to Pending queue.");
      await fetchSubmissions();
      setTimeout(() => setActionSuccessMsg(""), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error undoing submission.");
    } finally {
      setReviewingId(null);
      setReviewAction(null);
    }
  };

  // Super Admin: Permanently Delete Match Submission
  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY DELETE this match submission? If it was approved, all points will be subtracted from the leaderboard immediately.")) {
      return;
    }

    setReviewingId(submissionId);
    setReviewAction("DELETE");
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/poc/review-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          action: "DELETE",
          adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete submission.");
      }

      setActionSuccessMsg("Match submission permanently deleted and team scores recalculated!");
      await fetchSubmissions();
      setTimeout(() => setActionSuccessMsg(""), 4000);
    } catch (err: any) {
      setActionErrorMsg(err.message || "Error deleting submission.");
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
    const effectiveKills = gameId === "VALORANT" ? 0 : (kills || 0);
    return {
      placementPoints: placePts,
      matchTotal: placePts + effectiveKills,
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

  const reorderDirectTeams = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= directOrderedTeamIds.length ||
      toIndex >= directOrderedTeamIds.length
    ) {
      return;
    }

    const newOrder = [...directOrderedTeamIds];
    const [movedId] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedId);
    setDirectOrderedTeamIds(newOrder);

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
        const pts = calcMatchPoints(place, current.kills, directGame);
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

  const pinDirectToFirst = (teamId: string) => {
    const fromIndex = directOrderedTeamIds.indexOf(teamId);
    if (fromIndex > 0) {
      reorderDirectTeams(fromIndex, 0);
    }
  };

  const moveDirectOneSlot = (teamId: string, direction: "UP" | "DOWN") => {
    const curIdx = directOrderedTeamIds.indexOf(teamId);
    if (curIdx === -1) return;
    const targetIdx = direction === "UP" ? curIdx - 1 : curIdx + 1;
    reorderDirectTeams(curIdx, targetIdx);
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
          campusId: selectedCampus,
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
    return <AccessShell kind="admin">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="text-xs font-bold text-[#48564d] uppercase tracking-wider block">
                Admin password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#69776d] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  id="admin-password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#f7f8f4] border border-[#d1d9ce] text-[#17211e] font-mono text-sm focus:border-emerald-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#69776d] hover:text-[#3f4b43]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
              disabled={isAuthenticating || !adminPassword}
              className="ops-primary w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#17211e] font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Sign in to workspace</span>
                </>
              )}
            </button>
          </form>
    </AccessShell>;
  }

  // ----------------------------------------------------
  // SCREEN 2: AUTHENTICATED SUPER ADMIN CONSOLE
  // ----------------------------------------------------
  return (
    <div className="ops-panel min-h-screen bg-[#f7f8f4] text-[#17211e] flex flex-col font-sans">
      {/* Top Banner & Header */}
      <header className="border-b border-[#dfe4db] bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#d1d9ce] overflow-hidden flex items-center justify-center p-0.5 shrink-0">
              <img src="/images/clutch-logo.jpg" alt="CLUTCH" className="w-full h-full object-contain" />
            </div>
            <Link
              href="/"
              aria-label="Open public dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#69776d] hover:text-[#17211e] transition px-2.5 py-1.5 rounded-lg hover:bg-[#edf0e9]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Live Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-[#edf0e9]" />
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Super admin workspace</span><span className="sm:hidden">Admin</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden w-8 h-8 rounded-lg bg-[#7a1c22] border border-[#d1d9ce] overflow-hidden items-center justify-center p-0.5 shrink-0 sm:flex" title="NIAT">
              <img src="/images/niat-logo.jpg" alt="NIAT" className="w-full h-full object-contain" />
            </div>
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-700 text-xs font-bold animate-pulse flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingCount} Pending Approvals</span>
              </span>
            )}
            <button
              onClick={() => fetchSubmissions(false)}
              className="p-2 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] transition text-xs flex items-center gap-1.5"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <WorkspaceIntro role="Tournament operations" title="Your arena, under control." description="Review match evidence, manage your teams, and publish results with confidence."
          metrics={[{ label: "Awaiting review", value: pendingCount }, { label: "Approved results", value: submissions.filter(s => s.status === "APPROVED").length }, { label: "Campus arenas", value: Object.keys(CAMPUSES_REGISTRY).length }]} />
        {/* Multi-Campus Switcher & Security Command Bar */}
        <div className="bg-white border border-[#dfe4db] rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                  Campus management
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/20">
                  Admin access
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#17211e] flex items-center gap-2 mt-0.5">
                <span>Managing: {CAMPUSES_REGISTRY[selectedCampus]?.name || selectedCampus}</span>
                <span className="text-xs font-semibold text-[#69776d]">({CAMPUSES_REGISTRY[selectedCampus]?.university})</span>
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Campus Passkeys Button */}
              <button
                onClick={() => setShowKeysModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#3f4b43] text-xs font-bold transition flex items-center gap-1.5 border border-[#d1d9ce] shadow-sm"
              >
                <span>🔑</span>
                <span>Campus Passkeys</span>
              </button>

              {/* Campus Lock / Unlock Toggle Button */}
              <button
                disabled={isTogglingLock}
                onClick={() => handleToggleLock(selectedCampus)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm ${
                  campusLocks[selectedCampus]
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-700 hover:bg-amber-500/30"
                    : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/30"
                }`}
                title={
                  campusLocks[selectedCampus]
                    ? "Click to unlock this campus (allow non-super admins to submit scores)"
                    : "Click to lock this campus (freeze tournament and prevent score changes)"
                }
              >
                {isTogglingLock ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : campusLocks[selectedCampus] ? (
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>
                  {campusLocks[selectedCampus] ? "Campus Locked (Read-Only)" : "Campus Open (Accepting Scores)"}
                </span>
                <span className="text-[10px] opacity-75 underline ml-1">Toggle</span>
              </button>
            </div>
          </div>

          {/* Campus Switcher Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#dfe4db]/80">
            {Object.values(CAMPUSES_REGISTRY).map((c) => {
              const isSelected = selectedCampus === c.id;
              const isLocked = !!campusLocks[c.id];
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampus(c.id)}
                  className={`p-3 rounded-2xl text-left transition-all border flex flex-col gap-1 ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-500/60 shadow-lg shadow-none"
                      : "bg-[#f7f8f4]/60 border-[#dfe4db]/80 hover:bg-[#edf0e9]/50 hover:border-[#d1d9ce]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold ${isSelected ? "text-emerald-700" : "text-[#17211e]"}`}>
                      {c.shortName}
                    </span>
                    {isLocked ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#69776d] truncate">{c.university}</span>
                </button>
              );
            })}
          </div>
        </div>

        <nav className="ops-section-nav" aria-label="Admin sections">
          {([
            { id: "inbox", label: "Review queue", icon: Inbox },
            { id: "direct", label: "Score entry", icon: Award },
            { id: "teams", label: "Teams & rosters", icon: Users },
            { id: "awards", label: "Awards", icon: Crown },
            { id: "passkeys", label: "Campus Keys & UIDs", icon: Key },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={mainTab === id} onClick={() => setMainTab(id)}>
              <Icon className="h-4 w-4" />
              {label}
              {id === "inbox" && pendingCount > 0 && (
                <span className="rounded-full bg-[#ff986b] px-2 py-0.5 text-[10px] text-[#17211e]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Global Action Alerts */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="underline flex items-center gap-1 hover:text-emerald-700"
            >
              <span>View Leaderboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {actionErrorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
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
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#dfe4db] rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#69776d]" />
                <span className="text-xs font-bold text-[#48564d]">Filter Submissions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <select
                  aria-label="Filter submissions by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#f7f8f4] border border-[#d1d9ce] text-xs rounded-lg px-2.5 py-1.5 text-[#3f4b43] outline-none"
                >
                  <option value="ALL">All Statuses ({submissions.length})</option>
                  <option value="PENDING">Pending Review ({pendingCount})</option>
                  <option value="APPROVED">Approved ({submissions.filter((s) => s.status === "APPROVED").length})</option>
                  <option value="REJECTED">Rejected ({submissions.filter((s) => s.status === "REJECTED").length})</option>
                </select>

                {/* Game Filter */}
                <select
                  aria-label="Filter submissions by game"
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="bg-[#f7f8f4] border border-[#d1d9ce] text-xs rounded-lg px-2.5 py-1.5 text-[#3f4b43] outline-none"
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
              <div className="py-24 text-center text-[#69776d] space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto" />
                <p className="text-xs">Loading POC submissions pipeline...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="py-20 text-center bg-white border border-[#dfe4db] rounded-2xl p-8 space-y-3">
                <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-[#48564d]">
                  {submissions.length === 0
                    ? "No submissions recorded yet"
                    : `No ${statusFilter === "PENDING" ? "pending" : statusFilter === "APPROVED" ? "approved" : statusFilter === "REJECTED" ? "rejected" : "matching"} submissions`}
                </h3>
                <p className="text-xs text-[#87938a] max-w-sm mx-auto">
                  {submissions.length === 0
                    ? "When POCs enter their game codes and submit match results with proof screenshots, they will appear here awaiting your approval."
                    : `There are ${submissions.length} total submission(s) in other filters or arenas. Switch your status/game filter above to view them.`}
                </p>
                {submissions.length > 0 && (
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setStatusFilter("ALL");
                        setSelectedGameFilter("ALL");
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#3f4b43] text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <Filter className="w-3.5 h-3.5 text-[#69776d]" />
                      <span>View All Submissions ({submissions.length})</span>
                    </button>
                    {submissions.some((s) => s.status === "APPROVED") && (
                      <button
                        onClick={() => {
                          setStatusFilter("APPROVED");
                          setSelectedGameFilter("ALL");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>View Approved ({submissions.filter((s) => s.status === "APPROVED").length})</span>
                      </button>
                    )}
                  </div>
                )}
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
                          ? "bg-white border-amber-500/40 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20"
                          : isApproved
                          ? "bg-white border-emerald-500/30"
                          : "bg-white/60 border-red-500/30 opacity-75"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfe4db] pb-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                              sub.gameId === "FREE_FIRE"
                                ? "bg-orange-500/10 text-orange-700 border border-orange-500/20"
                                : sub.gameId === "BGMI"
                                ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                                : sub.gameId === "VALORANT"
                                ? "bg-rose-500/10 text-rose-700 border border-rose-500/20"
                                : sub.gameId === "EFOOTBALL"
                                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-700 border border-purple-500/20"
                            }`}
                          >
                            {sub.gameId.replace("_", " ")}
                          </span>

                          <span className="text-sm font-black text-[#17211e]">
                            Match #{sub.matchNumber}
                          </span>

                          <span className="text-xs font-mono text-[#69776d]">
                            Verified submission
                          </span>

                          <span className="text-xs text-[#69776d]">
                            {new Date(sub.timestamp).toLocaleTimeString()} • {new Date(sub.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>PENDING APPROVAL</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>APPROVED & PUBLISHED</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-700 border border-red-500/30 flex items-center gap-1.5">
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
                          <label className="text-[11px] font-bold text-[#69776d] uppercase tracking-wider block">
                            Photographic Proof:
                          </label>
                          {sub.proofUrl ? (
                            <div className="relative group rounded-xl overflow-hidden border border-[#d1d9ce] bg-[#f7f8f4]">
                              <img
                                src={sub.proofUrl}
                                alt="Proof Screenshot"
                                className="w-full h-36 object-cover cursor-pointer hover:scale-105 transition duration-200"
                                onClick={() => setActiveProofModal(sub.proofUrl)}
                              />
                              <button
                                onClick={() => setActiveProofModal(sub.proofUrl)}
                                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/95 text-[#17211e] hover:bg-white text-[10px] flex items-center gap-1 font-semibold"
                              >
                                <Maximize2 className="w-3 h-3" />
                                <span>Zoom</span>
                              </button>
                            </div>
                          ) : (
                            <div className="h-36 rounded-xl border border-[#dfe4db] bg-[#f7f8f4] flex flex-col items-center justify-center text-[#87938a] text-xs">
                              <FileImage className="w-6 h-6 mb-1" />
                              <span>No screenshot</span>
                            </div>
                          )}

                          {sub.notes && (
                            <div className="p-2.5 rounded-lg bg-[#f7f8f4] border border-[#dfe4db] text-[11px] text-[#48564d] italic">
                              <span className="font-bold text-[#69776d] not-italic block mb-0.5">POC Notes:</span>
                              &quot;{sub.notes}&quot;
                            </div>
                          )}

                          {isRejected && sub.rejectionReason && (
                            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-700">
                              <span className="font-bold block">Rejection Reason:</span>
                              {sub.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Reported Scores Table */}
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[11px] font-bold text-[#69776d] uppercase tracking-wider flex items-center justify-between">
                            <span>Reported Team Placements & Points:</span>
                            <span className="text-[10px] font-normal text-[#87938a]">
                              ({sub.teamResults.length} participating squads)
                            </span>
                          </label>

                          <div className="max-h-56 overflow-y-auto rounded-xl border border-[#dfe4db] bg-[#f7f8f4]">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-white/80 sticky top-0 border-b border-[#dfe4db] text-[#69776d]">
                                <tr>
                                  <th className="py-2 px-3">Place</th>
                                  <th className="py-2 px-3">Team Name</th>
                                  <th className="py-2 px-2 text-center">Place Pts</th>
                                  {sub.gameId !== "VALORANT" && (
                                    <th className="py-2 px-2 text-center">
                                      {sub.gameId === "EFOOTBALL" ? "Goals" : sub.gameId === "MATIKS" ? "Bonus" : "Kills"}
                                    </th>
                                  )}
                                  <th className="py-2 px-3 text-right">Match Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {sub.teamResults.map((t) => (
                                  <tr key={t.teamId} className="hover:bg-[#edf0e9]/40">
                                    <td className="py-2 px-3 font-bold text-amber-700">
                                      #{t.placement}
                                    </td>
                                    <td className="py-2 px-3 font-semibold text-[#17211e]">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>{t.teamName}</span>
                                        {sub.gameId === "FREE_FIRE" && (() => {
                                          const grp = getFreeFireGroupInfo(t.teamName);
                                          return (
                                            <span
                                              className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${
                                                grp.group === "A"
                                                  ? "bg-blue-500/20 text-blue-700 border-blue-500/40"
                                                  : "bg-purple-500/20 text-purple-700 border-purple-500/40"
                                              }`}
                                            >
                                              {grp.badge}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                    </td>
                                    <td className="py-2 px-2 text-center text-[#48564d]">
                                      {t.placementPoints}
                                    </td>
                                    {sub.gameId !== "VALORANT" && (
                                      <td className="py-2 px-2 text-center text-[#48564d]">
                                        {t.kills}
                                      </td>
                                    )}
                                    <td className="py-2 px-3 text-right font-extrabold text-blue-700 font-mono">
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
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#dfe4db]">
                        <div className="text-[11px] text-[#69776d]">
                          {isPending
                            ? "Review the reported proof and points above. Approving will update team standings live on the dashboard."
                            : isApproved
                            ? `Published live on ${sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleString() : "tournament dashboard"}.`
                            : "This submission was rejected and will not affect standings."}
                          {reviewingId === sub.id && actionErrorMsg && (
                            <div className="text-red-700 font-bold mt-1 text-xs">
                              ⚠️ {actionErrorMsg}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                disabled={isProcessing}
                                className="p-2 rounded-xl bg-[#edf0e9]/80 hover:bg-red-500/20 text-[#69776d] hover:text-red-700 border border-[#d1d9ce]/60 transition disabled:opacity-50"
                                title="Delete Submission"
                              >
                                {isProcessing && reviewAction === "DELETE" ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-red-700" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                onClick={() => setRejectionModalSub(sub)}
                                disabled={isProcessing}
                                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/20 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>

                              <button
                                onClick={() => handleApproveSubmission(sub.id)}
                                disabled={isProcessing}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#17211e] text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
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

                          {isApproved && (
                            <>
                              <button
                                onClick={() => handleUndoSubmission(sub.id)}
                                disabled={isProcessing}
                                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                                title="Revert points and return submission to Pending review"
                              >
                                {isProcessing && reviewAction === "UNDO" ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                )}
                                <span>Undo Approval (Revert)</span>
                              </button>

                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                disabled={isProcessing}
                                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                                title="Permanently delete this match and subtract points from leaderboard"
                              >
                                {isProcessing && reviewAction === "DELETE" ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>Delete Match</span>
                              </button>
                            </>
                          )}

                          {isRejected && (
                            <>
                              <button
                                onClick={() => handleUndoSubmission(sub.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] text-xs font-semibold transition flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3 h-3 text-amber-700" />
                                <span>Re-open as Pending</span>
                              </button>

                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                disabled={isProcessing}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/20 transition text-xs"
                                title="Delete Rejected Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#dfe4db] rounded-2xl p-4">
              <div>
                <h2 className="text-base font-bold text-[#17211e] flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-700" />
                  <span>Direct Super Admin Scoring (Auto-Approved)</span>
                </h2>
                <p className="text-xs text-[#69776d]">
                  Scores entered here bypass the review queue and publish directly to the live broadcast dashboard.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-[#f7f8f4] p-1.5 rounded-xl border border-[#dfe4db]">
                {[
                  { id: "FREE_FIRE" as GameId, label: "Free Fire", icon: Flame, color: "text-orange-700" },
                  { id: "BGMI" as GameId, label: "BGMI", icon: Crosshair, color: "text-amber-700" },
                  { id: "VALORANT" as GameId, label: "Valorant", icon: Target, color: "text-red-700" },
                  { id: "EFOOTBALL" as GameId, label: "eFootball", icon: Gamepad2, color: "text-emerald-700" },
                  { id: "MATIKS" as GameId, label: "MATIKS", icon: Brain, color: "text-purple-700" },
                ].map((g) => {
                  const Icon = g.icon;
                  const isActive = directGame === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setDirectGame(g.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                        isActive
                          ? "bg-[#edf0e9] text-[#17211e] shadow-sm border border-[#d1d9ce]"
                          : "text-[#69776d] hover:text-[#3f4b43]"
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
              <div className="lg:col-span-2 bg-white border border-[#dfe4db] rounded-2xl p-5 shadow-xl space-y-4">
                {/* Swap Mode Notifications */}
                {swapTeamId && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong>Swap Rank Mode Active:</strong> Selected{" "}
                        <strong className="underline text-[#17211e]">
                          {teams.find((t) => t.id === swapTeamId)?.teamName || "Team"}
                        </strong>
                        . Now click &quot;Swap&quot; on any other team to exchange their ranks!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSwapTeamId(null)}
                      className="px-2 py-1 rounded bg-[#edf0e9] hover:bg-[#dfe6db] text-[#17211e] text-[11px] font-bold border border-[#d1d9ce] shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {swapNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{swapNotice}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#dfe4db]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xs font-bold text-[#48564d] uppercase tracking-wider">
                      {directGame} Team Roster ({teams.length} Squads)
                    </h3>

                    {directGame === "FREE_FIRE" && (
                      <>
                        <div className="inline-flex items-center gap-1 bg-[#f7f8f4] p-1 rounded-lg border border-[#dfe4db] text-xs">
                          <button
                            type="button"
                            onClick={() => setDirectGroupFilter("ALL")}
                            className={`px-2.5 py-1 rounded-md transition font-semibold text-xs ${
                              directGroupFilter === "ALL"
                                ? "bg-[#edf0e9] text-[#17211e] shadow-xs font-bold"
                                : "text-[#69776d] hover:text-[#17211e]"
                            }`}
                          >
                            All ({teams.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setDirectGroupFilter("A")}
                            className={`px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5 ${
                              directGroupFilter === "A"
                                ? "bg-blue-600 text-[#17211e] shadow-xs font-bold"
                                : "text-[#69776d] hover:text-blue-700"
                            }`}
                          >
                            <span>Group A</span>
                            <span
                              className={`text-[10px] px-1 py-0.5 rounded font-mono font-bold leading-none ${
                                directGroupFilter === "A" ? "bg-blue-800 text-blue-700" : "bg-blue-50 text-blue-700 border border-blue-800"
                              }`}
                            >
                              LH18
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDirectGroupFilter("B")}
                            className={`px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5 ${
                              directGroupFilter === "B"
                                ? "bg-purple-600 text-[#17211e] shadow-xs font-bold"
                                : "text-[#69776d] hover:text-purple-700"
                            }`}
                          >
                            <span>Group B</span>
                            <span
                              className={`text-[10px] px-1 py-0.5 rounded font-mono font-bold leading-none ${
                                directGroupFilter === "B" ? "bg-purple-800 text-purple-700" : "bg-purple-950 text-purple-700 border border-purple-800"
                              }`}
                            >
                              LH19
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDirectGroupFilter("QUALIFIED")}
                            className={`px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5 ${
                              directGroupFilter === "QUALIFIED"
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

                        <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-500/30 flex items-center gap-1.5 text-xs">
                          <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-bold text-[#17211e] text-[11px]">
                            Qualifiers:{" "}
                            <span className="text-emerald-700 font-mono font-black">
                              {teams.filter((t) => t.qualified).length} / 12
                            </span>{" "}
                            <span className="text-[#69776d] font-normal">
                              (Top 6 Group A + Top 6 Group B)
                            </span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleAutoFillPlacements}
                    className="px-3 py-1 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] border border-[#d1d9ce] text-xs font-semibold"
                  >
                    Auto-Fill (1 to {teams.length})
                  </button>
                </div>

                {isLoadingTeams ? (
                  <div className="py-16 text-center text-[#69776d]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-700" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#dfe4db] text-[#69776d]">
                          <th className="py-2.5 px-3">Team (Rank Ordered)</th>
                          <th className="py-2.5 px-2 text-center w-28">Match Rank</th>
                          {directGame !== "VALORANT" && (
                            <th className="py-2.5 px-2 text-center w-24">
                              {directGame === "EFOOTBALL" ? "Goals" : directGame === "MATIKS" ? "Bonus Pts" : "Kills"}
                            </th>
                          )}
                          <th className="py-2.5 px-3 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(directOrderedTeamIds.length > 0 ? directOrderedTeamIds : teams.map((t) => t.id))
                          .filter((teamId) => {
                            if (directGame === "FREE_FIRE" && directGroupFilter !== "ALL") {
                              const t = teams.find((item) => item.id === teamId);
                              if (t) {
                                if (directGroupFilter === "QUALIFIED") {
                                  if (!t.qualified) return false;
                                } else {
                                  const grp = getFreeFireGroupInfo(t.teamName);
                                  if (grp.group !== directGroupFilter) return false;
                                }
                              }
                            }
                            return true;
                          })
                          .map((teamId) => {
                          const actualIndex = (directOrderedTeamIds.length > 0 ? directOrderedTeamIds : teams.map((t) => t.id)).indexOf(teamId);
                          const t = teams.find((item) => item.id === teamId);
                          if (!t) return null;

                          const sc = scores[teamId] || { placement: actualIndex + 1, kills: 0, placementPoints: 0, matchTotal: 0 };
                          const place = actualIndex + 1;
                          const isFirst = place === 1;
                          const isSecond = place === 2;
                          const isThird = place === 3;
                          const isDragging = directDraggedIndex === actualIndex;
                          const isDragOver = directDragOverIndex === actualIndex;

                          return (
                            <tr
                              key={t.id}
                              draggable
                              onDragStart={(e) => {
                                setDirectDraggedIndex(actualIndex);
                                e.dataTransfer.setData("text/plain", String(actualIndex));
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (directDragOverIndex !== actualIndex) {
                                  setDirectDragOverIndex(actualIndex);
                                }
                              }}
                              onDragLeave={() => {
                                if (directDragOverIndex === actualIndex) {
                                  setDirectDragOverIndex(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (directDraggedIndex !== null && directDraggedIndex !== actualIndex) {
                                  reorderDirectTeams(directDraggedIndex, actualIndex);
                                }
                                setDirectDraggedIndex(null);
                                setDirectDragOverIndex(null);
                              }}
                              onDragEnd={() => {
                                setDirectDraggedIndex(null);
                                setDirectDragOverIndex(null);
                              }}
                              className={`transition select-none ${
                                isDragging
                                  ? "opacity-40 border-blue-500 scale-[0.98] bg-blue-50/20"
                                  : isDragOver
                                  ? "border-blue-400 bg-blue-500/10 shadow-md"
                                  : isFirst
                                  ? "bg-amber-500/10 hover:bg-amber-500/15"
                                  : isSecond
                                  ? "bg-[#edf0e9]/40 hover:bg-[#edf0e9]/60"
                                  : isThird
                                  ? "bg-amber-900/10 hover:bg-amber-900/20"
                                  : "hover:bg-[#edf0e9]/30"
                              }`}
                            >
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  {/* Drag Grip Handle */}
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[#87938a] hover:text-[#48564d] transition"
                                    title="Drag up or down to reorder rank"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border ${
                                      isFirst
                                        ? "bg-amber-500/20 text-amber-700 border-amber-500/40 shadow-sm shadow-amber-500/20"
                                        : isSecond
                                        ? "bg-slate-300/20 text-[#3f4b43] border-slate-400/40"
                                        : isThird
                                        ? "bg-amber-700/20 text-amber-700 border-amber-700/40"
                                        : "bg-[#edf0e9] text-[#69776d] border-[#d1d9ce]"
                                    }`}
                                  >
                                    {isFirst ? "🥇" : isSecond ? "🥈" : isThird ? "🥉" : `#${place}`}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`font-bold text-xs ${t.hidden ? "text-[#69776d] line-through" : "text-[#17211e]"}`}>
                                        {t.teamName}
                                      </span>
                                      {directGame === "FREE_FIRE" && (() => {
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
                                      {t.qualified && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-700 border border-emerald-500/40">
                                          QUALIFIED (Q)
                                        </span>
                                      )}
                                      {t.hidden && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-700 border border-amber-500/40">
                                          HIDDEN
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-[#87938a]">
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
                                    onClick={() => moveDirectOneSlot(t.id, "UP")}
                                    disabled={actualIndex <= 0}
                                    className="p-1 rounded bg-[#edf0e9] hover:bg-[#dfe6db] disabled:opacity-30 text-[#48564d] text-[10px]"
                                    title="Move Rank Up"
                                  >
                                    ▲
                                  </button>

                                  {/* Swap Rank Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!swapTeamId) {
                                        setSwapTeamId(t.id);
                                      } else if (swapTeamId === t.id) {
                                        setSwapTeamId(null);
                                      } else {
                                        handleSwapRanks(swapTeamId, t.id);
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1 ${
                                      swapTeamId === t.id
                                        ? "bg-amber-400 text-slate-950 border-amber-300 font-extrabold animate-pulse"
                                        : swapTeamId
                                        ? "bg-blue-600 text-[#17211e] border-blue-400 hover:bg-blue-500"
                                        : "bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] border-[#d1d9ce]"
                                    }`}
                                    title={
                                      swapTeamId === t.id
                                        ? "Cancel swap"
                                        : swapTeamId
                                        ? "Click to swap rank with selected team"
                                        : "Click to swap this team's rank"
                                    }
                                  >
                                    <ArrowLeftRight className="w-3 h-3" />
                                    <span>{swapTeamId === t.id ? "Selected" : "Swap"}</span>
                                  </button>

                                  {!isFirst && (
                                    <button
                                      type="button"
                                      onClick={() => pinDirectToFirst(t.id)}
                                      className="px-1.5 py-0.5 rounded bg-[#edf0e9] hover:bg-[#dfe6db] text-amber-700 font-bold text-[10px] border border-[#d1d9ce]"
                                      title="Pin to 1st place"
                                    >
                                      #1
                                    </button>
                                  )}

                                  {/* Quick nudge down */}
                                  <button
                                    type="button"
                                    onClick={() => moveDirectOneSlot(t.id, "DOWN")}
                                    disabled={actualIndex >= teams.length - 1}
                                    className="p-1 rounded bg-[#edf0e9] hover:bg-[#dfe6db] disabled:opacity-30 text-[#48564d] text-[10px]"
                                    title="Move Rank Down"
                                  >
                                    ▼
                                  </button>

                                  {/* Hide/Unhide Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleVisibility(t.id, directGame)}
                                    disabled={togglingVisibilityId === t.id}
                                    className={`px-2 py-0.5 rounded border transition flex items-center gap-1 text-[10px] font-bold ${
                                      t.hidden
                                        ? "bg-amber-500/20 text-amber-700 border-amber-500/40 hover:bg-amber-500/30"
                                        : "bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] border-[#d1d9ce]"
                                    }`}
                                    title={t.hidden ? "Unhide team (make visible on public dashboard)" : "Hide team from public dashboard"}
                                  >
                                    {togglingVisibilityId === t.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                                    ) : t.hidden ? (
                                      <>
                                        <Eye className="w-3 h-3 text-amber-700" />
                                        <span>Unhide</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3 h-3 text-[#69776d]" />
                                        <span>Hide</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Free Fire Qualifier Toggle (Q Mark) */}
                                  {directGame === "FREE_FIRE" && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleQualified(t.id, directGame)}
                                      disabled={togglingVisibilityId === t.id}
                                      className={`px-2 py-0.5 rounded border transition flex items-center gap-1 text-[10px] font-bold ${
                                        t.qualified
                                          ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/30 shadow-xs"
                                          : "bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] border-[#d1d9ce]"
                                      }`}
                                      title={
                                        t.qualified
                                          ? "Team is Qualified for Finals! Click to unmark"
                                          : "Click to mark as Qualified for Grand Finals (Q mark)"
                                      }
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                          t.qualified
                                            ? "bg-emerald-400 text-slate-950 font-black"
                                            : "bg-[#dfe6db] text-[#48564d]"
                                        }`}
                                      >
                                        Q
                                      </span>
                                      <span>{t.qualified ? "QUALIFIED" : "Mark Q"}</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {directGame !== "VALORANT" && (
                                <td className="py-2.5 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      aria-label={`Decrease score for ${t.teamName}`}
                                      onClick={() => handleScoreChange(t.id, "kills", Math.max(0, (sc.kills || 0) - 1))}
                                      disabled={(sc.kills || 0) <= 0}
                                      className="w-6 h-6 rounded bg-[#edf0e9] hover:bg-[#dfe6db] disabled:opacity-30 text-[#48564d] font-bold text-xs flex items-center justify-center border border-[#d1d9ce]"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      aria-label={`Score for ${t.teamName}`}
                                  value={sc.kills || 0}
                                      onChange={(e) =>
                                        handleScoreChange(t.id, "kills", parseInt(e.target.value) || 0)
                                      }
                                      className="w-10 px-1 py-0.5 rounded bg-[#f7f8f4] border border-[#d1d9ce] text-[#17211e] text-center font-bold text-xs"
                                    />
                                    <button
                                      type="button"
                                      aria-label={`Increase score for ${t.teamName}`}
                                      onClick={() => handleScoreChange(t.id, "kills", (sc.kills || 0) + 1)}
                                      className="w-6 h-6 rounded bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] font-bold text-xs flex items-center justify-center border border-[#d1d9ce]"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                              )}

                              <td className="py-2.5 px-3 text-right">
                                <div className="font-extrabold text-blue-700 font-mono text-xs">
                                  +{sc.matchTotal}
                                </div>
                                <div className="text-[10px] text-[#87938a] font-mono">
                                  {directGame === "VALORANT"
                                    ? `${sc.placementPoints} pts`
                                    : `(${sc.placementPoints}p + ${sc.kills}k)`}
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
              <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-[#48564d] uppercase tracking-wider border-b border-[#dfe4db] pb-2">
                  Match Details
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#48564d] mb-1">Match Number</label>
                  <input
                    type="number"
                    min="1"
                    aria-label="Match number"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f7f8f4] border border-[#d1d9ce] text-[#17211e] font-bold text-xs"
                  />
                </div>

                {/* Proof screenshot */}
                <div>
                  <label className="block text-xs font-bold text-[#48564d] mb-1">
                    Proof Screenshot <span className="text-red-700">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#d1d9ce] hover:border-slate-500 rounded-xl p-4 text-center cursor-pointer bg-[#f7f8f4]/60"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-700" />
                    ) : directProofUrl ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
                        <span className="text-xs text-emerald-700 font-bold block">Screenshot Attached</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-6 h-6 text-[#69776d] mx-auto" />
                        <span className="text-xs text-[#48564d] font-semibold block">Click to upload screenshot</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#48564d] mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={directNotes}
                    onChange={(e) => setDirectNotes(e.target.value)}
                    placeholder="Optional match notes..."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] resize-none"
                  />
                </div>

                {directError && (
                  <p className="text-xs text-red-700">{directError}</p>
                )}

                {directSuccess && (
                  <p className="text-xs text-emerald-700 font-bold">Match results published live!</p>
                )}

                <button
                  onClick={handleSubmitDirect}
                  disabled={isSubmittingDirect || isLoadingTeams}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-[#17211e] font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingDirect ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Publish Match {matchNumber} Standings</span>
                </button>

                <div className="pt-3 border-t border-[#dfe4db]">
                  <button
                    onClick={() => setResetModalOpen(true)}
                    className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
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
            <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#17211e] flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-700" />
                    <span>Tournament Teams & Roster Manager</span>
                  </h2>
                  <p className="text-xs text-[#69776d] mt-0.5">
                    Add new squads, rename existing teams, or remove participants across all 5 official arenas. Changes sync immediately to Supabase and the live leaderboard.
                  </p>
                </div>

                <button
                  onClick={() => fetchRoster(rosterGame)}
                  disabled={isLoadingRoster}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-xs font-bold text-[#48564d] transition self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRoster ? "animate-spin text-purple-700" : ""}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {/* Game Selector Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {[
                  { id: "FREE_FIRE" as GameId, label: "Free Fire", icon: Flame, color: "text-amber-700" },
                  { id: "BGMI" as GameId, label: "BGMI", icon: Crosshair, color: "text-blue-700" },
                  { id: "VALORANT" as GameId, label: "Valorant", icon: Target, color: "text-rose-700" },
                  { id: "EFOOTBALL" as GameId, label: "eFootball", icon: Gamepad2, color: "text-emerald-700" },
                  { id: "MATIKS" as GameId, label: "MATIKS", icon: Brain, color: "text-purple-700" },
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
                          ? `bg-purple-600/10 border-purple-500 text-[#17211e] shadow-md`
                          : "bg-[#f7f8f4] border-[#dfe4db] text-[#69776d] hover:text-[#17211e] hover:bg-[#edf0e9]/60"
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
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{rosterSuccess}</span>
                </div>
                <button onClick={() => setRosterSuccess("")} className="text-emerald-700 hover:text-[#17211e]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {rosterError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{rosterError}</span>
                </div>
                <button onClick={() => setRosterError("")} className="text-red-700 hover:text-[#17211e]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Add Team Card */}
            <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-[#48564d] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-700" />
                <span>Add New Team to {rosterGame}</span>
              </h3>
              <form onSubmit={handleAddTeam} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder={`Enter team or player name for ${rosterGame} (e.g. 'GodLike Kudla')`}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] placeholder-slate-500 focus:border-purple-500 focus:outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingTeam || !newTeamName.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-[#17211e] font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
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
            <div className="bg-white border border-[#dfe4db] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#dfe4db] flex items-center justify-between bg-[#f7f8f4]/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#17211e] uppercase tracking-wider">
                    {rosterGame} Registered Roster
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-700 border border-purple-500/30">
                    {rosterTeams.length} Teams
                  </span>
                </div>
                <span className="text-[11px] text-[#69776d] hidden sm:inline">
                  Click &apos;Edit&apos; to rename a team inline • &apos;Remove&apos; to delete
                </span>
              </div>

              {/* Free Fire Group & Qualifiers Banner in Roster Manager */}
              {rosterGame === "FREE_FIRE" && (
                <div className="p-3 bg-[#f7f8f4] border-b border-[#dfe4db] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs font-bold text-[#17211e]">
                      Grand Finals Qualifiers:{" "}
                      <span className="text-emerald-700 font-mono text-sm font-black">
                        {rosterTeams.filter((t) => t.qualified).length} / 12
                      </span>{" "}
                      <span className="text-[#69776d] font-normal text-[11px]">
                        (Top 6 Group A + Top 6 Group B)
                      </span>
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 bg-white p-1 rounded-lg border border-[#dfe4db] text-xs">
                    <button
                      type="button"
                      onClick={() => setRosterGroupFilter("ALL")}
                      className={`px-2.5 py-1 rounded-md transition font-semibold text-xs ${
                        rosterGroupFilter === "ALL"
                          ? "bg-[#edf0e9] text-[#17211e] shadow-xs font-bold"
                          : "text-[#69776d] hover:text-[#17211e]"
                      }`}
                    >
                      All ({rosterTeams.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterGroupFilter("A")}
                      className={`px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5 ${
                        rosterGroupFilter === "A"
                          ? "bg-blue-600 text-[#17211e] shadow-xs font-bold"
                          : "text-[#69776d] hover:text-blue-700"
                      }`}
                    >
                      <span>Group A</span>
                      <span className="text-[10px] px-1 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 border border-blue-800">
                        LH18
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterGroupFilter("B")}
                      className={`px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5 ${
                        rosterGroupFilter === "B"
                          ? "bg-purple-600 text-[#17211e] shadow-xs font-bold"
                          : "text-[#69776d] hover:text-purple-700"
                      }`}
                    >
                      <span>Group B</span>
                      <span className="text-[10px] px-1 py-0.5 rounded font-mono font-bold bg-purple-950 text-purple-700 border border-purple-800">
                        LH19
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRosterGroupFilter("QUALIFIED")}
                      className={`px-2.5 py-1 rounded-md transition font-semibold text-xs flex items-center gap-1.5 ${
                        rosterGroupFilter === "QUALIFIED"
                          ? "bg-emerald-600 text-[#17211e] font-bold"
                          : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      <span>⭐ Qualifiers (Q)</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-[10px] font-mono font-bold">
                        {rosterTeams.filter((t) => t.qualified).length}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {isLoadingRoster ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-700 mx-auto" />
                  <p className="text-xs text-[#69776d]">Loading roster...</p>
                </div>
              ) : rosterTeams.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-[#48564d]">No teams registered yet for {rosterGame}.</p>
                  <p className="text-xs text-[#87938a]">Use the form above to add the first team.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#dfe4db] bg-[#f7f8f4] text-[#69776d] font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Team / Player Name</th>
                        <th className="py-3 px-4 text-center">Matches</th>
                        <th className="py-3 px-4 text-center">Total Points</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rosterTeams
                        .filter((t) => {
                          if (rosterGame === "FREE_FIRE" && rosterGroupFilter !== "ALL") {
                            if (rosterGroupFilter === "QUALIFIED") {
                              if (!t.qualified) return false;
                            } else {
                              const grp = getFreeFireGroupInfo(t.teamName);
                              if (grp.group !== rosterGroupFilter) return false;
                            }
                          }
                          return true;
                        })
                        .map((t, idx) => {
                        const isEditing = editingTeamId === t.id;
                        return (
                          <tr key={t.id} className="hover:bg-[#edf0e9]/40 transition">
                            <td className="py-3 px-4 text-center font-mono font-bold text-[#87938a]">
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
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#f7f8f4] border border-purple-500 text-xs text-[#17211e] focus:outline-none"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveEdit(t.id);
                                      if (e.key === "Escape") handleCancelEdit();
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveEdit(t.id)}
                                    disabled={isSavingEdit || !editingTeamName.trim()}
                                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[#17211e] transition disabled:opacity-50"
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
                                    className="p-1.5 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] transition"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-bold text-sm ${t.hidden ? "text-[#69776d] line-through" : "text-[#17211e]"}`}>
                                    {t.teamName}
                                  </span>
                                  {rosterGame === "FREE_FIRE" && (() => {
                                    const grp = getFreeFireGroupInfo(t.teamName);
                                    return (
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                          grp.group === "A"
                                            ? "bg-blue-500/20 text-blue-700 border-blue-500/40"
                                            : "bg-purple-500/20 text-purple-700 border-purple-500/40"
                                        }`}
                                      >
                                        {grp.badge}
                                      </span>
                                    );
                                  })()}
                                  {t.qualified && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-700 border border-emerald-500/40">
                                      ⭐ QUALIFIED (Q)
                                    </span>
                                  )}
                                  {t.hidden && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-700 border border-amber-500/40">
                                      HIDDEN FROM PUBLIC
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-[#87938a]">
                                    ({t.id})
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center font-mono text-[#48564d]">
                              {t.matchesPlayed}
                            </td>

                            <td className="py-3 px-4 text-center font-mono font-bold text-purple-700">
                              {t.totalPoints}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {!isEditing && (
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Free Fire Qualifier Toggle (Q Mark) */}
                                  {rosterGame === "FREE_FIRE" && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleQualified(t.id, rosterGame)}
                                      disabled={togglingVisibilityId === t.id}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                                        t.qualified
                                          ? "bg-emerald-500/20 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/30 shadow-xs"
                                          : "bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] border-[#d1d9ce]"
                                      }`}
                                      title={
                                        t.qualified
                                          ? "Team is Qualified for Finals! Click to unmark"
                                          : "Click to mark as Qualified for Grand Finals (Q mark)"
                                      }
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                          t.qualified
                                            ? "bg-emerald-400 text-slate-950 font-black"
                                            : "bg-[#dfe6db] text-[#48564d]"
                                        }`}
                                      >
                                        Q
                                      </span>
                                      <span>{t.qualified ? "QUALIFIED" : "Mark Q"}</span>
                                    </button>
                                  )}

                                  {/* Toggle Hide / Unhide Button */}
                                  <button
                                    onClick={() => handleToggleVisibility(t.id, rosterGame)}
                                    disabled={togglingVisibilityId === t.id}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                                      t.hidden
                                        ? "bg-amber-500/15 text-amber-700 border-amber-500/40 hover:bg-amber-500/25"
                                        : "bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] hover:text-[#17211e] border-[#d1d9ce]"
                                    }`}
                                    title={t.hidden ? "Unhide team (make visible on public leaderboards)" : "Hide team from public leaderboards"}
                                  >
                                    {togglingVisibilityId === t.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : t.hidden ? (
                                      <Eye className="w-3 h-3 text-amber-700" />
                                    ) : (
                                      <EyeOff className="w-3 h-3 text-[#69776d]" />
                                    )}
                                    <span>{t.hidden ? "Unhide" : "Hide"}</span>
                                  </button>

                                  <button
                                    onClick={() => handleStartEdit(t)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] hover:text-[#17211e] transition text-xs font-semibold"
                                    title="Rename Team"
                                  >
                                    <Pencil className="w-3 h-3 text-purple-700" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => handleRemoveTeam(t)}
                                    disabled={deletingTeamId === t.id}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/20 transition text-xs font-semibold disabled:opacity-50"
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

        {/* ---------------------------------------------------- */}
        {/* TAB 4: SPECIAL AWARDS (MVP & TOP FRAGGER)            */}
        {/* ---------------------------------------------------- */}
        {mainTab === "awards" && (
          <div className="space-y-6">
            {/* Header & Game Selector */}
            <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#17211e] flex items-center gap-2">
                      <span>Tournament Special Awards & Accolades</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold border border-amber-500/30">
                        OFFICIAL RATIFIED
                      </span>
                    </h2>
                    <p className="text-xs text-[#69776d]">
                      Configure official accolades (Tournament MVP & Top Fragger) broadcasted live on the public dashboard, game pages, and winners podium.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => fetchAdminAwards(awardsGame)}
                  disabled={isLoadingAwards}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#48564d] text-xs font-semibold transition shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAwards ? "animate-spin" : ""}`} />
                  <span>Reload Awards</span>
                </button>
              </div>

              {/* Game Filter */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#dfe4db]/80">
                <span className="text-xs font-semibold text-[#69776d] mr-2">Select Arena:</span>
                {(
                  [
                    { id: "FREE_FIRE" as GameId, name: "Free Fire (Grand Finals)", icon: Flame },
                    { id: "BGMI" as GameId, name: "BGMI", icon: Crosshair },
                    { id: "VALORANT" as GameId, name: "eFootball / Valorant", icon: Gamepad2 },
                    { id: "CHESS" as GameId, name: "Matiks / Chess", icon: Brain },
                  ] as const
                ).map(({ id, name, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setAwardsGame(id);
                      fetchAdminAwards(id);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      awardsGame === id
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "bg-[#f7f8f4] text-[#69776d] hover:text-[#17211e] border border-[#dfe4db]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Alerts */}
            {awardsSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>{awardsSuccessMsg}</span>
              </div>
            )}

            {awardsErrorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{awardsErrorMsg}</span>
              </div>
            )}

            {/* Awards Edit Form */}
            <form onSubmit={handleSaveAdminAwards} className="bg-white border border-[#dfe4db] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. 1st Place Champion (Winner Cup) */}
                <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <Trophy className="w-4 h-4" />
                      <span>1st PLACE CHAMPION (WINNER CUP)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-extrabold">
                      🏆 GOLD TROPHY
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Champion Squad / Team Name
                    </label>
                    <input
                      type="text"
                      value={adminWinnerTeam}
                      onChange={(e) => setAdminWinnerTeam(e.target.value)}
                      placeholder="e.g. TOTAL DOMINANCE"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Championship Score / Subtext (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminWinnerScore}
                      onChange={(e) => setAdminWinnerScore(e.target.value)}
                      placeholder="e.g. 52 Pts • 2 Booyahs"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* 2. 2nd Place Runner-Up (Runner-Up Cup) */}
                <div className="p-5 rounded-2xl border border-[#b8c4b4]/40 bg-[#edf0e9]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#48564d]">
                      <Award className="w-4 h-4 text-[#69776d]" />
                      <span>2nd PLACE (RUNNER-UP CUP)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#dfe6db]/50 text-[#48564d] font-extrabold">
                      🥈 SILVER TROPHY
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Runner-Up Squad / Team Name
                    </label>
                    <input
                      type="text"
                      value={adminRunnerUpTeam}
                      onChange={(e) => setAdminRunnerUpTeam(e.target.value)}
                      placeholder="e.g. BROTHERHOOD"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-slate-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Runner-Up Score / Subtext (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminRunnerUpScore}
                      onChange={(e) => setAdminRunnerUpScore(e.target.value)}
                      placeholder="e.g. 46 Pts • 1 Booyah"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-slate-400 outline-none"
                    />
                  </div>
                </div>

                {/* 3. Tournament MVP */}
                <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <Crown className="w-4 h-4" />
                      <span>TOURNAMENT MVP (MOST VALUABLE PLAYER)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 font-extrabold">
                      TOP IMPACT
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Player Name / In-Game Name (IGN)
                    </label>
                    <input
                      type="text"
                      value={adminMvpName}
                      onChange={(e) => setAdminMvpName(e.target.value)}
                      placeholder="e.g. VIPER_YT / Rahul"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Team / Squad Name
                    </label>
                    <input
                      type="text"
                      value={adminMvpTeam}
                      onChange={(e) => setAdminMvpTeam(e.target.value)}
                      placeholder="e.g. TOTAL DOMINANCE"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Accolade Highlights / Performance Stat
                    </label>
                    <input
                      type="text"
                      value={adminMvpStats}
                      onChange={(e) => setAdminMvpStats(e.target.value)}
                      placeholder="e.g. 14 Kills • 2 Booyahs • 1v3 Grand Finals Clutch"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* 4. Top Fragger */}
                <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                      <Crosshair className="w-4 h-4" />
                      <span>TOP FRAGGER (HIGHEST INDIVIDUAL KILLS)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-700 font-extrabold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-700" />
                      KILL LEADER
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Player Name / In-Game Name (IGN)
                    </label>
                    <input
                      type="text"
                      value={adminTopFraggerName}
                      onChange={(e) => setAdminTopFraggerName(e.target.value)}
                      placeholder="e.g. DEADSHOT_99 / Amit"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-red-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Team / Squad Name
                    </label>
                    <input
                      type="text"
                      value={adminTopFraggerTeam}
                      onChange={(e) => setAdminTopFraggerTeam(e.target.value)}
                      placeholder="e.g. DEADLY SINS"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-red-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48564d] mb-1.5">
                      Total Confirmed Individual Kills
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={adminTopFraggerKills}
                      onChange={(e) => setAdminTopFraggerKills(e.target.value)}
                      placeholder="e.g. 19"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] text-sm text-[#17211e] placeholder-slate-600 focus:border-red-400 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#dfe4db]">
                <button
                  type="button"
                  onClick={() => {
                    setAdminWinnerTeam("");
                    setAdminWinnerScore("");
                    setAdminRunnerUpTeam("");
                    setAdminRunnerUpScore("");
                    setAdminMvpName("");
                    setAdminMvpTeam("");
                    setAdminMvpStats("");
                    setAdminTopFraggerName("");
                    setAdminTopFraggerTeam("");
                    setAdminTopFraggerKills("");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] text-xs font-semibold transition"
                >
                  Clear Form Fields
                </button>

                <button
                  type="submit"
                  disabled={isSavingAwards}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingAwards ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Broadcasting Awards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save & Broadcast Awards Live</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Broadcast Preview Card */}
            <div className="bg-white border border-[#dfe4db] rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#dfe4db] pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-700" />
                  <h3 className="text-xs font-bold text-[#17211e] uppercase tracking-wider">
                    Live Broadcast Preview (Public Dashboard Display)
                  </h3>
                </div>
                <span className="text-[10px] text-[#69776d]">
                  Updates instantly as you type
                </span>
              </div>

              <div className="bg-[#f7f8f4] rounded-xl p-4 border border-[#dfe4db]/80">
                <SpecialAwardsCard
                  awards={{
                    winnerTeam: adminWinnerTeam,
                    winnerScore: adminWinnerScore,
                    runnerUpTeam: adminRunnerUpTeam,
                    runnerUpScore: adminRunnerUpScore,
                    mvp: {
                      playerName: adminMvpName,
                      teamName: adminMvpTeam,
                      stats: adminMvpStats,
                    },
                    topFragger: {
                      playerName: adminTopFraggerName,
                      teamName: adminTopFraggerTeam,
                      kills: adminTopFraggerKills !== "" ? Number(adminTopFraggerKills) : undefined,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: CAMPUS PASSKEYS & GAME UIDs MANAGEMENT       */}
        {/* ==================================================== */}
        {mainTab === "passkeys" && (
          <div className="space-y-6">
            {/* Campus Selector Bar */}
            <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#dfe4db]">
                <div>
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-600" />
                    <h2 className="text-base font-bold text-[#17211e]">
                      Campus Access & Game UID Generator
                    </h2>
                  </div>
                  <p className="text-xs text-[#69776d] mt-1">
                    Select a campus below to manage its master passkey and generate distinct unique UIDs for each game coordinator.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchCampusPasskeys(selectedCampus)}
                    disabled={isLoadingPasskeys}
                    className="px-3 py-1.5 rounded-xl border border-[#dfe4db] bg-[#f7f8f4] hover:bg-[#edf0e9] text-xs font-semibold text-[#48564d] flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPasskeys ? "animate-spin" : ""}`} />
                    <span>Reload Keys</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyBroadcast}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    {copiedBroadcast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBroadcast ? "Copied Broadcast!" : "Copy Broadcast Message"}</span>
                  </button>
                </div>
              </div>

              {/* Campus Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {Object.values(CAMPUSES_REGISTRY).map((camp) => {
                  const isSelected = selectedCampus === camp.id;
                  const isConcluded = camp.status === "CONCLUDED";
                  return (
                    <button
                      key={camp.id}
                      type="button"
                      onClick={() => {
                        setSelectedCampus(camp.id);
                        fetchCampusPasskeys(camp.id);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 shadow-sm"
                          : "bg-[#f7f8f4] border-[#dfe4db] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold ${isSelected ? "text-amber-800" : "text-[#17211e]"}`}>
                          {camp.name}
                        </span>
                        {isConcluded ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                            Live
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#69776d] line-clamp-1">{camp.university}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification messages */}
            {passkeysSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{passkeysSuccessMsg}</span>
              </div>
            )}
            {passkeysErrorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Ban className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passkeysErrorMsg}</span>
              </div>
            )}

            {/* Keys Editor Form */}
            <form onSubmit={handleSavePasskeys} className="space-y-6">
              {/* Campus Master Passkey Card */}
              <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-[#17211e] uppercase tracking-wider">
                      Campus Admin Master Passkey ({CAMPUSES_REGISTRY[selectedCampus]?.name})
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Omnipotent Campus Access
                  </span>
                </div>
                <p className="text-xs text-[#69776d]">
                  Entering this key at <code className="px-1.5 py-0.5 rounded bg-[#edf0e9] font-mono text-[11px]">/poc</code> grants access to submit and approve scores for <strong>all 5 games</strong> in {CAMPUSES_REGISTRY[selectedCampus]?.name}.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={editingCampusAdminKey}
                    onChange={(e) => setEditingCampusAdminKey(e.target.value.toUpperCase())}
                    placeholder="e.g. CLT-KY-ADMIN-2026"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#f7f8f4] border border-[#dfe4db] font-mono font-bold text-sm text-[#17211e] focus:border-emerald-500 outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(editingCampusAdminKey, "CAMPUS_ADMIN")}
                    className="px-4 py-2.5 rounded-xl border border-[#dfe4db] bg-[#edf0e9] hover:bg-[#dfe6db] text-xs font-bold text-[#3f4b43] flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedKey === "CAMPUS_ADMIN" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "CAMPUS_ADMIN" ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Game Specific UIDs Cards */}
              <div className="bg-white border border-[#dfe4db] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfe4db] pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#17211e] uppercase tracking-wider flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-amber-600" />
                      Individual Game Coordinator UIDs (Different for Each Game)
                    </h3>
                    <p className="text-xs text-[#69776d] mt-0.5">
                      Each game POC receives a dedicated UID that locks them strictly to their assigned game on this campus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegeneratePasskeys}
                    disabled={isRegeneratingPasskeys}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingPasskeys ? "animate-spin" : ""}`} />
                    <span>Regenerate Random UIDs</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { id: "FREE_FIRE", name: "Free Fire", icon: "🔥", badge: "BR / Squads" },
                    { id: "BGMI", name: "BGMI", icon: "🎯", badge: "BR / Squads" },
                    { id: "VALORANT", name: "Valorant", icon: "⚡", badge: "5v5 Tactical" },
                    { id: "EFOOTBALL", name: "eFootball", icon: "⚽", badge: "1v1 Virtual" },
                    { id: "MATIKS", name: "MATIKS", icon: "🧠", badge: "Math Speed Battle" },
                  ].map((g) => {
                    const gameId = g.id as GameId;
                    const val = editingGameKeys[gameId] || "";
                    return (
                      <div
                        key={g.id}
                        className="p-4 rounded-xl border border-[#dfe4db] bg-[#f7f8f4] space-y-2 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{g.icon}</span>
                            <span className="text-xs font-bold text-[#17211e]">{g.name}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#dfe4db] text-[#48564d] font-semibold">
                            {g.badge}
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#48564d] mb-1">
                            Exclusive {g.name} UID (POC Room Code)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={val}
                              onChange={(e) =>
                                setEditingGameKeys((prev) => ({
                                  ...prev,
                                  [gameId]: e.target.value.toUpperCase(),
                                }))
                              }
                              placeholder={`e.g. CLT-KY-${g.id.slice(0, 2)}-XXXX`}
                              className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#dfe4db] font-mono font-bold text-xs text-[#17211e] focus:border-amber-500 outline-none uppercase"
                            />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(val, g.id)}
                              className="px-3 py-2 rounded-lg border border-[#dfe4db] bg-white hover:bg-[#edf0e9] text-xs font-semibold text-[#3f4b43] flex items-center gap-1 transition shrink-0"
                            >
                              {copiedKey === g.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === g.id ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-[#69776d]">
                          Authenticates directly to: <span className="font-bold text-[#17211e]">{CAMPUSES_REGISTRY[selectedCampus]?.name} — {g.name}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Save Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-[#69776d]">
                  💡 All UIDs are verified against duplicates. Each coordinator gets an isolated workspace.
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyBroadcast}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#dfe4db] bg-[#edf0e9] hover:bg-[#dfe6db] text-xs font-bold text-[#3f4b43] flex items-center justify-center gap-1.5 transition"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy All for Coordinators</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingPasskeys}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPasskeys ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Passkeys...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Passkeys & UIDs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: HIGH-RES PROOF LIGHTBOX                    */}
      {/* ---------------------------------------------------- */}
      {activeProofModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white border border-[#dfe4db] rounded-2xl overflow-hidden p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-[#dfe4db]">
              <span className="text-xs font-bold text-[#17211e] flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-emerald-700" />
                <span>Match Verification Screenshot Proof</span>
              </span>
              <button
                onClick={() => setActiveProofModal(null)}
                className="p-1 rounded-lg hover:bg-[#edf0e9] text-[#69776d] hover:text-[#17211e]"
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
          <div className="bg-white border border-[#dfe4db] rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <Ban className="w-6 h-6" />
              <h3 className="font-bold text-base text-[#17211e]">
                Reject Match #{rejectionModalSub.matchNumber} ({rejectionModalSub.gameId})?
              </h3>
            </div>
            <p className="text-xs text-[#69776d]">
              Please provide a reason for rejecting this submission. The POC will see this note and can resubmit with corrected points or screenshot.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Screenshot blurry, kill counts do not match official lobby results"
              className="w-full px-3 py-2 rounded-xl bg-[#f7f8f4] border border-[#d1d9ce] text-xs text-[#17211e] focus:border-red-500 outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectionModalSub(null)}
                className="px-4 py-2 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-xs font-semibold text-[#48564d]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-[#17211e] flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: CAMPUS PASSKEYS & ACCESS CODES            */}
      {/* ---------------------------------------------------- */}
      {showKeysModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[#dfe4db] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#dfe4db]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <div>
                  <h3 className="text-base font-black text-[#17211e]">Campus & POC Access Passkeys</h3>
                  <p className="text-xs text-[#69776d]">Share each key with its respective campus admin.</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeysModal(false)}
                className="p-1.5 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#69776d] hover:text-[#17211e] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Super Admin Key */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-500/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-emerald-700 uppercase tracking-wider">SUPER ADMIN (YOU)</div>
                  <div className="text-[11px] text-[#69776d]">Master omnipotent key across all campuses</div>
                  <div className="font-mono text-sm font-bold text-[#17211e] mt-1">CLUTCH-SUPER-2026</div>
                </div>
                <button
                  onClick={() => copyToClipboard("CLUTCH-SUPER-2026", "SUPER")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#17211e] text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  {copiedKey === "SUPER" ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{copiedKey === "SUPER" ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Campus Keys */}
              {Object.values(CAMPUSES_REGISTRY).map((camp) => (
                <div key={camp.id} className="p-3.5 rounded-2xl bg-[#f7f8f4]/70 border border-[#dfe4db] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#17211e]">{camp.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#edf0e9] text-[#48564d] border border-[#d1d9ce]">
                        {camp.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#69776d]">{camp.university}</div>
                    <div className="font-mono text-xs font-bold text-amber-700 mt-1">{camp.adminCode}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(camp.adminCode, camp.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#3f4b43] text-xs font-bold transition flex items-center gap-1 border border-[#d1d9ce] shrink-0"
                  >
                    {copiedKey === camp.id ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : null}
                    <span>{copiedKey === camp.id ? "Copied!" : "Copy Key"}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-[#69776d] bg-[#f7f8f4]/60 p-3 rounded-xl border border-[#dfe4db]/80">
              💡 <strong>Isolation Rule:</strong> Campus SPOCs can only see and submit scores for their own campus. When a campus is locked, they cannot modify results.
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowKeysModal(false);
                  setMainTab("passkeys");
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Configure Keys & Game UIDs</span>
              </button>
              <button
                onClick={() => setShowKeysModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#edf0e9] hover:bg-[#dfe6db] text-[#3f4b43] text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
