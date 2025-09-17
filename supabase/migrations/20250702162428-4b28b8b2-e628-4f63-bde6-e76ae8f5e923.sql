-- Permitir acesso público para leitura de arquivos de mídia
CREATE POLICY "Allow public read for media files" ON public.media_files
FOR SELECT 
TO public
USING (true);