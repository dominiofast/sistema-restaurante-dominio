-- Corrigir políticas RLS para ifood_app_config para permitir UPDATE/DELETE por super admins
DROP POLICY IF EXISTS "Super admins can manage global ifood app config" ON ifood_app_config;

-- Criar políticas separadas para cada operação
CREATE POLICY "Super admins can create ifood app config"
ON ifood_app_config
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Super admins can update ifood app config"
ON ifood_app_config
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete ifood app config"
ON ifood_app_config
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'super_admin'
  )
);