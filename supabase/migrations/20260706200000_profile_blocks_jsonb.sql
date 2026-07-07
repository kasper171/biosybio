-- Blocos do perfil armazenados em JSONB na tabela profiles (sem tabela extra)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blocks jsonb NOT NULL DEFAULT '[]'::jsonb;

NOTIFY pgrst, 'reload schema';
