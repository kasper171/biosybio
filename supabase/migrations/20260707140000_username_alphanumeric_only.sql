-- Usernames: apenas letras minúsculas e números (sem _, ;, etc.)

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS username_format;

ALTER TABLE public.profiles
  ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9]{2,30}$') NOT VALID;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  suffix int := 0;
BEGIN
  base_username := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'username',
             split_part(NEW.email, '@', 1),
             'user'),
    '[^a-z0-9]', '', 'g'
  ));
  IF length(base_username) < 2 THEN
    base_username := 'user' || substr(NEW.id::text, 1, 6);
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, avatar_url, public_template_enabled)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name',
             NEW.raw_user_meta_data->>'full_name',
             final_username),
    NEW.raw_user_meta_data->>'avatar_url',
    true
  );
  RETURN NEW;
END;
$$;
