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

-- 3. Private server-owned state: the JSON contains campus access keys.
-- Set SUPABASE_SERVICE_ROLE_KEY on the deployment server before using this policy.
DROP POLICY IF EXISTS "Allow public read access" ON tournament_state;
DROP POLICY IF EXISTS "Allow public insert and update" ON tournament_state;
REVOKE ALL ON TABLE public.tournament_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tournament_state TO service_role;

-- 5. Optional Real-time broadcast for live websockets
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_state;
