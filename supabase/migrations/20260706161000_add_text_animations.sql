-- Animações de texto no perfil (nome e bio independentes)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name_text_animation text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS bio_text_animation text NOT NULL DEFAULT 'none';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_name_text_animation_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_name_text_animation_check
      CHECK (name_text_animation IN (
        'none', 'slide_in', 'scale_in', 'bouncy', 'blur_in', 'wavy',
        'textured_mask', 'staggered_pop_in', 'shiny', 'gradient', 'glitch',
        'morphing', 'typewriter', 'particle'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_bio_text_animation_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_bio_text_animation_check
      CHECK (bio_text_animation IN (
        'none', 'slide_in', 'scale_in', 'bouncy', 'blur_in', 'wavy',
        'textured_mask', 'staggered_pop_in', 'shiny', 'gradient', 'glitch',
        'morphing', 'typewriter', 'particle'
      ));
  END IF;
END $$;
