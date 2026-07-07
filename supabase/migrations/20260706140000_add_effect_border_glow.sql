ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS effect_border_glow boolean NOT NULL DEFAULT false;
