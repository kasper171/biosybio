ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS effect_glow_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS effect_glow_size integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS social_icon_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS avatar_border_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS avatar_border_width numeric NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS avatar_size numeric NOT NULL DEFAULT 96,
  ADD COLUMN IF NOT EXISTS inner_banner_pos_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS inner_banner_pos_y numeric NOT NULL DEFAULT 50;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'card_border_width'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE public.profiles
      ALTER COLUMN card_border_width TYPE numeric USING card_border_width::numeric;
  END IF;
END $$;
