-- Personalização do embed ao compartilhar o link do perfil (Discord, etc.)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS share_embed_title text,
  ADD COLUMN IF NOT EXISTS share_embed_description text,
  ADD COLUMN IF NOT EXISTS share_embed_image_url text;
