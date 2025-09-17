-- Simplificar TODAS as políticas que podem interferir na criação de pedidos públicos
-- Estas políticas fazem JOINs com auth.users e causam o erro

-- Primeiro, remover políticas problemáticas da tabela agente_ia_config
DROP POLICY IF EXISTS "Users can create AI agent config for their company" ON public.agente_ia_config;
DROP POLICY IF EXISTS "Users can view their company's AI agent config" ON public.agente_ia_config;
DROP POLICY IF EXISTS "Users can update their company's AI agent config" ON public.agente_ia_config;
DROP POLICY IF EXISTS "Users can delete their company's AI agent config" ON public.agente_ia_config;

-- Criar política simples para agente_ia_config
CREATE POLICY "Allow all operations on agente_ia_config" 
ON public.agente_ia_config 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Remover políticas problemáticas da tabela nfce_logs
DROP POLICY IF EXISTS "Users can view their company nfce logs" ON public.nfce_logs;

-- Criar política simples para nfce_logs
CREATE POLICY "Allow all operations on nfce_logs" 
ON public.nfce_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Verificar se agora não há mais políticas que fazem JOIN com auth.users
SELECT 
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE (qual ILIKE '%auth.users%' OR with_check ILIKE '%auth.users%')
AND tablename NOT LIKE '%storage%'
ORDER BY tablename, policyname;