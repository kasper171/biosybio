-- Owners must always read/write their own album rows (dashboard studio).
-- Public read policies remain for anonymous profile rendering.

CREATE POLICY "profile_display_styles_select_owner"
  ON public.profile_display_styles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "album_layouts_select_owner"
  ON public.album_layouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "album_connections_select_owner"
  ON public.album_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
