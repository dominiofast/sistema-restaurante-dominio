-- Verificar e corrigir políticas RLS da tabela media_files
-- Remover políticas restritivas e criar políticas mais amplas

DROP POLICY IF EXISTS "Users can view media files of their company" ON media_files;
DROP POLICY IF EXISTS "Users can insert media files for their company" ON media_files;  
DROP POLICY IF EXISTS "Users can update media files of their company" ON media_files;
DROP POLICY IF EXISTS "Users can delete media files of their company" ON media_files;

-- Criar políticas mais permissivas para usuários autenticados
CREATE POLICY "Allow authenticated users to view media files" ON media_files
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert media files" ON media_files
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update media files" ON media_files
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete media files" ON media_files
FOR DELETE 
TO authenticated
USING (true);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'media_files';