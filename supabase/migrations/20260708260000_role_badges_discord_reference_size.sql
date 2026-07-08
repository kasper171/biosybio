-- Role badges: match Discord badge reference size (19px).
UPDATE public.profiles
SET role_badges_size_px = 19
WHERE role_badges_size_px IS DISTINCT FROM 19;

ALTER TABLE public.profiles
  ALTER COLUMN role_badges_size_px SET DEFAULT 19;

NOTIFY pgrst, 'reload schema';
