ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_icon_size integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS social_icon_bloom boolean NOT NULL DEFAULT false;
