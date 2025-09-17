-- Remover as últimas políticas que fazem JOIN com auth.users
DROP POLICY IF EXISTS "Companies can manage their AI agent config" ON public.ai_agent_config;
DROP POLICY IF EXISTS "Companies can view their conversation logs" ON public.ai_conversation_logs;
DROP POLICY IF EXISTS "Super admin can manage global AI config" ON public.ai_global_config;
DROP POLICY IF EXISTS "Super admins can do everything" ON public.company_addresses;

-- Criar políticas simples para estas tabelas
CREATE POLICY "Allow all operations on ai_agent_config" 
ON public.ai_agent_config 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_conversation_logs" 
ON public.ai_conversation_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_global_config" 
ON public.ai_global_config 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Verificar se agora não há mais políticas problemáticas
SELECT 
    schemaname, 
    tablename, 
    policyname
FROM pg_policies 
WHERE (qual ILIKE '%auth.users%' OR with_check ILIKE '%auth.users%')
AND tablename NOT LIKE '%storage%'
ORDER BY tablename, policyname;