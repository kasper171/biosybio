-- Largura do card do player em % da largura do card principal (40–100)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS music_card_width_pct integer NOT NULL DEFAULT 100;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_music_card_width_pct_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_music_card_width_pct_check
  CHECK (music_card_width_pct >= 40 AND music_card_width_pct <= 100);

COMMENT ON COLUMN public.profiles.music_card_width_pct IS 'Largura do card do player (% da largura do card principal)';
