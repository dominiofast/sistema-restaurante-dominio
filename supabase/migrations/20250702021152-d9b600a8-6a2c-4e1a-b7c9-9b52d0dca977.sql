-- Reverter para o modelo correto: cada empresa só acessa seus próprios dados
DROP POLICY IF EXISTS "Allow media files access" ON media_files;

-- Recriar políticas corretas (apenas para empresa própria)
CREATE POLICY "Users can view media files of their company" ON media_files
FOR SELECT 
USING (
  company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "Users can insert media files for their company" ON media_files
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "Users can update media files of their company" ON media_files
FOR UPDATE 
USING (
  company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  )
);

CREATE POLICY "Users can delete media files of their company" ON media_files
FOR DELETE 
USING (
  company_id IN (
    SELECT c.id FROM companies c 
    JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
    WHERE u.id = auth.uid()
  )
);