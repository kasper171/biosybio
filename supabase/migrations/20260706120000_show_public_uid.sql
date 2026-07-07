ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_public_uid boolean NOT NULL DEFAULT true;

NOTIFY pgrst, 'reload schema';
