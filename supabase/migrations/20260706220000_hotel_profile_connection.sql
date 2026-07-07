-- Conexão de perfil Habbo Hotel / Habblet

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hotel_platform text,
  ADD COLUMN IF NOT EXISTS hotel_username text,
  ADD COLUMN IF NOT EXISTS hotel_domain text,
  ADD COLUMN IF NOT EXISTS hotel_figure text,
  ADD COLUMN IF NOT EXISTS hotel_motto text,
  ADD COLUMN IF NOT EXISTS hotel_level integer,
  ADD COLUMN IF NOT EXISTS hotel_achievement_points integer,
  ADD COLUMN IF NOT EXISTS hotel_card_placement text NOT NULL DEFAULT 'inside',
  ADD COLUMN IF NOT EXISTS hotel_card_row text NOT NULL DEFAULT 'separate_row',
  ADD COLUMN IF NOT EXISTS hotel_card_shape text NOT NULL DEFAULT 'rectangle',
  ADD COLUMN IF NOT EXISTS hotel_card_size text NOT NULL DEFAULT 'md';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hotel_platform_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_hotel_platform_check
  CHECK (hotel_platform IS NULL OR hotel_platform IN ('habbo', 'habblet'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hotel_card_placement_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_hotel_card_placement_check
  CHECK (hotel_card_placement IN ('inside', 'outside'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hotel_card_row_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_hotel_card_row_check
  CHECK (hotel_card_row IN ('same_row', 'separate_row'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hotel_card_shape_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_hotel_card_shape_check
  CHECK (hotel_card_shape IN ('square', 'rectangle'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_hotel_card_size_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_hotel_card_size_check
  CHECK (hotel_card_size IN ('sm', 'md', 'lg'));

NOTIFY pgrst, 'reload schema';
