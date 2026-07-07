ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS card_layout text NOT NULL DEFAULT 'default'
  CHECK (card_layout IN ('default', 'centered', 'aligned'));
