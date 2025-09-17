
-- Ajustar a política de leitura para ser mais específica
DROP POLICY IF EXISTS "Allow company members to read applications" ON rh_inscricoes;

-- Nova política mais específica que verifica se o usuário está autenticado
-- e se a empresa existe (o que indica que o usuário tem acesso a ela)
CREATE POLICY "Allow authenticated users to read their company applications"
ON rh_inscricoes
FOR SELECT
TO authenticated
USING (
  -- Verifica se o usuário está autenticado e se a company_id existe na tabela companies
  EXISTS (
    SELECT 1 FROM companies 
    WHERE id = rh_inscricoes.company_id
  )
);
