-- Cores das partículas nos efeitos de texto
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name_particle_color text NOT NULL DEFAULT '#ff2d7a',
  ADD COLUMN IF NOT EXISTS bio_particle_color text NOT NULL DEFAULT '#ff2d7a';
