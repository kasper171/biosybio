-- Role badges: fixed display size 20px (was 48px).
UPDATE public.profiles
SET role_badges_size_px = 20
WHERE role_badges_size_px IS DISTINCT FROM 20;

ALTER TABLE public.profiles
  ALTER COLUMN role_badges_size_px SET DEFAULT 20;

NOTIFY pgrst, 'reload schema';
