import { GameId } from "@/types";

// Cryptographic SHA-256 Hash for Super Admin Access (zero plaintext stored or exposed)
export const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  "bb9fc06955867332c18b234775cb22982f693e7ad56d430fb550a386840ef9fd";

// Official Game Verification Codes
export const VALID_GAME_CODES: Record<string, GameId | "ALL"> = {
  "43517": "ALL", // Master Super Admin Code & Secret Slug
  "CLUTCH-SUPER-2026": "ALL", // Master Super Admin Fallback
  "CLT-FF-2026X": "FREE_FIRE",
  "CLT-BG-2026X": "BGMI",
  "CLT-FI-2026X": "FIFA",
  "CLT-MT-2026X": "MATIKS",
};

// Official Placement Points Rules
export const PLACEMENT_POINTS: Record<"FREE_FIRE" | "BGMI", number[]> = {
  FREE_FIRE: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0], // 12 Squads
  BGMI: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0], // 16 Squads
};

// Initial Seeded Teams at 0 Score
export const INITIAL_TEAMS: Record<GameId, string[]> = {
  FREE_FIRE: [
    "Yenepoya Phantoms",
    "Mangalore Vipers",
    "Coastal Strikers",
    "NIAT Predators",
    "Apex Hawks Mangalore",
    "Thunderbolts Karavali",
    "Delta Force Kudla",
    "Vanguard Mangalore",
    "Shadow Ravens",
    "Titan Squad",
    "Rogue Assassins",
    "Neon Storm",
  ],
  BGMI: [
    "Godlike Karavali",
    "Yenepoya Gladiators",
    "Mangalore Mayhem",
    "Sahyadri Titans",
    "Kudla Esports Squad",
    "Inferno Gaming",
    "Recon Phantoms",
    "Zero Tolerance",
    "Blaze Legion",
    "Nightmare Gaming",
    "Cyber Sentinels",
    "Vortex Gaming",
    "Falcon Claw",
    "Red Line Esports",
    "Tectonic Titans",
    "Dark Horse Mangalore",
  ],
  FIFA: [
    "Zayd Khan (Real Madrid)",
    "Rohit Shetty (Man City)",
    "Neil D'Souza (Bayern Munich)",
    "Farhan Ahmed (Arsenal)",
    "Kevin Rodrigues (PSG)",
    "Aakash Rao (Liverpool)",
    "Danish Sheikh (Barcelona)",
    "Pratham Naik (Inter Milan)",
  ],
  MATIKS: [
    "Aditya Rao",
    "Sanjana Pai",
    "Rohan Kamath",
    "Nidhi Shenoy",
    "Vignesh Bhat",
    "Karthik Prabhu",
    "Ananya Hegde",
    "Suhas Nayak",
  ],
};

