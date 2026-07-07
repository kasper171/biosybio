-- Blocos personalizáveis no perfil (dentro ou fora do card principal)
CREATE TABLE IF NOT EXISTS public.profile_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  block_type text NOT NULL CHECK (block_type IN ('link', 'button', 'spotify', 'youtube', 'text')),
  placement text NOT NULL DEFAULT 'inside' CHECK (placement IN ('inside', 'outside')),
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  image_url text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profile_blocks_profile_order_idx
  ON public.profile_blocks(profile_id, placement, sort_order);

ALTER TABLE public.profile_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile blocks are viewable by everyone" ON public.profile_blocks;
CREATE POLICY "Profile blocks are viewable by everyone"
  ON public.profile_blocks FOR SELECT
  USING (enabled = true OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can insert their own profile blocks" ON public.profile_blocks;
CREATE POLICY "Users can insert their own profile blocks"
  ON public.profile_blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can update their own profile blocks" ON public.profile_blocks;
CREATE POLICY "Users can update their own profile blocks"
  ON public.profile_blocks FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete their own profile blocks" ON public.profile_blocks;
CREATE POLICY "Users can delete their own profile blocks"
  ON public.profile_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

GRANT SELECT ON public.profile_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_blocks TO authenticated;
GRANT ALL ON public.profile_blocks TO service_role;

CREATE OR REPLACE FUNCTION public.set_profile_block_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_blocks_updated_at ON public.profile_blocks;
CREATE TRIGGER profile_blocks_updated_at
  BEFORE UPDATE ON public.profile_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_profile_block_updated_at();

NOTIFY pgrst, 'reload schema';
