-- Correção das políticas RLS para Ficha Técnica
-- Data: 2025-01-27

-- Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Users can view mercadorias from their company" ON mercadorias_ingredientes;
DROP POLICY IF EXISTS "Users can insert mercadorias for their company" ON mercadorias_ingredientes;
DROP POLICY IF EXISTS "Users can update mercadorias from their company" ON mercadorias_ingredientes;
DROP POLICY IF EXISTS "Users can delete mercadorias from their company" ON mercadorias_ingredientes;

DROP POLICY IF EXISTS "Users can view receitas from their company" ON receitas_fichas_tecnicas;
DROP POLICY IF EXISTS "Users can insert receitas for their company" ON receitas_fichas_tecnicas;
DROP POLICY IF EXISTS "Users can update receitas from their company" ON receitas_fichas_tecnicas;
DROP POLICY IF EXISTS "Users can delete receitas from their company" ON receitas_fichas_tecnicas;

DROP POLICY IF EXISTS "Users can view receitas_ingredientes from their company" ON receitas_ingredientes;
DROP POLICY IF EXISTS "Users can insert receitas_ingredientes for their company" ON receitas_ingredientes;
DROP POLICY IF EXISTS "Users can update receitas_ingredientes from their company" ON receitas_ingredientes;
DROP POLICY IF EXISTS "Users can delete receitas_ingredientes from their company" ON receitas_ingredientes;

-- Políticas simplificadas para mercadorias_ingredientes
CREATE POLICY "Enable all for authenticated users - mercadorias" 
ON mercadorias_ingredientes 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Políticas simplificadas para receitas_fichas_tecnicas
CREATE POLICY "Enable all for authenticated users - receitas" 
ON receitas_fichas_tecnicas 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Políticas simplificadas para receitas_ingredientes
CREATE POLICY "Enable all for authenticated users - receitas_ingredientes" 
ON receitas_ingredientes 
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Comentário explicativo
COMMENT ON POLICY "Enable all for authenticated users - mercadorias" ON mercadorias_ingredientes IS 'Política temporária simplificada - permite acesso a usuários autenticados';
COMMENT ON POLICY "Enable all for authenticated users - receitas" ON receitas_fichas_tecnicas IS 'Política temporária simplificada - permite acesso a usuários autenticados';
COMMENT ON POLICY "Enable all for authenticated users - receitas_ingredientes" ON receitas_ingredientes IS 'Política temporária simplificada - permite acesso a usuários autenticados'; 