-- Cache for external Discord profile (dcdn) and Lanyard presence snapshots.
-- Fetched by backend jobs only — never by visitor browsers directly.

CREATE TABLE IF NOT EXISTS public.discord_dcdn_profile_cache (
  discord_user_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.discord_presence_cache (
  discord_user_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS discord_dcdn_profile_cache_fetched_at_idx
  ON public.discord_dcdn_profile_cache (fetched_at DESC);

CREATE INDEX IF NOT EXISTS discord_presence_cache_updated_at_idx
  ON public.discord_presence_cache (updated_at DESC);

ALTER TABLE public.discord_dcdn_profile_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_presence_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read discord dcdn cache" ON public.discord_dcdn_profile_cache;
CREATE POLICY "Public can read discord dcdn cache"
  ON public.discord_dcdn_profile_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can read discord presence cache" ON public.discord_presence_cache;
CREATE POLICY "Public can read discord presence cache"
  ON public.discord_presence_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.discord_dcdn_profile_cache TO anon, authenticated;
GRANT SELECT ON public.discord_presence_cache TO anon, authenticated;
GRANT ALL ON public.discord_dcdn_profile_cache TO service_role;
GRANT ALL ON public.discord_presence_cache TO service_role;

NOTIFY pgrst, 'reload schema';
