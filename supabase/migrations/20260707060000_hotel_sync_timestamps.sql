-- Controle de sincronização periódica Habbo / Habblet (missão, level, achievements)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS habbo_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS habblet_synced_at timestamptz;
