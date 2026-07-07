ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discord_show_badges boolean NOT NULL DEFAULT true;

NOTIFY pgrst, 'reload schema';
