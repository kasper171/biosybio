ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS card_reveal_effect text NOT NULL DEFAULT 'fade';

NOTIFY pgrst, 'reload schema';
