-- Molduras animadas (APNG) no avatar
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_frame_id text,
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.avatar_frame_id IS 'ID da moldura APNG (nome do arquivo sem extensão)';
COMMENT ON COLUMN public.profiles.is_premium IS 'Acesso a molduras premium (índice >= 50)';
