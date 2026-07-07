ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS effect_tilt_strength integer NOT NULL DEFAULT 5;
