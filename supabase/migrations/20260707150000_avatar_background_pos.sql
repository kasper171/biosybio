ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_pos_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS avatar_pos_y numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS background_pos_x numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS background_pos_y numeric NOT NULL DEFAULT 50;
