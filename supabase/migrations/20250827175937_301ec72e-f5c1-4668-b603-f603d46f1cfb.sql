-- Corrigir políticas RLS para categorias_adicionais
-- Permitir inserção para usuários autenticados da empresa

-- Primeiro, vamos remover as políticas restritivas atuais
DROP POLICY IF EXISTS "Company manage categorias_adicionais" ON categorias_adicionais;

-- Criar nova política mais permissiva para INSERT
CREATE POLICY "Users can insert categorias_adicionais"
ON categorias_adicionais
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND company_id IS NOT NULL
);

-- Política para SELECT (já existe mas vamos garantir)
CREATE POLICY "Users can select categorias_adicionais"
ON categorias_adicionais
FOR SELECT
TO authenticated
USING (true);

-- Política para UPDATE
CREATE POLICY "Users can update their company categorias_adicionais"
ON categorias_adicionais
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Política para DELETE
CREATE POLICY "Users can delete their company categorias_adicionais"
ON categorias_adicionais
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);