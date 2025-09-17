-- Configuração do Storage para arquivos de mídia
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Criar bucket 'media' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload media files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

-- 3. Política para permitir leitura pública dos arquivos
CREATE POLICY "Public can view media files" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- 4. Política para permitir usuários deletarem seus próprios arquivos
CREATE POLICY "Users can delete their own media files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Política para permitir usuários atualizarem seus próprios arquivos
CREATE POLICY "Users can update their own media files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
