import { GameId } from "@/types";

export type CampusId = "mangalore" | "kanyakumari" | "coimbatore" | "bangalore" | string;

export interface CampusMetadata {
  id: string;
  name: string;
  shortName: string;
  university: string;
  location: string;
  editionDate: string;
  isLocked: boolean;
  status: "LIVE" | "CONCLUDED" | "UPCOMING";
}

export const CAMPUSES_REGISTRY: Record<string, CampusMetadata> = {
  mangalore: {
    id: "mangalore",
    name: "Mangalore Arena",
    shortName: "Mangalore",
    university: "Yenepoya University",
    location: "Mangalore, Karnataka",
    editionDate: "15 Nov 2026",
    isLocked: true, // Concluded - locked against accidental modification
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
    status: "LIVE",
  },
  bangalore: {
    id: "bangalore",
    name: "Bangalore Arena",
    shortName: "Bangalore",
    university: "NIAT Bangalore Tech Hub",
    location: "Bangalore, Karnataka",
    editionDate: "Winter 2026-27",
    isLocked: false,
    status: "LIVE",
  },
};

export interface CampusPasskeys {
  campusAdminKey: string;
  gameKeys: Record<GameId, string>;
}

// Official Placement Points Rules
export const PLACEMENT_POINTS: Record<GameId, number[]> = {
  FREE_FIRE: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0], // 17 Squads
  COD: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  BGMI: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  VALORANT: [10, 6, 4, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0], // Placement points
  EFOOTBALL: [10, 6, 4, 2, 1, 1, 1, 1, 0, 0],
  MATIKS: [10, 8, 6, 4, 3, 2, 1, 0, 0, 0, 0, 0],
};

// Initial Seeded Teams at 0 Score (Official Registrations from GSheet)
export const INITIAL_TEAMS: Record<GameId, string[]> = {
  COD: [],
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


