-- =============================================================================
-- Album system — isolated tables, storage, RLS (does not touch Card Normal tables)
-- =============================================================================

-- ── Style choice (card vs album) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_display_styles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  style text NOT NULL DEFAULT 'card' CHECK (style IN ('card', 'album')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_display_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_display_styles_select_public"
  ON public.profile_display_styles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "profile_display_styles_insert_owner"
  ON public.profile_display_styles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_display_styles_update_owner"
  ON public.profile_display_styles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_display_styles_delete_owner"
  ON public.profile_display_styles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.profile_display_styles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_display_styles TO authenticated;

-- ── Album layout + theme (jsonb) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.album_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  storage_bytes_used bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS album_layouts_user_id_idx ON public.album_layouts(user_id);

ALTER TABLE public.album_layouts ENABLE ROW LEVEL SECURITY;

-- Public read mirrors profiles visibility: profiles are world-readable today;
-- album layout is readable for public rendering (same as profiles SELECT policy).
CREATE POLICY "album_layouts_select_public"
  ON public.album_layouts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "album_layouts_insert_owner"
  ON public.album_layouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "album_layouts_update_owner"
  ON public.album_layouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "album_layouts_delete_owner"
  ON public.album_layouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.album_layouts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_layouts TO authenticated;

-- ── Album connections (isolated from profiles discord/habbo columns) ─────────
CREATE TABLE IF NOT EXISTS public.album_connections (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  discord_user_id text,
  discord_show_badges boolean NOT NULL DEFAULT true,
  discord_inside_scale numeric,
  habbo_username text,
  habbo_domain text DEFAULT 'com.br',
  habbo_figure text,
  habbo_motto text,
  habbo_level integer,
  habbo_synced_at timestamptz,
  habblet_username text,
  habblet_figure text,
  habblet_motto text,
  habblet_achievement_points integer,
  habblet_synced_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS album_connections_discord_unique
  ON public.album_connections(discord_user_id)
  WHERE discord_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS album_connections_habbo_unique
  ON public.album_connections(lower(habbo_username), habbo_domain)
  WHERE habbo_username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS album_connections_habblet_unique
  ON public.album_connections(lower(habblet_username))
  WHERE habblet_username IS NOT NULL;

ALTER TABLE public.album_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "album_connections_select_public"
  ON public.album_connections
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "album_connections_insert_owner"
  ON public.album_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "album_connections_update_owner"
  ON public.album_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "album_connections_delete_owner"
  ON public.album_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.album_connections TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_connections TO authenticated;

-- ── updated_at triggers ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.album_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_display_styles_updated ON public.profile_display_styles;
CREATE TRIGGER trg_profile_display_styles_updated
  BEFORE UPDATE ON public.profile_display_styles
  FOR EACH ROW EXECUTE FUNCTION public.album_touch_updated_at();

DROP TRIGGER IF EXISTS trg_album_layouts_updated ON public.album_layouts;
CREATE TRIGGER trg_album_layouts_updated
  BEFORE UPDATE ON public.album_layouts
  FOR EACH ROW EXECUTE FUNCTION public.album_touch_updated_at();

DROP TRIGGER IF EXISTS trg_album_connections_updated ON public.album_connections;
CREATE TRIGGER trg_album_connections_updated
  BEFORE UPDATE ON public.album_connections
  FOR EACH ROW EXECUTE FUNCTION public.album_touch_updated_at();

-- ── Storage bucket album-media (isolated from profile-assets) ──────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'album-media',
  'album-media',
  true,
  31457280,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "album_media_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'album-media');

CREATE POLICY "album_media_owner_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'album-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN (
      'png', 'jpg', 'jpeg', 'webp', 'gif',
      'mp4', 'webm', 'mov', 'm4v',
      'mp3', 'wav', 'ogg', 'm4a'
    )
  );

CREATE POLICY "album_media_owner_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'album-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'album-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN (
      'png', 'jpg', 'jpeg', 'webp', 'gif',
      'mp4', 'webm', 'mov', 'm4v',
      'mp3', 'wav', 'ogg', 'm4a'
    )
  );

CREATE POLICY "album_media_owner_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'album-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

NOTIFY pgrst, 'reload schema';
