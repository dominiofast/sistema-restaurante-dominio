-- 💰 CASHBACK 5% RÁPIDO PARA PEDIDOS DE HOJE
-- Execute este script no SQL Editor do Supabase

-- ================================
-- CASHBACK RÁPIDO - EXECUTAR AGORA
-- ================================

-- 1. Verificar pedidos de hoje sem cashback
SELECT 
    '🔍 PEDIDOS DE HOJE SEM CASHBACK' as info;

SELECT 
    p.numero_pedido,
    p.nome as cliente,
    p.telefone,
    p.total,
    ROUND((p.total * 0.05)::numeric, 2) as cashback_5_porcento,
    p.created_at
FROM pedidos p
WHERE 
    DATE(p.created_at) = CURRENT_DATE
    AND p.status IN ('analise', 'producao', 'pronto', 'entregue')
    AND NOT EXISTS (
        SELECT 1 
        FROM cashback_transactions ct 
        WHERE ct.pedido_id = p.id 
        AND ct.tipo = 'credito'
    )
    AND p.total > 0
ORDER BY p.created_at;

-- 2. Gerar cashback para cada pedido
DO $$
DECLARE
    pedido_record RECORD;
    cashback_result JSONB;
    total_processados INTEGER := 0;
    total_cashback NUMERIC := 0;
BEGIN
    FOR pedido_record IN 
        SELECT 
            p.id,
            p.numero_pedido,
            p.company_id,
            p.nome as customer_name,
            p.telefone as customer_phone,
            p.total,
            ROUND((p.total * 0.05)::numeric, 2) as cashback_value
        FROM pedidos p
        WHERE 
            DATE(p.created_at) = CURRENT_DATE
            AND p.status IN ('analise', 'producao', 'pronto', 'entregue')
            AND NOT EXISTS (
                SELECT 1 
                FROM cashback_transactions ct 
                WHERE ct.pedido_id = p.id 
                AND ct.tipo = 'credito'
            )
            AND p.total > 0
    LOOP
        BEGIN
            -- Gerar cashback usando função segura
            SELECT * INTO cashback_result
            FROM safe_credit_cashback(
                pedido_record.company_id,
                pedido_record.customer_phone,
                pedido_record.customer_name,
                pedido_record.cashback_value,
                'Cashback automático 5% - Pedido #' || pedido_record.numero_pedido,
                pedido_record.id,
                'cashback_auto_' || pedido_record.company_id || '_' || pedido_record.id
            );
            
            IF cashback_result->>'success' = 'true' THEN
                total_processados := total_processados + 1;
                total_cashback := total_cashback + pedido_record.cashback_value;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Continuar com próximo pedido em caso de erro
            NULL;
        END;
    END LOOP;
    
    RAISE NOTICE '✅ Processados % pedidos, total cashback: R$ %', total_processados, total_cashback;
END $$;

-- 3. Verificar resultado
SELECT 
    '💰 CASHBACK GERADO HOJE' as status,
    COUNT(*) as total_transacoes,
    SUM(valor) as total_cashback,
    COUNT(DISTINCT customer_phone) as clientes_beneficiados
FROM cashback_transactions 
WHERE 
    tipo = 'credito'
    AND DATE(created_at) = CURRENT_DATE
    AND descricao LIKE '%Cashback automático 5%%';

-- 4. Mensagem de sucesso
SELECT 
    '🎉 CASHBACK 5% CONCLUÍDO!' as resultado,
    NOW() as data_execucao;
