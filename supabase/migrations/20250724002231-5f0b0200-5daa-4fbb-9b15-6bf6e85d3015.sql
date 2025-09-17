-- Verificar se o bucket media existe, caso contrário criá-lo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload para usuários autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload media files'
  ) THEN
    CREATE POLICY "Authenticated users can upload media files" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'media' AND 
      auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Política para permitir leitura pública dos arquivos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view media files'
  ) THEN
    CREATE POLICY "Public can view media files" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');
  END IF;
END $$;

-- Política para permitir usuários deletarem arquivos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete media files'
  ) THEN
    CREATE POLICY "Authenticated users can delete media files" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'media' AND 
      auth.role() = 'authenticated'
    );
  END IF;
END $$;