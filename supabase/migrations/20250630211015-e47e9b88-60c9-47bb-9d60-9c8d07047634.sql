
-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Allow public insert for job applications" ON rh_inscricoes;
DROP POLICY IF EXISTS "Allow authenticated users to read their company applications" ON rh_inscricoes;
DROP POLICY IF EXISTS "Allow company members to update applications" ON rh_inscricoes;

-- Criar nova política para permitir inserção pública (candidatos externos)
CREATE POLICY "Enable public insert for inscricoes"
ON rh_inscricoes
FOR INSERT
WITH CHECK (true);

-- Política para permitir que empresas vejam suas próprias inscrições
CREATE POLICY "Enable read for company members"
ON rh_inscricoes
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM companies WHERE id = rh_inscricoes.company_id)
);

-- Política para permitir que empresas atualizem status das inscrições
CREATE POLICY "Enable update for company members"
ON rh_inscricoes
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM companies WHERE id = rh_inscricoes.company_id)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM companies WHERE id = rh_inscricoes.company_id)
);
