ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS page_font_family text NOT NULL
    DEFAULT 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif',
  ADD COLUMN IF NOT EXISTS name_font_family text NOT NULL DEFAULT 'inherit',
  ADD COLUMN IF NOT EXISTS title_text_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS body_text_color text NOT NULL DEFAULT 'rgba(255,255,255,0.80)',
  ADD COLUMN IF NOT EXISTS muted_text_color text NOT NULL DEFAULT 'rgba(255,255,255,0.55)',
  ADD COLUMN IF NOT EXISTS icon_color text NOT NULL DEFAULT 'rgba(255,255,255,0.85)',
  ADD COLUMN IF NOT EXISTS badge_bg_color text NOT NULL DEFAULT 'rgba(0,0,0,0.45)',
  ADD COLUMN IF NOT EXISTS badge_text_color text NOT NULL DEFAULT 'rgba(255,255,255,0.85)',
  ADD COLUMN IF NOT EXISTS inner_divider_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS inner_divider_opacity real NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS text_glow_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS text_glow_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS text_glow_size integer NOT NULL DEFAULT 0;

NOTIFY pgrst, 'reload schema';

