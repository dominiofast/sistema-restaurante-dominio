
-- Criar o bucket 'vagas' para armazenar currículos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vagas', 'vagas', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir que usuários anônimos façam upload (necessário para formulários públicos)
CREATE POLICY "Allow public uploads to vagas bucket" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'vagas');

-- Permitir leitura pública dos arquivos
CREATE POLICY "Allow public access to vagas files" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'vagas');

-- Permitir que usuários autenticados atualizem arquivos
CREATE POLICY "Allow authenticated users to update vagas files" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'vagas');

-- Permitir que usuários autenticados deletem arquivos
CREATE POLICY "Allow authenticated users to delete vagas files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'vagas');
