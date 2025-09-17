-- 💰 GERAR 5% DE CASHBACK PARA PEDIDOS DE HOJE
-- Data: 2025-01-27
-- Objetivo: Gerar cashback de 5% para todos os pedidos de hoje que ainda não geraram

-- ================================
-- PASSO 1: VERIFICAR PEDIDOS DE HOJE SEM CASHBACK
-- ================================

-- Identificar pedidos de hoje que ainda não geraram cashback
WITH pedidos_hoje_sem_cashback AS (
    SELECT 
        p.id,
        p.numero_pedido,
        p.company_id,
        p.nome as customer_name,
        p.telefone as customer_phone,
        p.total,
        p.created_at,
        -- Calcular 5% de cashback
        ROUND((p.total * 0.05)::numeric, 2) as cashback_value
    FROM pedidos p
    WHERE 
        -- Pedidos de hoje
        DATE(p.created_at) = CURRENT_DATE
        -- Apenas pedidos confirmados/analise
        AND p.status IN ('analise', 'producao', 'pronto', 'entregue')
        -- Que não têm transação de cashback ainda
        AND NOT EXISTS (
            SELECT 1 
            FROM cashback_transactions ct 
            WHERE ct.pedido_id = p.id 
            AND ct.tipo = 'credito'
        )
        -- Com valor positivo
        AND p.total > 0
)
SELECT 
    '🔍 PEDIDOS DE HOJE SEM CASHBACK' as info;

-- Mostrar pedidos que serão processados
SELECT 
    numero_pedido,
    customer_name,
    customer_phone,
    total,
    cashback_value,
    created_at
FROM pedidos_hoje_sem_cashback
ORDER BY created_at;

-- ================================
-- PASSO 2: GERAR CASHBACK PARA CADA PEDIDO
-- ================================

-- Função para gerar cashback de forma segura
DO $$
DECLARE
    pedido_record RECORD;
    cashback_result JSONB;
    total_processados INTEGER := 0;
    total_erros INTEGER := 0;
    total_cashback NUMERIC := 0;
BEGIN
    -- Processar cada pedido de hoje sem cashback
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
            -- Usar função segura para creditar cashback
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
                
                RAISE NOTICE '✅ Cashback gerado para pedido #%: R$ %', 
                    pedido_record.numero_pedido, 
                    pedido_record.cashback_value;
            ELSE
                total_erros := total_erros + 1;
                RAISE WARNING '❌ Erro ao gerar cashback para pedido #%: %', 
                    pedido_record.numero_pedido, 
                    cashback_result->>'error';
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            total_erros := total_erros + 1;
            RAISE WARNING '❌ Exceção ao processar pedido #%: %', 
                pedido_record.numero_pedido, 
                SQLERRM;
        END;
    END LOOP;
    
    -- Relatório final
    RAISE NOTICE '🎯 PROCESSAMENTO CONCLUÍDO:';
    RAISE NOTICE '   ✅ Pedidos processados: %', total_processados;
    RAISE NOTICE '   ❌ Erros: %', total_erros;
    RAISE NOTICE '   💰 Total cashback gerado: R$ %', total_cashback;
    
END $$;

-- ================================
-- PASSO 3: VERIFICAÇÃO FINAL
-- ================================

-- Verificar cashback gerado hoje
SELECT 
    '💰 CASHBACK GERADO HOJE' as info;

SELECT 
    COUNT(*) as total_transacoes,
    SUM(valor) as total_cashback,
    COUNT(DISTINCT customer_phone) as clientes_beneficiados,
    COUNT(DISTINCT pedido_id) as pedidos_processados
FROM cashback_transactions 
WHERE 
    tipo = 'credito'
    AND DATE(created_at) = CURRENT_DATE
    AND descricao LIKE '%Cashback automático 5%%';

-- Mostrar detalhes das transações
SELECT 
    '📋 DETALHES DAS TRANSAÇÕES' as info;

SELECT 
    ct.customer_name,
    ct.customer_phone,
    ct.valor as cashback_gerado,
    ct.descricao,
    ct.created_at
FROM cashback_transactions ct
WHERE 
    ct.tipo = 'credito'
    AND DATE(ct.created_at) = CURRENT_DATE
    AND ct.descricao LIKE '%Cashback automático 5%%'
ORDER BY ct.created_at;

-- ================================
-- PASSO 4: LOG DA OPERAÇÃO
-- ================================

-- Registrar log da operação
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', -- Domínio Pizzas
    'SYSTEM',
    'ADMIN',
    'CASHBACK AUTOMÁTICO: Gerado 5% de cashback para todos os pedidos de hoje que ainda não tinham cashback.',
    'cashback_auto_generation',
    NOW()
);

-- ================================
-- MENSAGEM DE SUCESSO
-- ================================

SELECT 
    '🎉 CASHBACK AUTOMÁTICO CONCLUÍDO!' as resultado,
    '5% de cashback foi gerado para todos os pedidos de hoje' as detalhes,
    NOW() as data_execucao;
