-- Album tables had RLS policies but no table-level GRANTs for PostgREST roles.
-- Without these, authenticated clients get 403 (42501) on INSERT/UPDATE upsert.

GRANT SELECT ON public.profile_display_styles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_display_styles TO authenticated;

GRANT SELECT ON public.album_layouts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_layouts TO authenticated;

GRANT SELECT ON public.album_connections TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_connections TO authenticated;

NOTIFY pgrst, 'reload schema';
