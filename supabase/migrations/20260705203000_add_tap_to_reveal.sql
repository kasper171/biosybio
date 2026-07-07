ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tap_to_reveal_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tap_reveal_blur integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS tap_reveal_brightness integer NOT NULL DEFAULT 55,
  ADD COLUMN IF NOT EXISTS tap_reveal_mode text NOT NULL DEFAULT 'avatar_text',
  ADD COLUMN IF NOT EXISTS tap_reveal_text text NOT NULL DEFAULT 'Toque para revelar';

NOTIFY pgrst, 'reload schema';
