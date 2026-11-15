import { GameId } from "@/types";

// Cryptographic SHA-256 Hash for Super Admin Access (zero plaintext stored or exposed)
export const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  "bb9fc06955867332c18b234775cb22982f693e7ad56d430fb550a386840ef9fd";

// Official Game Verification Codes
export const VALID_GAME_CODES: Record<string, GameId | "ALL"> = {
  "CLUTCH-SUPER-2026": "ALL", // Master Super Admin Room Code
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


