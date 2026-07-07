-- Habbo e Habblet como conexões independentes (ambos podem estar ativos)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS habbo_username text,
  ADD COLUMN IF NOT EXISTS habbo_domain text,
  ADD COLUMN IF NOT EXISTS habbo_figure text,
  ADD COLUMN IF NOT EXISTS habbo_motto text,
  ADD COLUMN IF NOT EXISTS habbo_level integer,
  ADD COLUMN IF NOT EXISTS habblet_username text,
  ADD COLUMN IF NOT EXISTS habblet_figure text,
  ADD COLUMN IF NOT EXISTS habblet_motto text,
  ADD COLUMN IF NOT EXISTS habblet_achievement_points integer;

-- Migra conexão única antiga (hotel_*)
UPDATE public.profiles
SET
  habbo_username = hotel_username,
  habbo_domain = hotel_domain,
  habbo_figure = hotel_figure,
  habbo_motto = hotel_motto,
  habbo_level = hotel_level
WHERE hotel_platform = 'habbo'
  AND hotel_username IS NOT NULL
  AND habbo_username IS NULL;

UPDATE public.profiles
SET
  habblet_username = hotel_username,
  habblet_figure = hotel_figure,
  habblet_motto = hotel_motto,
  habblet_achievement_points = hotel_achievement_points
WHERE hotel_platform = 'habblet'
  AND hotel_username IS NOT NULL
  AND habblet_username IS NULL;

NOTIFY pgrst, 'reload schema';
