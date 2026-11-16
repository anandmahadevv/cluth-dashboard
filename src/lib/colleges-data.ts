export type CollegeStatus = "live" | "soon" | "finished";

export interface CollegeDetail {
  id: string;
  slug: string;
  name: string;
  university: string;
  city: string;
  state: string;
  status: CollegeStatus;
  statusLabel: string;
  editionName: string;
  venue: string;
  description: string;
  dates: {
    label: string;
    value: string;
    badge?: string;
  }[];
  games: {
    slug: string;
    name: string;
    format: string;
    genre: string;
  }[];
  coordinates: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
  totalTeams?: number;
  featured?: boolean;
  hasActiveDashboard?: boolean;
  dashboardPath?: string;
  externalLink?: string;
}

export const COLLEGES_DATA: CollegeDetail[] = [
  {
    id: "mangalore-yenepoya",
    slug: "mangalore",
    name: "Yenepoya University",
    university: "Yenepoya (Deemed-to-be University)",
    city: "Mangalore",
    state: "Karnataka",
    status: "live",
    statusLabel: "Live Tournament Hub",
    editionName: "Mangalore Edition",
    venue: "Yenepoya University Campus, LH18 & LH19",
    description:
      "The official CLUTCH Mangalore Edition. Real-time verified standings, live Super Admin scoring, match results, and special awards across 5 competitive disciplines.",
    dates: [
      {
        label: "Tournament Date",
        value: "15 November 2026",
        badge: "Live / In Progress",
      },
      {
        label: "Playoffs & Finals",
        value: "Knockout Bracket",
      },
    ],
    games: [
      { slug: "free-fire", name: "Free Fire", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Tactical BR" },
      { slug: "valorant", name: "Valorant", format: "5v5 Squads", genre: "Tactical FPS" },
      { slug: "efootball", name: "eFootball", format: "1v1 Exhibition", genre: "Sports Simulation" },
      { slug: "matiks", name: "MATIKS", format: "Solo", genre: "Speed & Logic" },
    ],
    coordinates: { x: 48.2, y: 78.5 },
    totalTeams: 52,
    featured: true,
    hasActiveDashboard: true,
    dashboardPath: "/leaderboards",
  },
  {
    id: "kanyakumari-niat",
    slug: "kanyakumari",
    name: "NIAT Kanyakumari Campus",
    university: "NxtWave Institute of Advanced Technologies",
    city: "Kanyakumari",
    state: "Tamil Nadu",
    status: "live",
    statusLabel: "Registrations Open",
    editionName: "Kanyakumari Edition",
    venue: "NIAT Kanyakumari Campus Esports Arena",
    description:
      "Clutch is live in Kanyakumari! Build your squad, share your room code, and lock in your player IDs for the southern-most battlefield clash.",
    dates: [
      {
        label: "Registrations Close",
        value: "Wed, 18 Nov 2026 • 11:59 PM",
        badge: "Closing Soon",
      },
      {
        label: "Tournament Day",
        value: "Sat, 21 November 2026",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire-max", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "codm", name: "Call of Duty: Mobile", format: "Squads (5P)", genre: "Tactical Shooter" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Mental Math Duels" },
    ],
    coordinates: { x: 54.08, y: 95.3 },
    totalTeams: 48,
    featured: true,
    hasActiveDashboard: true,
    dashboardPath: "/leaderboards?college=kanyakumari",
  },
  {
    id: "bengaluru-svyasa",
    slug: "bengaluru",
    name: "S-VYASA University / St. Peter's",
    university: "S-VYASA & St. Peter's Institute (NIAT Campus)",
    city: "Bengaluru",
    state: "Karnataka",
    status: "soon",
    statusLabel: "Coming Up",
    editionName: "Bengaluru Tech Edition",
    venue: "NIAT Bengaluru Tech Campus Hub",
    description:
      "India's Silicon Valley collegiate championship. High-octane tactical clashes among tech students and competitive esports squads.",
    dates: [
      {
        label: "Registrations Open",
        value: "December 2026",
        badge: "Upcoming",
      },
      {
        label: "Tournament Window",
        value: "Winter Season 2026",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "valorant", name: "Valorant", format: "5v5 Squads", genre: "Tactical FPS" },
      { slug: "matiks", name: "MATIKS", format: "Solo", genre: "Speed & Logic" },
    ],
    coordinates: { x: 51.2, y: 70.4 },
    totalTeams: 64,
  },
  {
    id: "pune-dypatil",
    slug: "pune",
    name: "Ajeenkya DY Patil University",
    university: "Ajeenkya DY Patil University (NIAT Campus)",
    city: "Pune",
    state: "Maharashtra",
    status: "soon",
    statusLabel: "Coming Up",
    editionName: "Pune Championship",
    venue: "ADYPU Innovation Complex, Lohegaon, Pune",
    description:
      "Western India's premier collegiate esports battleground. Prepare your squads for city qualifiers and bracket knockouts.",
    dates: [
      {
        label: "Phase Launch",
        value: "December 2026",
        badge: "Upcoming",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "codm", name: "Call of Duty: Mobile", format: "5v5 Squads", genre: "Shooter" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Logic Challenge" },
    ],
    coordinates: { x: 25.85, y: 49.91 },
  },
  {
    id: "delhi-ncr-campus",
    slug: "delhi-ncr",
    name: "NIAT Greater Noida / Meerut",
    university: "NIAT North Region Partner Campuses",
    city: "Delhi NCR",
    state: "Delhi NCR / UP",
    status: "soon",
    statusLabel: "Coming Up",
    editionName: "Capital Region Edition",
    venue: "NIAT Delhi-NCR Academic & Esports Complex",
    description:
      "The massive North Zone qualifier circuit. Bring together top campus squads across Greater Noida, Meerut, and surrounding tech institutes.",
    dates: [
      {
        label: "Schedule Announcement",
        value: "Announcing Soon",
        badge: "Season 1",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "codm", name: "Call of Duty: Mobile", format: "5v5 Squads", genre: "Shooter" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Logic & Speed" },
    ],
    coordinates: { x: 51.62, y: 6.04 },
  },
  {
    id: "jaipur-campus",
    slug: "jaipur",
    name: "NIAT Jaipur Campus",
    university: "NIAT Rajasthan Partner Universities",
    city: "Jaipur",
    state: "Rajasthan",
    status: "soon",
    statusLabel: "Coming Up",
    editionName: "Pink City Arena",
    venue: "Jaipur Tech Hub Auditorium",
    description:
      "Clutch lands in Rajasthan. Squad registration and verified student onboarding opening in next rollout wave.",
    dates: [
      {
        label: "City Qualifier",
        value: "Winter 2026",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Speed Battle" },
    ],
    coordinates: { x: 40.69, y: 13.43 },
  },
  {
    id: "coimbatore-campus",
    slug: "coimbatore",
    name: "NIAT Coimbatore Campus",
    university: "NIAT Tamil Nadu West Partner Institutes",
    city: "Coimbatore",
    state: "Tamil Nadu",
    status: "soon",
    statusLabel: "Coming Up",
    editionName: "Kongu Region Edition",
    venue: "Coimbatore Campus Arena",
    description:
      "Textile City Tech showdown. Campus teams prepare for inter-departmental and city-wide championship glory.",
    dates: [
      {
        label: "Qualifier Windows",
        value: "December 2026",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Mental Math" },
    ],
    coordinates: { x: 49.77, y: 82.57 },
  },
  {
    id: "nashik-campus",
    slug: "nashik",
    name: "NIAT Nashik Campus",
    university: "NIAT Maharashtra North Division",
    city: "Nashik",
    state: "Maharashtra",
    status: "soon",
    statusLabel: "Coming Up",
    editionName: "Nashik Arena",
    venue: "Nashik Campus Tech Center",
    description:
      "Maharashtra regional series expansion. Verified student rosters and local tournament brackets.",
    dates: [
      {
        label: "Onboarding Date",
        value: "December 2026",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Speed & Logic" },
    ],
    coordinates: { x: 24.31, y: 43.65 },
  },
  {
    id: "ncr-north-campus",
    slug: "ncr",
    name: "NCR Tech Division",
    university: "NIAT North Cluster Campuses",
    city: "NCR",
    state: "National Capital Region",
    status: "soon",
    statusLabel: "Coming Up",
    editionName: "NCR Regional Circuit",
    venue: "Regional Central Esports Ground",
    description:
      "Cross-campus squad battles for NCR students. Team creation opening upon regional activation.",
    dates: [
      {
        label: "Activation Status",
        value: "Coming Soon",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Math Duels" },
    ],
    coordinates: { x: 79.46, y: 14.0 },
  },
  {
    id: "hyderabad-campuses",
    slug: "hyderabad",
    name: "Aurora & Chaitanya / Malla Reddy",
    university: "Aurora Deemed University & Partner Hubs",
    city: "Hyderabad",
    state: "Telangana",
    status: "finished",
    statusLabel: "Finished • Hall of Fame",
    editionName: "Hyderabad Championship",
    venue: "Hyderabad Central Campus Hub",
    description:
      "The inaugural edition that kicked off the CLUTCH tournament series. Over 100+ squads registered and champions crowned.",
    dates: [
      {
        label: "Season Status",
        value: "Season 1 Completed",
        badge: "Hall of Fame",
      },
      {
        label: "Next Circuit",
        value: "Season 2 in 2027",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "valorant", name: "Valorant", format: "5v5 Squads", genre: "Tactical FPS" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Mental Math" },
    ],
    coordinates: { x: 56.4, y: 58.2 },
    totalTeams: 120,
  },
  {
    id: "chennai-campus",
    slug: "chennai",
    name: "NIAT Chennai Campus",
    university: "NIAT Tamil Nadu Central",
    city: "Chennai",
    state: "Tamil Nadu",
    status: "finished",
    statusLabel: "Finished • Hall of Fame",
    editionName: "Chennai Arena Edition",
    venue: "Chennai Tech Arena",
    description:
      "Marina Coast tournament series concluded. Standings verified and archive trophies awarded.",
    dates: [
      {
        label: "Tournament Result",
        value: "Championship Concluded",
        badge: "Archived",
      },
    ],
    games: [
      { slug: "bgmi", name: "BGMI", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "free-fire", name: "Free Fire MAX", format: "Squads (4P)", genre: "Battle Royale" },
      { slug: "matiks", name: "Matiks", format: "Solo", genre: "Speed & Logic" },
    ],
    coordinates: { x: 75.15, y: 73.57 },
    totalTeams: 74,
  },
];

export function getColleges(): CollegeDetail[] {
  return COLLEGES_DATA;
}

export function getCollegeBySlug(slug: string): CollegeDetail | undefined {
  return COLLEGES_DATA.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}
