-- ==============================================================================
-- CLUTCH Tournament: Supabase Database Setup
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/iajmrlbvurmblqqysrju
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query", paste this entire script, and click "Run" (green button)
-- ==============================================================================

-- 1. Tournament State Table (Single source of truth for real-time live standings)
CREATE TABLE IF NOT EXISTS tournament_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE tournament_state ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access (for dashboards, leaderboards, and spectators)
DROP POLICY IF EXISTS "Allow public read access" ON tournament_state;
CREATE POLICY "Allow public read access"
  ON tournament_state
  FOR SELECT
  USING (true);

-- 4. Allow insert and update
DROP POLICY IF EXISTS "Allow public insert and update" ON tournament_state;
CREATE POLICY "Allow public insert and update"
  ON tournament_state
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Optional Real-time broadcast for live websockets
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_state;
