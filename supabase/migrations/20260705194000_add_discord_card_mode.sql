ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discord_card_mode text NOT NULL DEFAULT 'inside';
