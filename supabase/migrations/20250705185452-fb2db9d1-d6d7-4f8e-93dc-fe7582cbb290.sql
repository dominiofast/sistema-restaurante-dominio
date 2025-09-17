-- CORRIGIR PERMISSÕES DA TABELA print_configs
-- ============================================

-- 1. Dar permissões completas ao role público
GRANT ALL ON print_configs TO public;
GRANT ALL ON print_configs TO authenticated;

-- 2. Verificar se a tabela existe e tem owner correto
-- Se necessário, alterar owner para supabase_admin
-- ALTER TABLE print_configs OWNER TO supabase_admin;

-- 3. Reabilitar RLS com política mais permissiva
ALTER TABLE print_configs ENABLE ROW LEVEL SECURITY;

-- 4. Remover policies antigas se existirem
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON print_configs;

-- 5. Criar policy permissiva para todos
CREATE POLICY "Allow all authenticated operations" ON print_configs
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);