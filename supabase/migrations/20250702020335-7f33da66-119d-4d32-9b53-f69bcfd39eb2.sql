-- Desabilitar RLS temporariamente para debug
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Reabilitar e limpar todas as políticas
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas de storage.objects
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Criar políticas simples e funcionais
CREATE POLICY "Allow all operations for authenticated users on media bucket" 
ON storage.objects 
FOR ALL 
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public read access to media bucket" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'media');