GRANT SELECT ON public.profile_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_comments TO authenticated;
GRANT ALL ON public.profile_comments TO service_role;

NOTIFY pgrst, 'reload schema';
