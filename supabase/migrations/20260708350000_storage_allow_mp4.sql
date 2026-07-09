-- Permite upload de vídeos mp4/m4v/mov no bucket profile-assets (faixa de música)
-- Limite global do bucket: 30 MB (Premium mp4)

UPDATE storage.buckets
SET file_size_limit = 31457280
WHERE id = 'profile-assets';

DROP POLICY IF EXISTS "Users upload their own assets" ON storage.objects;
CREATE POLICY "Users upload their own assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN (
      'png', 'jpg', 'jpeg', 'webp', 'gif',
      'mp3', 'wav', 'ogg', 'webm', 'm4a',
      'mp4', 'm4v', 'mov'
    )
  );

DROP POLICY IF EXISTS "Users update their own assets" ON storage.objects;
CREATE POLICY "Users update their own assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN (
      'png', 'jpg', 'jpeg', 'webp', 'gif',
      'mp3', 'wav', 'ogg', 'webm', 'm4a',
      'mp4', 'm4v', 'mov'
    )
  );

NOTIFY pgrst, 'reload schema';
