-- Garante RPC is_username_taken (caso migration security_complete não tenha sido aplicada).
-- Retorna apenas boolean; SECURITY DEFINER limitado ao EXISTS em profiles.

CREATE OR REPLACE FUNCTION public.is_username_taken(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username = lower(trim(left(p_username, 64)))
  );
$$;

REVOKE ALL ON FUNCTION public.is_username_taken(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_taken(text) TO anon, authenticated;
