-- CORREÇÃO ADICIONAL DE SEGURANÇA - Corrigir funções e configurações

-- 1. Corrigir search_path nas funções críticas para evitar ataques de injeção
-- Função principal de verificação de função
ALTER FUNCTION public.get_user_company_id() SET search_path = 'public', 'pg_temp';

-- Funções de criação e atualização
ALTER FUNCTION public.create_default_branding() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.create_default_delivery_methods() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.auto_create_prompt_for_company() SET search_path = 'public', 'pg_temp';

-- Funções de negócio críticas
ALTER FUNCTION public.process_cashback_for_order() SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.get_my_company_id() SET search_path = 'public', 'pg_temp';

-- Funções relacionadas a autenticação
ALTER FUNCTION public.check_login_rate_limit(text, text, integer, integer, integer) SET search_path = 'public', 'pg_temp';
ALTER FUNCTION public.check_email_rate_limit(text, text, integer, integer) SET search_path = 'public', 'pg_temp';

-- Funções de validação
ALTER FUNCTION public.validate_delivery_methods() SET search_path = 'public', 'pg_temp';

-- 2. Criar função segura para verificar papel do usuário (previne recursão RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'user'
  );
$$;

-- 3. Revogar acesso público desnecessário em tabelas sensíveis
-- Remover acesso público geral em tabelas que só devem ser acessadas por empresas
REVOKE ALL ON public.clientes FROM anon;
REVOKE ALL ON public.customer_addresses FROM anon;
REVOKE ALL ON public.whatsapp_messages FROM anon;
REVOKE ALL ON public.whatsapp_chats FROM anon;

-- 4. Garantir que tabelas financeiras tenham RLS habilitado
ALTER TABLE public.caixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_lancamentos ENABLE ROW LEVEL SECURITY;

-- Política para caixas: apenas usuários autenticados da empresa
CREATE POLICY "Company users can manage their cash registers" ON public.caixas
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Política para lançamentos do caixa
CREATE POLICY "Company users can manage their cash transactions" ON public.caixa_lancamentos
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- 5. Proteger dados de configuração de pagamento
-- Política mais restritiva para configurações de pagamento
DROP POLICY IF EXISTS "Company users can select payment_delivery_config" ON public.payment_delivery_config;
DROP POLICY IF EXISTS "Company users can update payment_delivery_config" ON public.payment_delivery_config;

CREATE POLICY "Company users can manage payment config" ON public.payment_delivery_config
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

-- Permitir acesso público apenas para leitura de config de empresas ativas (para cardápio)
CREATE POLICY "Public can view active company payment config" ON public.payment_delivery_config
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE status = 'active'
        )
    );