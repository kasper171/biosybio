ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS music_title text,
  ADD COLUMN IF NOT EXISTS music_start_sec numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS music_end_sec numeric;

NOTIFY pgrst, 'reload schema';
