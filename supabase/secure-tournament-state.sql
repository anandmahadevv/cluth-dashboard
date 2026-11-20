BEGIN;

-- The state JSON contains private access keys. Only the server service role may read/write it.
ALTER TABLE public.tournament_state ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tournament_state'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.tournament_state', p.policyname);
  END LOOP;
END $$;
REVOKE ALL ON TABLE public.tournament_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tournament_state TO service_role;

-- Keep scores and current key assignments intact; remove old credential copies from history.
UPDATE public.tournament_state
SET data = jsonb_set(
  jsonb_set(data, '{matches}', COALESCE((SELECT jsonb_agg(m - 'pocCode') FROM jsonb_array_elements(COALESCE(data->'matches','[]'::jsonb)) m),'[]'::jsonb)),
  '{awardsSubmissions}', COALESCE((SELECT jsonb_agg(a - 'pocCode') FROM jsonb_array_elements(COALESCE(data->'awardsSubmissions','[]'::jsonb)) a),'[]'::jsonb)
), updated_at = now();

COMMIT;

-- Expected: row-level security is enabled; no policies grant access to anon/authenticated.
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.tournament_state'::regclass;
SELECT policyname, roles, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tournament_state';
