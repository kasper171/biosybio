-- Escopo do glow em textos (nome, títulos ou página inteira)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS text_glow_scope text NOT NULL DEFAULT 'all';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_text_glow_scope_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_text_glow_scope_check
      CHECK (text_glow_scope IN ('display_name', 'titles', 'all'));
  END IF;
END $$;
