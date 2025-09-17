-- Descrição: Corrige a política de segurança para o bucket 'curriculos', permitindo uploads anônimos.

-- 1. Garante que o bucket 'curriculos' exista e seja público.
INSERT INTO storage.buckets (id, name, public)
VALUES ('curriculos', 'curriculos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Remove qualquer política de INSERT antiga e restritiva que possa existir para este bucket.
-- Usamos um bloco DO para evitar erros se a política não existir.
DO $$
BEGIN
   IF EXISTS (
       SELECT 1
       FROM pg_policies
       WHERE policyname = 'Authenticated User Upload for Curriculos'
   ) THEN
       DROP POLICY "Authenticated User Upload for Curriculos" ON storage.objects;
   END IF;
END $$;

-- 3. Cria a política de INSERT correta e permissiva para o bucket 'curriculos'.
-- Permite que usuários 'authenticated' E 'anon' façam upload, essencial para formulários públicos.
CREATE POLICY "Allow anon and auth uploads for curriculos" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'curriculos' AND 
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- 4. Permite acesso de leitura (SELECT) público aos arquivos do bucket.
CREATE POLICY "Public Read Access for Curriculos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'curriculos' );

