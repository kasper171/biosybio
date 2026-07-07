ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS text_typing_effect boolean NOT NULL DEFAULT true;

NOTIFY pgrst, 'reload schema';
