-- 🗑️ REMOÇÃO: Limpar completamente Mercado Pago + Corrigir Asaas

-- ==============================================
-- REMOVER TABELAS DO MERCADO PAGO COMPLETAMENTE
-- ==============================================

-- Verificar se há dados antes de remover
DO $$
DECLARE
    mp_config_count INTEGER;
    mp_payments_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mp_config_count FROM mercado_pago_config;
    SELECT COUNT(*) INTO mp_payments_count FROM mercado_pago_payments;
    
    RAISE NOTICE '📊 DADOS MERCADO PAGO ANTES DA REMOÇÃO:';
    RAISE NOTICE '  - mercado_pago_config: % registros', mp_config_count;
    RAISE NOTICE '  - mercado_pago_payments: % registros', mp_payments_count;
END $$;

-- Remover tabelas do Mercado Pago
DROP TABLE IF EXISTS public.mercado_pago_payments CASCADE;
DROP TABLE IF EXISTS public.mercado_pago_config CASCADE;

-- Remover funções relacionadas ao Mercado Pago se existirem
DROP FUNCTION IF EXISTS public.update_mercado_pago_config_updated_at() CASCADE;

-- ==============================================
-- CORRIGIR POLÍTICAS CRÍTICAS DO ASAAS
-- ==============================================

-- REMOVER política perigosa que expõe credenciais de todas as empresas
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.asaas_config;

-- Criar políticas seguras baseadas em empresa
CREATE POLICY "Company users can view their Asaas config"
ON public.asaas_config
FOR SELECT
TO authenticated
USING (company_id = get_user_company_id());

CREATE POLICY "Company users can insert their Asaas config"
ON public.asaas_config
FOR INSERT
TO authenticated
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company users can update their Asaas config"
ON public.asaas_config
FOR UPDATE
TO authenticated
USING (company_id = get_user_company_id())
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company users can delete their Asaas config"
ON public.asaas_config
FOR DELETE
TO authenticated
USING (company_id = get_user_company_id());

-- ==============================================
-- VERIFICAÇÃO FINAL
-- ==============================================

DO $$
DECLARE
    asaas_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO asaas_count FROM asaas_config;
    
    RAISE NOTICE '✅ LIMPEZA MERCADO PAGO CONCLUÍDA';
    RAISE NOTICE '🗑️ Tabelas mercado_pago_* removidas';
    RAISE NOTICE '🗑️ Funções relacionadas removidas';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 ASAAS SEGURO APLICADO';
    RAISE NOTICE '📊 Configurações Asaas: % registros', asaas_count;
    RAISE NOTICE '✅ Políticas baseadas em empresa aplicadas';
    RAISE NOTICE '⚠️ Credenciais agora protegidas por empresa';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Verificar edge functions que usavam Mercado Pago';
    RAISE NOTICE '2. Migrar credenciais Asaas para Supabase Secrets';
    RAISE NOTICE '3. Proteger company_credentials e whatsapp_integrations';
END $$;