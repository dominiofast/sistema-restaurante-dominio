-- Criar bucket para armazenar programas/arquivos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'programas', 
  'programas', 
  true,
  104857600, -- 100MB limit
  ARRAY['application/octet-stream', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-msdos-program', 'application/x-msdownload']
);

-- Criar políticas para o bucket programas
CREATE POLICY "Authenticated users can upload programs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'programas' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view programs"
ON storage.objects FOR SELECT
USING (bucket_id = 'programas');

CREATE POLICY "Authenticated users can delete programs"
ON storage.objects FOR DELETE
USING (bucket_id = 'programas' AND auth.role() = 'authenticated');