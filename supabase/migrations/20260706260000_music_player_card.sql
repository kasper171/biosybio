-- Card personalizável do player de música abaixo do card principal
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS music_card_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS music_card_art_url text,
  ADD COLUMN IF NOT EXISTS music_card_title text,
  ADD COLUMN IF NOT EXISTS music_card_subtitle text;

COMMENT ON COLUMN public.profiles.music_card_enabled IS 'Quando true, exibe player como card abaixo do perfil; false usa o botão flutuante';
COMMENT ON COLUMN public.profiles.music_card_art_url IS 'Imagem ou GIF circular exibida no card do player';
COMMENT ON COLUMN public.profiles.music_card_title IS 'Título personalizado no card (fallback: music_title)';
COMMENT ON COLUMN public.profiles.music_card_subtitle IS 'Subtítulo opcional no card do player';
