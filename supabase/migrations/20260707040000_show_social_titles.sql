-- Exibir nome da rede abaixo do ícone (ex.: Imgur, GitHub)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_social_titles boolean NOT NULL DEFAULT false;
