ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_view_count boolean NOT NULL DEFAULT true;
