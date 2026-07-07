-- Uma conta externa por perfil Byosy (transferência via verificação OTP)

CREATE UNIQUE INDEX IF NOT EXISTS profiles_discord_user_id_unique
  ON public.profiles (discord_user_id)
  WHERE discord_user_id IS NOT NULL AND btrim(discord_user_id) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_habbo_username_domain_unique
  ON public.profiles (lower(habbo_username), habbo_domain)
  WHERE habbo_username IS NOT NULL AND btrim(habbo_username) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_habblet_username_unique
  ON public.profiles (lower(habblet_username))
  WHERE habblet_username IS NOT NULL AND btrim(habblet_username) <> '';
