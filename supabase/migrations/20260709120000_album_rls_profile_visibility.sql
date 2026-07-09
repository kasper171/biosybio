-- Album RLS aligned with Card Normal public profile visibility.
-- Card Normal: profiles are world-readable when the row exists (no global is_private flag today).
-- This function is the single gate for album public reads; extend when profiles gain visibility.

CREATE OR REPLACE FUNCTION public.album_profile_is_public(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.album_profile_is_public(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.album_profile_is_public(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "album_layouts_select_public" ON public.album_layouts;
CREATE POLICY "album_layouts_select_public"
  ON public.album_layouts
  FOR SELECT
  TO anon, authenticated
  USING (public.album_profile_is_public(user_id));

DROP POLICY IF EXISTS "album_connections_select_public" ON public.album_connections;
CREATE POLICY "album_connections_select_public"
  ON public.album_connections
  FOR SELECT
  TO anon, authenticated
  USING (public.album_profile_is_public(user_id));

DROP POLICY IF EXISTS "profile_display_styles_select_public" ON public.profile_display_styles;
CREATE POLICY "profile_display_styles_select_public"
  ON public.profile_display_styles
  FOR SELECT
  TO anon, authenticated
  USING (public.album_profile_is_public(user_id));

NOTIFY pgrst, 'reload schema';
