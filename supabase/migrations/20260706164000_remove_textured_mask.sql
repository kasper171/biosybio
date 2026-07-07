-- Remove efeito Textured Mask
UPDATE public.profiles SET name_text_animation = 'none' WHERE name_text_animation = 'textured_mask';
UPDATE public.profiles SET bio_text_animation = 'none' WHERE bio_text_animation = 'textured_mask';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_name_text_animation_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bio_text_animation_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_text_animation_check
  CHECK (name_text_animation IN (
    'none', 'slide_in', 'scale_in', 'bouncy', 'blur_in', 'wavy',
    'staggered_pop_in', 'shiny', 'gradient', 'glitch',
    'morphing', 'typewriter', 'particle'
  ));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_text_animation_check
  CHECK (bio_text_animation IN (
    'none', 'slide_in', 'scale_in', 'bouncy', 'blur_in', 'wavy',
    'staggered_pop_in', 'shiny', 'gradient', 'glitch',
    'morphing', 'typewriter', 'particle'
  ));
