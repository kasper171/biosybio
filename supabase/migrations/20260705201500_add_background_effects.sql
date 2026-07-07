ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS background_blur integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS background_brightness integer NOT NULL DEFAULT 100;

NOTIFY pgrst, 'reload schema';
