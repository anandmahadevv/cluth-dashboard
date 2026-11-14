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
  "CLT-VL-2026X": "VALORANT",
  "CLT-EF-2026X": "EFOOTBALL",
  "CLT-FI-2026X": "EFOOTBALL", // Backward compatibility alias
  "CLT-MT-2026X": "MATIKS",
};

// Official Placement Points Rules
export const PLACEMENT_POINTS: Record<GameId, number[]> = {
  FREE_FIRE: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0], // 12 Squads: 1st=12, 2nd=9, 3rd=8, 4th=7...
  BGMI: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0], // 16 Squads: 1st=15, 2nd=12, 3rd=10...
  VALORANT: [10, 6, 4, 2, 1, 1, 1, 1], // 8 Squads: 1st=10, 2nd=6, 3rd=4, 4th=2...
  EFOOTBALL: [10, 6, 4, 2, 1, 1, 1, 1], // 8 Players: 1st (Winner)=10, 2nd=6, 3rd=4, 4th=2...
  MATIKS: [10, 8, 6, 4, 3, 2, 1, 0], // 8 Speed/Logic Solvers: 1st=10, 2nd=8, 3rd=6...
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
  VALORANT: [
    "Team Liquid Kudla",
    "Sentinels Mangalore",
    "Fnatic Yenepoya",
    "Paper Rex Coastal",
    "Optic Gaming NIAT",
    "Global Esports Karnataka",
    "Velocity Gaming Mangalore",
    "Enigma Gaming Kudla",
  ],
  EFOOTBALL: [
    "Zayd Khan (FC Barcelona)",
    "Rohit Shetty (Manchester City)",
    "Neil D'Souza (Bayern Munich)",
    "Farhan Ahmed (Arsenal)",
    "Kevin Rodrigues (PSG)",
    "Aakash Rao (Real Madrid)",
    "Danish Sheikh (Inter Milan)",
    "Pratham Naik (Liverpool)",
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

