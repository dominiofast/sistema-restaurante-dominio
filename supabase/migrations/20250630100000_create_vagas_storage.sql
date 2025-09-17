-- Criar o bucket de armazenamento para os assets da página de vagas
INSERT INTO storage.buckets (id, name, public)
VALUES ('vagas_assets', 'vagas_assets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Definir políticas de acesso para o bucket

-- 1. Permitir que qualquer pessoa veja as imagens (leitura pública)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vagas_assets' );

-- 2. Permitir que usuários autenticados façam upload de imagens
CREATE POLICY "Authenticated User Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'vagas_assets' AND auth.role() = 'authenticated' );

-- 3. Permitir que usuários atualizem (substituam) suas próprias imagens
-- A política verifica se o ID do usuário que fez o upload original é o mesmo do usuário atual.
CREATE POLICY "Authenticated User Update"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'vagas_assets' );

-- 4. Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Authenticated User Delete"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner ); 