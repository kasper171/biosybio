ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discord_inside_scale integer NOT NULL DEFAULT 100;
