-- 🗑️ LIMPEZA FINAL: Remover funções RPC do Mercado Pago

-- ==============================================
-- REMOVER FUNÇÕES RPC DO MERCADO PAGO
-- ==============================================

-- Remover todas as funções relacionadas ao Mercado Pago
DROP FUNCTION IF EXISTS public.create_mercado_pago_pix(numeric, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_mercado_pago_payment(text) CASCADE; 
DROP FUNCTION IF EXISTS public.debug_mercado_pago_pix(numeric, text) CASCADE;

-- Verificar se há outras funções com 'mercado_pago' no nome
DO $$
DECLARE
    func_record RECORD;
    functions_found INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO FUNÇÕES MERCADO PAGO RESTANTES:';
    
    FOR func_record IN 
        SELECT schemaname, functionname, returntype
        FROM pg_functions 
        WHERE functionname ILIKE '%mercado_pago%'
    LOOP
        RAISE NOTICE '  ⚠️  Função encontrada: %.%() - %', 
            func_record.schemaname, 
            func_record.functionname, 
            func_record.returntype;
        functions_found := functions_found + 1;
    END LOOP;
    
    IF functions_found = 0 THEN
        RAISE NOTICE '✅ Nenhuma função do Mercado Pago encontrada';
    ELSE
        RAISE NOTICE '⚠️ % função(ões) ainda encontrada(s)', functions_found;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 PRÓXIMOS PROBLEMAS CRÍTICOS:';
    RAISE NOTICE '1. company_credentials - senhas expostas';
    RAISE NOTICE '2. whatsapp_integrations - tokens WhatsApp expostos';
    RAISE NOTICE '3. Migrar credenciais Asaas para Supabase Secrets';
END $$;