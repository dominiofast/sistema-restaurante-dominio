-- Verificar e corrigir as políticas RLS da tabela company_settings
-- O problema é que as políticas estão muito restritivas

-- Primeiro, remover as políticas existentes
DROP POLICY IF EXISTS "Users can insert their company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can update their company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can view their company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can delete their company settings" ON public.company_settings;

-- Criar políticas mais simples e funcionais
-- Para INSERT (permitir para usuários autenticados)
CREATE POLICY "Allow authenticated users to insert company settings"
ON public.company_settings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Para SELECT (permitir para usuários autenticados)
CREATE POLICY "Allow authenticated users to view company settings"
ON public.company_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Para UPDATE (permitir para usuários autenticados)
CREATE POLICY "Allow authenticated users to update company settings"
ON public.company_settings
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Para DELETE (permitir para usuários autenticados)
CREATE POLICY "Allow authenticated users to delete company settings"
ON public.company_settings
FOR DELETE
USING (auth.uid() IS NOT NULL);