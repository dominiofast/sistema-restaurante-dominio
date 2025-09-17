-- CORRIGIR RLS POLICIES PARA print_configs
-- =========================================

-- 1. Remover todas as policies problemáticas
DROP POLICY IF EXISTS "Temporary full access to print configs" ON print_configs;
DROP POLICY IF EXISTS "Users can insert their company print configs" ON print_configs;
DROP POLICY IF EXISTS "Users can update their company print configs" ON print_configs;
DROP POLICY IF EXISTS "Users can view their company print configs" ON print_configs;
DROP POLICY IF EXISTS "Users can delete their company print configs" ON print_configs;

-- 2. Criar uma policy simples que funciona para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON print_configs
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Garantir que RLS está habilitado
ALTER TABLE print_configs ENABLE ROW LEVEL SECURITY;