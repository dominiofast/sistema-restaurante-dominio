
-- Verificar e ajustar as políticas RLS para rh_inscricoes
-- Primeiro, vamos garantir que as políticas existem corretamente

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Enable public insert for inscricoes" ON rh_inscricoes;
DROP POLICY IF EXISTS "Enable read for company members" ON rh_inscricoes;
DROP POLICY IF EXISTS "Enable update for company members" ON rh_inscricoes;

-- Habilitar RLS na tabela
ALTER TABLE rh_inscricoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (candidatos externos)
CREATE POLICY "Allow public insert for job applications"
ON rh_inscricoes
FOR INSERT
WITH CHECK (true);

-- Política para permitir leitura pelos membros da empresa
CREATE POLICY "Allow company members to read applications"
ON rh_inscricoes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE id = rh_inscricoes.company_id
  )
);

-- Política para permitir atualização pelos membros da empresa
CREATE POLICY "Allow company members to update applications"
ON rh_inscricoes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE id = rh_inscricoes.company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE id = rh_inscricoes.company_id
  )
);
