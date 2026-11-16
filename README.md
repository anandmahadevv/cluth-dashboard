# CLUTCH – NIAT E-Sports Championship (Mangalore Edition 2026)

> **Official Live Broadcast & Verified Tournament Companion**  
> 🌐 **Live Website**: [https://clutch.niat.me](https://clutch.niat.me)  
> 📍 **Venue**: Yenepoya University, Mangalore • **Date**: 15 November 2026  
> 🎮 **Organizers**: NIAT in association with Yenepoya University

---

## 🏆 Championship Hall of Fame & Final Standings

The 2026 edition of **CLUTCH – NIAT E-Sports Championship** has concluded! Below are the official ratified champions, runners-up, and individual award winners across all 5 championship titles:

### 1. Free Fire (Battle Royale)
- 🏆 **1st Place Champion (Winner Cup)**: **TAG BOYS** (53 pts)
- 🥈 **1st Runner-Up (Runner-Up Cup)**: **DAMN BROS** (52 pts)
- 🌟 **Tournament MVP**: **TGXxGAMER** (*DAMN BROS*) — 42 Kills
- 🎯 **Top Fragger Award**: **PIRATE (SANTHOSH S)** (*TAG BOYS*) — 14 Kills
- **Grand Finals Qualifiers (12 Teams)**: TAG BOYS, DAMN BROS, GLOBEL HUNTERS, AURA RUSHERZ, IDFC, Zain warriors, BAD SQUAD, Teamstack, Gaza, V4, MALNAD WARRIORS, Broken.

### 2. BGMI (Battlegrounds Mobile India)
- 🏆 **1st Place Champion**: **Tarun Kumar Br** — 71 pts (56 kills)
- 🥈 **1st Runner-Up**: **Bexin Kuriakose** — 60 pts (48 kills)

### 3. MATIKS (Esports Logic & Speed Challenge)
- 🏆 **1st Place Champion**: **Abhilash Pattar** — 101 pts (91 matrix score)
- 🥈 **1st Runner-Up**: **Lishan** — 76 pts (68 matrix score)

### 4. Valorant (Tactical 5v5 FPS)
- 🏆 **1st Place Champion**: **TEAM HAVEN (LARREN)** — 10 pts
- 🥈 **1st Runner-Up**: **BAD OMEN (VINEETH)** — 6 pts

### 5. eFootball
- 🏆 **1st Place Champion**: **MUHAMMED FAHIM ABDULLA** — 11 pts (1 goals)
- 🥈 **1st Runner-Up**: **muhammed nazal** — 6 pts (0 goals)

---

## ⚡ Tech Stack & Architecture

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server and Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type safety)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Lucide React icons
- **Database & Persistence**: [Supabase](https://supabase.com/) (PostgreSQL JSONB store with atomic row locking)
- **Deployment**: [Vercel](https://vercel.com/) with Edge caching & automated CI/CD

```
                               ┌─────────────────────────────────┐
                               │   Supabase Cloud Database       │
                               │   table: tournament_state       │
                               │   id: CLUTCH_MANGALORE_2026     │
                               └──────────────┬──────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
        ┌─────────────────────────┐                       ┌─────────────────────────┐
        │  Public Live Read APIs  │                       │  Admin & POC Write APIs │
        │  /api/public/leaderboard│                       │  /api/poc/submit-match  │
        │  /api/public/awards     │                       │  /api/poc/review-sub    │
        │  /api/public/winners    │                       │  /api/poc/awards        │
        └────────────┬────────────┘                       └────────────┬────────────┘
                     │                                                 │
                     ▼                                                 ▼
        ┌─────────────────────────┐                       ┌─────────────────────────┐
        │ Public Spectator UI     │                       │ Authenticated Consoles  │
        │ - Live Home & Podium    │                       │ - /43517 (Super Admin)  │
        │ - /winners Hall of Fame │                       │ - /poc (Game Referees)  │
        │ - /results Match Ledger │                       └─────────────────────────┘
        │ - Projector Poster Mode │
        └─────────────────────────┘
```

---

## 📁 Repository Structure

```
cluth-dashboard/
├── data/
│   └── tournament-data.json       # Cold-start local snapshot backup
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main live broadcast dashboard & podium
│   │   ├── layout.tsx             # Root layout with fonts & navigation
│   │   ├── results/page.tsx       # Public match ledger & verified scores
│   │   ├── winners/page.tsx       # Tournament Hall of Fame
│   │   ├── 43517/page.tsx         # Super Admin Console (auth-protected)
│   │   ├── poc/page.tsx           # POC Referee Console (code-protected)
│   │   ├── games/                 # Dedicated game pages
│   │   │   ├── free-fire/page.tsx
│   │   │   ├── bgmi/page.tsx
│   │   │   ├── valorant/page.tsx
│   │   │   ├── efootball/page.tsx
│   │   │   └── matiks/page.tsx
│   │   └── api/
│   │       ├── public/            # Public JSON endpoints (cached & rate-safe)
│   │       │   ├── awards/
│   │       │   ├── games/
│   │       │   ├── leaderboards/[game]/
│   │       │   ├── matches/[game]/
│   │       │   ├── results/
│   │       │   ├── tournament-status/
│   │       │   └── winners/
│   │       └── poc/               # Match submissions & review endpoints
│   ├── components/
│   │   ├── games/                 # Leaderboard tables & accolade cards
│   │   ├── leaderboards/          # 3-Box Podium & Pre-match showcase
│   │   ├── layout/                # Live status indicator & navigation
│   │   └── shared/                # Modals, share controls, utilities
│   ├── hooks/
│   │   ├── use-polling.ts         # Anti-flicker live polling engine
│   │   └── use-tournament-data.ts # SWR-like data fetchers
│   ├── lib/
│   │   ├── api.ts                 # Typed internal API client
│   │   ├── constants.ts           # Game rules, colors, and event metadata
│   │   ├── supabase.ts            # Supabase database client & operations
│   │   ├── tournament-store.ts    # Central tournament state manager
│   │   └── utils.ts               # Tailwind helpers
│   └── types/
│       └── index.ts               # Core tournament TypeScript definitions
├── supabase/
│   └── schema.sql                 # SQL schema for tournament_state table
├── .env.example                   # Environment variable template
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `18.17.0` or later
- npm, yarn, or pnpm
- Supabase project (URL and publishable/anon key)

### 2. Environment Setup
Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

### 3. Database Table Setup (Supabase)
Run the following SQL in your Supabase SQL Editor (see `supabase/schema.sql`):

```sql
CREATE TABLE IF NOT EXISTS tournament_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public read access for live spectator broadcasts
ALTER TABLE tournament_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON tournament_state FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated or anon insert/update"
  ON tournament_state FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 4. Running Locally

```bash
# Install dependencies
npm install

# Start local Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

```bash
npm run build
npm run start
```

---

## 🔒 Security & Admin Portals

- **Super Admin Console (`/43517`)**:
  - Protected via SHA-256 cryptographic passkey authentication.
  - Review queue for approving, rejecting, or undoing match submissions.
  - Direct live score entry and real-time team re-ranking.
  - Official Grand Finals accolades ratification (Champion, Runner-up, MVP, Top Fragger).
  - One-click full tournament backup and state reset.

- **POC Referee Portal (`/poc`)**:
  - Protected with game-specific room verification codes.
  - Referees submit placement, kills, and screenshot proof URLs.
  - Submissions are queued as `PENDING` until ratified by the Super Admin.

---

## 📄 License
This project is proprietary and maintained for **CLUTCH – NIAT E-Sports Championship**. All rights reserved.
