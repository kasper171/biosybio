ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_icon_style text NOT NULL DEFAULT 'boxed';
