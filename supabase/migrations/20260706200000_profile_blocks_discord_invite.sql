-- Suporte a bloco de convite Discord
ALTER TABLE public.profile_blocks
  DROP CONSTRAINT IF EXISTS profile_blocks_block_type_check;

ALTER TABLE public.profile_blocks
  ADD CONSTRAINT profile_blocks_block_type_check
  CHECK (block_type IN ('link', 'button', 'spotify', 'youtube', 'text', 'discord_invite'));

NOTIFY pgrst, 'reload schema';
