-- 1. Drop a política antiga e restritiva para uploads, se ela existir.
DROP POLICY IF EXISTS "Authenticated User Upload" ON storage.objects;

-- 2. Cria uma nova política mais permissiva que atende tanto usuários logados quanto anônimos.
-- Esta política permite que:
--   - Qualquer usuário autenticado ('authenticated') faça upload no bucket 'vagas_assets'.
--   - Qualquer usuário anônimo ('anon') também possa fazer upload no bucket 'vagas_assets'.
-- Isso é essencial para formulários públicos, como o de candidatura a vagas, onde o usuário não está logado.
CREATE POLICY "Allow authenticated and anonymous uploads for vagas" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (
    bucket_id = 'vagas_assets' AND 
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- As políticas existentes para SELECT, UPDATE e DELETE não precisam ser alteradas,
-- pois já gerenciam corretamente as permissões para usuários autenticados (donos dos arquivos).
