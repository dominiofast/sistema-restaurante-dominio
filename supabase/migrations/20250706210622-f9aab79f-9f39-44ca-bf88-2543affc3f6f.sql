-- Remover completamente funcionalidade de impressão térmica
-- Dropar tabela print_configs e todas as estruturas relacionadas

-- Remover trigger
DROP TRIGGER IF EXISTS update_print_configs_updated_at ON public.print_configs;

-- Remover função do trigger
DROP FUNCTION IF EXISTS public.update_print_configs_updated_at();

-- Remover políticas RLS
DROP POLICY IF EXISTS "Allow users to view their company print configs" ON public.print_configs;
DROP POLICY IF EXISTS "Allow users to insert their company print configs" ON public.print_configs;
DROP POLICY IF EXISTS "Allow users to update their company print configs" ON public.print_configs;
DROP POLICY IF EXISTS "Allow users to delete their company print configs" ON public.print_configs;

-- Remover índices
DROP INDEX IF EXISTS idx_print_configs_company_id;

-- Remover tabela
DROP TABLE IF EXISTS public.print_configs;