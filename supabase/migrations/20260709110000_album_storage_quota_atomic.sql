-- Atomic album storage quota (race-safe reserve/release)

CREATE OR REPLACE FUNCTION public.album_reserve_storage_bytes(
  p_user_id uuid,
  p_bytes bigint,
  p_max_bytes bigint DEFAULT 209715200
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL OR p_bytes IS NULL OR p_bytes <= 0 THEN
    RETURN false;
  END IF;

  INSERT INTO public.album_layouts (user_id, layout, theme, storage_bytes_used)
  VALUES (p_user_id, '[]'::jsonb, '{}'::jsonb, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.album_layouts
  SET
    storage_bytes_used = storage_bytes_used + p_bytes,
    updated_at = now()
  WHERE user_id = p_user_id
    AND storage_bytes_used + p_bytes <= p_max_bytes;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.album_release_storage_bytes(
  p_user_id uuid,
  p_bytes bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL OR p_bytes IS NULL OR p_bytes <= 0 THEN
    RETURN;
  END IF;

  UPDATE public.album_layouts
  SET
    storage_bytes_used = GREATEST(0, storage_bytes_used - p_bytes),
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.album_reserve_storage_bytes(uuid, bigint, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.album_release_storage_bytes(uuid, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.album_reserve_storage_bytes(uuid, bigint, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.album_release_storage_bytes(uuid, bigint) TO service_role;

NOTIFY pgrst, 'reload schema';
