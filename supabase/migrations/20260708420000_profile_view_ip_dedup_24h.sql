-- Dedup por IP (hash) + janela de 24h — bloqueia flood em aba anônima / bots.
-- IP bruto NÃO é armazenado; só hash server-side.

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
GRANT SELECT, INSERT, UPDATE ON public.profile_view_ip_dedup TO service_role;

COMMENT ON TABLE public.profile_view_ip_dedup IS
  'Dedup de views por perfil + hash de IP (24h). Escrita apenas via service_role no servidor.';

NOTIFY pgrst, 'reload schema';
