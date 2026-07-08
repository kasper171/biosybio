-- Fix role badge defaults: fixed 48px size, gap 0, reset stored values.
ALTER TABLE public.profiles
  ALTER COLUMN role_badges_gap SET DEFAULT 0;

UPDATE public.profiles
SET
  role_badges_size_px = 48,
  role_badges_gap = 0
WHERE role_badges_size_px IS DISTINCT FROM 48
   OR role_badges_gap IS DISTINCT FROM 0;

NOTIFY pgrst, 'reload schema';
