ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_icon_gap integer NOT NULL DEFAULT 5;
