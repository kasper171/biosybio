-- Bootstrap: tabelas de visualização que faltavam no banco remoto.
-- Rode isto ANTES (ou no lugar) do 20260708400000 se profile_view_dedup não existir.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_view_count boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.profile_view_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_view_events
  ADD COLUMN IF NOT EXISTS visitor_id text;

CREATE INDEX IF NOT EXISTS profile_view_events_profile_id_idx
  ON public.profile_view_events (profile_id);

ALTER TABLE public.profile_view_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.profile_view_dedup (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  counted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_bucket text,
  p_max_hits integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window interval := make_interval(secs => GREATEST(p_window_seconds, 1));
  v_count integer;
BEGIN
  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, hit_count)
  VALUES (left(p_bucket, 200), v_now, 1)
  ON CONFLICT (bucket_key) DO UPDATE SET
    hit_count = CASE
      WHEN rate_limit_buckets.window_start + v_window <= v_now THEN 1
      ELSE rate_limit_buckets.hit_count + 1
    END,
    window_start = CASE
      WHEN rate_limit_buckets.window_start + v_window <= v_now THEN v_now
      ELSE rate_limit_buckets.window_start
    END
  RETURNING hit_count INTO v_count;

  RETURN v_count <= p_max_hits;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

-- Fix contagem (mesmo conteúdo essencial do 20260708400000)
CREATE OR REPLACE FUNCTION public.protect_profiles_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;

  IF current_setting('byosy.profile_metrics_bump', true) = '1' THEN
    RETURN NEW;
  END IF;

  IF current_setting('byosy.profile_premium_sync', true) = '1' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.is_premium := OLD.is_premium;
    NEW.view_count := OLD.view_count;
    NEW.link_click_count := OLD.link_click_count;
    NEW.public_uid := OLD.public_uid;
    NEW.discord_user_id := OLD.discord_user_id;
    NEW.habbo_username := OLD.habbo_username;
    NEW.habbo_domain := OLD.habbo_domain;
    NEW.habbo_figure := OLD.habbo_figure;
    NEW.habbo_motto := OLD.habbo_motto;
    NEW.habbo_level := OLD.habbo_level;
    NEW.habbo_synced_at := OLD.habbo_synced_at;
    NEW.habblet_username := OLD.habblet_username;
    NEW.habblet_figure := OLD.habblet_figure;
    NEW.habblet_motto := OLD.habblet_motto;
    NEW.habblet_achievement_points := OLD.habblet_achievement_points;
    NEW.habblet_synced_at := OLD.habblet_synced_at;
    NEW.hotel_platform := OLD.hotel_platform;
    NEW.hotel_username := OLD.hotel_username;
    NEW.hotel_domain := OLD.hotel_domain;
    NEW.hotel_figure := OLD.hotel_figure;
    NEW.hotel_motto := OLD.hotel_motto;
    NEW.hotel_level := OLD.hotel_level;
    NEW.hotel_achievement_points := OLD.hotel_achievement_points;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_profile_view(target_profile_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  PERFORM set_config('byosy.profile_metrics_bump', '1', true);
  UPDATE public.profiles
  SET view_count = view_count + 1
  WHERE id = target_profile_id
  RETURNING view_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

DROP TRIGGER IF EXISTS on_profile_view_insert ON public.profile_view_events;

REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid) TO service_role;

REVOKE INSERT ON public.profile_view_events FROM anon, authenticated;
GRANT SELECT, INSERT ON public.profile_view_dedup TO service_role;
GRANT SELECT, INSERT ON public.profile_view_events TO service_role;

DROP POLICY IF EXISTS "Owner can read own view events" ON public.profile_view_events;
CREATE POLICY "Owner can read own view events"
  ON public.profile_view_events
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

NOTIFY pgrst, 'reload schema';
