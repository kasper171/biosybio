-- Cliques em links sociais dos perfis + stats agregadas para a home

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS link_click_count bigint NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.profile_link_click_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  social_key text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_link_click_events_profile_id_idx
  ON public.profile_link_click_events (profile_id);

ALTER TABLE public.profile_link_click_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can log profile link clicks" ON public.profile_link_click_events;
CREATE POLICY "Public can log profile link clicks"
  ON public.profile_link_click_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Owner can read own link click events" ON public.profile_link_click_events;
CREATE POLICY "Owner can read own link click events"
  ON public.profile_link_click_events FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

GRANT SELECT ON public.profile_link_click_events TO authenticated;
GRANT INSERT ON public.profile_link_click_events TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_profile_link_click(target_profile_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.profiles
  SET link_click_count = link_click_count + 1
  WHERE id = target_profile_id
  RETURNING link_click_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_profile_link_click(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_profile_link_click(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.bump_profile_link_click_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET link_click_count = link_click_count + 1
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_link_click_insert ON public.profile_link_click_events;
CREATE TRIGGER on_profile_link_click_insert
  AFTER INSERT ON public.profile_link_click_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_profile_link_click_count();

REVOKE ALL ON FUNCTION public.bump_profile_link_click_count() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'profile_count', (SELECT count(*)::bigint FROM public.profiles),
    'total_views', (SELECT COALESCE(sum(view_count), 0)::bigint FROM public.profiles),
    'total_clicks', (SELECT COALESCE(sum(link_click_count), 0)::bigint FROM public.profiles)
  );
$$;

REVOKE ALL ON FUNCTION public.get_platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_featured_creators(limit_count integer DEFAULT 24)
RETURNS TABLE (
  username text,
  display_name text,
  avatar_url text,
  view_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.username,
    p.display_name,
    p.avatar_url,
    p.view_count
  FROM public.profiles p
  WHERE p.avatar_url IS NOT NULL
    AND btrim(p.avatar_url) <> ''
  ORDER BY p.view_count DESC, p.created_at DESC NULLS LAST
  LIMIT GREATEST(limit_count, 1);
$$;

REVOKE ALL ON FUNCTION public.get_featured_creators(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_featured_creators(integer) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
