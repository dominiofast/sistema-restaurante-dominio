-- Remover política genérica existente
DROP POLICY IF EXISTS "Users can manage their company branding" ON cardapio_branding;

-- Criar política mais específica que verifica se o usuário pertence à empresa
CREATE POLICY "Users can manage their company branding" ON cardapio_branding
FOR ALL TO authenticated
USING (
  -- Verificar se o usuário está autenticado e 
  -- se o company_id corresponde ao company_id do usuário no metadata
  auth.uid() IS NOT NULL AND 
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
)
WITH CHECK (
  -- Mesma verificação para INSERT/UPDATE
  auth.uid() IS NOT NULL AND 
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);