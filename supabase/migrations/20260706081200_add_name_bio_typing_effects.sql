ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS text_typing_name_effect boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS text_typing_bio_effect boolean NOT NULL DEFAULT true;

NOTIFY pgrst, 'reload schema';
