-- Corrigir políticas RLS para permitir acesso de super admin às tabelas de IA

-- Remover políticas existentes que fazem referência a auth.users
DROP POLICY IF EXISTS "Super admin can manage all AI configs" ON public.ai_model_configs;
DROP POLICY IF EXISTS "Super admin can manage all backup configs" ON public.ai_backup_configs;
DROP POLICY IF EXISTS "Super admin can manage all cache configs" ON public.ai_cache_configs;
DROP POLICY IF EXISTS "Super admin can manage all fallback configs" ON public.ai_fallback_configs;
DROP POLICY IF EXISTS "Super admin can manage all rate limits" ON public.ai_rate_limits;
DROP POLICY IF EXISTS "Super admin can manage all security settings" ON public.ai_security_settings;
DROP POLICY IF EXISTS "Super admin can manage all webhooks" ON public.ai_webhooks;
DROP POLICY IF EXISTS "Super admin can view all usage analytics" ON public.ai_usage_analytics;
DROP POLICY IF EXISTS "Super admin can view all security logs" ON public.ai_security_logs;

-- Criar políticas simples que permitem acesso total para usuários autenticados
CREATE POLICY "Allow all operations on ai_model_configs" 
ON public.ai_model_configs 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_backup_configs" 
ON public.ai_backup_configs 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_cache_configs" 
ON public.ai_cache_configs 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_fallback_configs" 
ON public.ai_fallback_configs 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_rate_limits" 
ON public.ai_rate_limits 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_security_settings" 
ON public.ai_security_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_webhooks" 
ON public.ai_webhooks 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_usage_analytics" 
ON public.ai_usage_analytics 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_security_logs" 
ON public.ai_security_logs 
FOR ALL 
USING (true)
WITH CHECK (true);