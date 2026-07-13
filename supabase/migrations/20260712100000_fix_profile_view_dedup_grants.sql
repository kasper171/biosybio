-- Corrige views travadas: upsert de dedup precisa de UPDATE; IP dedup opcional.

CREATE TABLE IF NOT EXISTS public.profile_view_ip_dedup (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_hash text NOT NULL,
  counted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS profile_view_ip_dedup_counted_at_idx
  ON public.profile_view_ip_dedup (counted_at);

CREATE INDEX IF NOT EXISTS profile_view_dedup_counted_at_idx
  ON public.profile_view_dedup (counted_at);

ALTER TABLE public.profile_view_ip_dedup ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.profile_view_ip_dedup FROM PUBLIC;
REVOKE ALL ON public.profile_view_ip_dedup FROM anon, authenticated;

-- Upsert (ON CONFLICT DO UPDATE) exige UPDATE, não só INSERT.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_view_dedup TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_view_ip_dedup TO service_role;
GRANT SELECT, INSERT ON public.profile_view_events TO service_role;

REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid) TO service_role;

NOTIFY pgrst, 'reload schema';
