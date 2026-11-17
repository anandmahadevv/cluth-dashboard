import { GameId } from "@/types";

// Cryptographic SHA-256 Hash for Super Admin Access (zero plaintext stored or exposed)
export const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  "bb9fc06955867332c18b234775cb22982f693e7ad56d430fb550a386840ef9fd";

export type CampusId = "mangalore" | "kanyakumari" | "coimbatore" | "bangalore" | string;

export interface CampusMetadata {
  id: string;
  name: string;
  shortName: string;
  university: string;
  location: string;
  editionDate: string;
  isLocked: boolean;
  adminCode: string;
  status: "LIVE" | "CONCLUDED" | "UPCOMING";
}

export const SUPER_ADMIN_CODE = "CLUTCH-SUPER-2026";

export const CAMPUSES_REGISTRY: Record<string, CampusMetadata> = {
  mangalore: {
    id: "mangalore",
    name: "Mangalore Arena",
    shortName: "Mangalore",
    university: "Yenepoya University",
    location: "Mangalore, Karnataka",
    editionDate: "15 Nov 2026",
    isLocked: true, // Concluded - locked against accidental modification
    adminCode: "MNG-ADMIN-2026",
    status: "CONCLUDED",
  },
  kanyakumari: {
    id: "kanyakumari",
    name: "Kanyakumari Arena",
    shortName: "Kanyakumari",
    university: "NIAT Kanyakumari Campus",
    location: "Kanyakumari, Tamil Nadu",
    editionDate: "Late Nov 2026",
    isLocked: false,
    adminCode: "KY-ADMIN-2026",
    status: "LIVE",
  },
  coimbatore: {
    id: "coimbatore",
    name: "Coimbatore Arena",
    shortName: "Coimbatore",
    university: "NIAT Coimbatore Campus",
    location: "Coimbatore, Tamil Nadu",
    editionDate: "Dec 2026",
    isLocked: false,
    adminCode: "CBE-ADMIN-2026",
    status: "UPCOMING",
  },
  bangalore: {
    id: "bangalore",
    name: "Bangalore Arena",
    shortName: "Bangalore",
    university: "NIAT Bangalore Tech Hub",
    location: "Bangalore, Karnataka",
    editionDate: "Q1 2027",
    isLocked: false,
    adminCode: "BLR-ADMIN-2026",
    status: "UPCOMING",
  },
};

// Official Game & Campus Admin Verification Codes
export const VALID_GAME_CODES: Record<string, GameId | "ALL"> = {
  "CLUTCH-SUPER-2026": "ALL", // Master Super Admin Room Code
  "MNG-ADMIN-2026": "ALL", // Mangalore Admin Code
  "KY-ADMIN-2026": "ALL", // Kanyakumari Admin Code
  "CBE-ADMIN-2026": "ALL", // Coimbatore Admin Code
  "BLR-ADMIN-2026": "ALL", // Bangalore Admin Code
  "CLT-FF-2026X": "FREE_FIRE",
  "CLT-BG-2026X": "BGMI",
  "CLT-VL-2026X": "VALORANT",
  "CLT-EF-2026X": "EFOOTBALL",
  "CLT-FI-2026X": "EFOOTBALL", // Backward compatibility alias
  "CLT-MT-2026X": "MATIKS",
};

// Official Placement Points Rules
export const PLACEMENT_POINTS: Record<GameId, number[]> = {
  FREE_FIRE: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0], // 17 Squads
  BGMI: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  VALORANT: [10, 6, 4, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0], // Placement points
  EFOOTBALL: [10, 6, 4, 2, 1, 1, 1, 1, 0, 0],
  MATIKS: [10, 8, 6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
};

// Initial Seeded Teams at 0 Score (Official Registrations from GSheet)
export const INITIAL_TEAMS: Record<GameId, string[]> = {
  FREE_FIRE: [
    "Khopdi Phodu gng",
    "GLOBEL HUNTERS",
    "AURA RUSHERZ",
    "TAG BOYSS !!",
    "IDFC",
    "TEAM NOX",
    "Zain warriors",
    "BAD SQUAD",
    "BROTHERHOOD",
    "Teamstack",
    "Hunters",
    "DAMN BROS",
    "Gaza",
    "ROCKERS",
    "V4",
    "LAGLORDS",
    "MALNAD WARRIORS",
  ],
  BGMI: [
    "Abdul Badi Syed Kazhi",
    "Mohammed Muzaffer",
    "Tarun Kumar Br",
    "Bexin Kuriakose",
    "Somya Ranjan Parida",
    "Sanmithraj T C",
  ],
  VALORANT: [
    "Vrashab",
    "Nousheen",
    "Larren Tomson Dsouza",
    "Vineeth Dsouza",
    "Abhishek Mohanty",
    "Nishan N",
    "Harsha D",
    "Mahesh R",
    "Srithan",
    "Prem B T",
    "Sanjay D R",
    "Pavan devadig",
    "Shubham Jain",
    "Sharath",
  ],
  EFOOTBALL: [
    "R Pavan Kumar",
    "Mohammed Anoush Yasir",
    "Akhil ahmed",
    "Mohammed zain",
    "MUHAMMED SUFAIL",
    "MUHAMMED FAHIM ABDULLA",
    "Mohammed Nihan",
    "Abinraj pp",
    "muhammed nazal",
    "Abdulla Wafi",
  ],
  MATIKS: [
    "Nousheen Rumman",
    "Limitha M",
    "Abhishek Venkatesh Naik",
    "Shreehari G S",
    "Shreyas S",
    "Sangam J K",
    "Karthik Gowda M G",
    "Abhilash Pattar",
    "Madhu",
    "Harshitha",
    "Praveen K Jummanagol",
    "Arachana Jalihal",
  ],
};

// Official Free Fire Mangalore Edition Tournament Groups & Venues
export const FREE_FIRE_GROUP_A_TEAMS = [
  "Khopdi Phodu gng",
  "GLOBEL HUNTERS",
  "AURA RUSHERZ",
  "TAG BOYSS !!",
  "IDFC",
  "TEAM NOX",
  "Zain warriors",
  "BAD SQUAD",
  "BROTHERHOOD",
];

export const FREE_FIRE_GROUP_B_TEAMS = [
  "Teamstack",
  "Hunters",
  "DAMN BROS",
  "Gaza",
  "ROCKERS",
  "V4",
  "LAGLORDS",
  "MALNAD WARRIORS",
];

export function getFreeFireGroupInfo(teamName: string) {
  const norm = (teamName || "").toLowerCase().trim();
  const isA = FREE_FIRE_GROUP_A_TEAMS.some(
    (t) => norm === t.toLowerCase().trim() || norm.startsWith(t.toLowerCase().trim())
  );
  if (isA) {
    return {
      group: "A" as const,
      venue: "LH18",
      label: "Group A (LH18)",
      badge: "Group A • LH18",
    };
  }
  return {
    group: "B" as const,
    venue: "LH19",
    label: "Group B (LH19)",
    badge: "Group B • LH19",
  };
}

export function resolveAdminAccess(code: string): {
  isValid: boolean;
  isSuperAdmin: boolean;
  campusId?: string;
  gameId?: GameId | "ALL";
  isLocked: boolean;
  error?: string;
} {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, isSuperAdmin: false, isLocked: false, error: "Please enter an access code." };
  }

  // Super Admin Check (Master Omnipotent Access)
  if (cleanCode === SUPER_ADMIN_CODE) {
    return {
      isValid: true,
      isSuperAdmin: true,
      campusId: undefined, // Super admin can toggle/access all campuses
      gameId: "ALL",
      isLocked: false,
    };
  }

  // Campus Admin Check (KY-ADMIN-2026, MNG-ADMIN-2026, etc.)
  for (const [campusKey, meta] of Object.entries(CAMPUSES_REGISTRY)) {
    if (cleanCode === meta.adminCode.toUpperCase()) {
      return {
        isValid: true,
        isSuperAdmin: false,
        campusId: campusKey,
        gameId: "ALL",
        isLocked: meta.isLocked,
      };
    }
  }

  // Specific Game POC Check
  if (VALID_GAME_CODES[cleanCode]) {
    return {
      isValid: true,
      isSuperAdmin: false,
      campusId: "mangalore",
      gameId: VALID_GAME_CODES[cleanCode],
      isLocked: CAMPUSES_REGISTRY["mangalore"].isLocked,
    };
  }

  return { isValid: false, isSuperAdmin: false, isLocked: false, error: "Invalid access key or room code." };
}


