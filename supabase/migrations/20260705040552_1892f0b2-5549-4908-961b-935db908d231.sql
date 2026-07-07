ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS card_width integer NOT NULL DEFAULT 400,
  ADD COLUMN IF NOT EXISTS card_height integer NOT NULL DEFAULT 500;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for any existing users missing one
INSERT INTO public.profiles (id, username, display_name)
SELECT u.id,
       lower(regexp_replace(coalesce(split_part(u.email,'@',1),'user'), '[^a-z0-9_]', '', 'g')) || substr(u.id::text,1,4),
       coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email,'@',1), 'user')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;