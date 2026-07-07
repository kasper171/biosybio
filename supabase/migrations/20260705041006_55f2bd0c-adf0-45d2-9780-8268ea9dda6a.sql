ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS inner_banner_url text,
  ADD COLUMN IF NOT EXISTS effect_tilt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS effect_hover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS effect_glow boolean NOT NULL DEFAULT false;