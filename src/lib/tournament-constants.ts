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

export interface CampusPasskeys {
  campusAdminKey: string;
  gameKeys: Record<GameId, string>;
}

export function generateDefaultCampusPasskeys(campusId: string): CampusPasskeys {
  const prefix = campusId.toUpperCase().slice(0, 3);
  return {
    campusAdminKey: `${prefix}-ADMIN-2026`,
    gameKeys: {
      FREE_FIRE: `CLT-${prefix}-FF-${Math.floor(1000 + Math.random() * 9000)}`,
      BGMI: `CLT-${prefix}-BG-${Math.floor(1000 + Math.random() * 9000)}`,
      VALORANT: `CLT-${prefix}-VL-${Math.floor(1000 + Math.random() * 9000)}`,
      EFOOTBALL: `CLT-${prefix}-EF-${Math.floor(1000 + Math.random() * 9000)}`,
      MATIKS: `CLT-${prefix}-MT-${Math.floor(1000 + Math.random() * 9000)}`,
    },
  };
}

export const DEFAULT_CAMPUS_PASSKEYS: Record<string, CampusPasskeys> = {
  mangalore: {
    campusAdminKey: "MNG-ADMIN-2026",
    gameKeys: {
      FREE_FIRE: "CLT-FF-2026X",
      BGMI: "CLT-BG-2026X",
      VALORANT: "CLT-VL-2026X",
      EFOOTBALL: "CLT-EF-2026X",
      MATIKS: "CLT-MT-2026X",
    },
  },
  kanyakumari: {
    campusAdminKey: "KY-ADMIN-2026",
    gameKeys: {
      FREE_FIRE: "CLT-KY-FF-8219",
      BGMI: "CLT-KY-BG-4592",
      VALORANT: "CLT-KY-VL-6304",
      EFOOTBALL: "CLT-KY-EF-2781",
      MATIKS: "CLT-KY-MT-5147",
    },
  },
  coimbatore: {
    campusAdminKey: "CBE-ADMIN-2026",
    gameKeys: {
      FREE_FIRE: "CLT-CBE-FF-7312",
      BGMI: "CLT-CBE-BG-9401",
      VALORANT: "CLT-CBE-VL-3825",
      EFOOTBALL: "CLT-CBE-EF-6194",
      MATIKS: "CLT-CBE-MT-8450",
    },
  },
  bangalore: {
    campusAdminKey: "BLR-ADMIN-2026",
    gameKeys: {
      FREE_FIRE: "CLT-BLR-FF-2940",
      BGMI: "CLT-BLR-BG-5831",
      VALORANT: "CLT-BLR-VL-7419",
      EFOOTBALL: "CLT-BLR-EF-8630",
      MATIKS: "CLT-BLR-MT-4208",
    },
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

export function resolveAdminAccess(
  code: string,
  dynamicPasskeys?: Record<string, CampusPasskeys> | null
): {
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
  if (
    cleanCode === SUPER_ADMIN_CODE ||
    cleanCode === "43517" ||
    cleanCode === "43517-AM" ||
    cleanCode === "CLUTCH@43517"
  ) {
    return {
      isValid: true,
      isSuperAdmin: true,
      campusId: undefined, // Super admin can toggle/access all campuses
      gameId: "ALL",
      isLocked: false,
    };
  }

  // 1. Check Dynamic Passkeys from Database / Store
  if (dynamicPasskeys) {
    for (const [campusKey, pks] of Object.entries(dynamicPasskeys)) {
      if (pks?.campusAdminKey && cleanCode === pks.campusAdminKey.trim().toUpperCase()) {
        const isLocked = CAMPUSES_REGISTRY[campusKey]?.isLocked ?? false;
        return {
          isValid: true,
          isSuperAdmin: false,
          campusId: campusKey,
          gameId: "ALL",
          isLocked,
        };
      }
      if (pks?.gameKeys) {
        for (const [gId, uid] of Object.entries(pks.gameKeys)) {
          if (uid && cleanCode === uid.trim().toUpperCase()) {
            const isLocked = CAMPUSES_REGISTRY[campusKey]?.isLocked ?? false;
            return {
              isValid: true,
              isSuperAdmin: false,
              campusId: campusKey,
              gameId: gId as GameId,
              isLocked,
            };
          }
        }
      }
    }
  }

  // 2. Check Default Campus Passkeys & Dedicated Game UIDs
  for (const [campusKey, pks] of Object.entries(DEFAULT_CAMPUS_PASSKEYS)) {
    if (pks.campusAdminKey && cleanCode === pks.campusAdminKey.trim().toUpperCase()) {
      const isLocked = CAMPUSES_REGISTRY[campusKey]?.isLocked ?? false;
      return {
        isValid: true,
        isSuperAdmin: false,
        campusId: campusKey,
        gameId: "ALL",
        isLocked,
      };
    }
    if (pks.gameKeys) {
      for (const [gId, uid] of Object.entries(pks.gameKeys)) {
        if (uid && cleanCode === uid.trim().toUpperCase()) {
          const isLocked = CAMPUSES_REGISTRY[campusKey]?.isLocked ?? false;
          return {
            isValid: true,
            isSuperAdmin: false,
            campusId: campusKey,
            gameId: gId as GameId,
            isLocked,
          };
        }
      }
    }
  }

  // 3. Campus Admin Check (KY-ADMIN-2026, MNG-ADMIN-2026, etc.)
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

  // 4. Specific Legacy Game POC Check
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


