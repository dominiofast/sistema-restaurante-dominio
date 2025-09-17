-- Testar trigger com pedido existente (se houver)
-- Primeiro verificar se há pedidos em análise
DO $$
DECLARE
    pedido_teste RECORD;
BEGIN
    -- Buscar um pedido em análise
    SELECT * INTO pedido_teste
    FROM pedidos 
    WHERE status = 'analise'
    LIMIT 1;
    
    IF FOUND THEN
        -- Atualizar para produção para testar trigger
        UPDATE pedidos 
        SET status = 'producao', updated_at = NOW()
        WHERE id = pedido_teste.id;
        
        RAISE NOTICE 'Pedido % atualizado para produção para teste do trigger', pedido_teste.id;
    ELSE
        -- Se não há pedidos em análise, criar log indicando isso
        INSERT INTO ai_conversation_logs (
            company_id,
            customer_phone,
            customer_name,
            message_content,
            message_type,
            created_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'SYSTEM',
            'TESTE SISTEMA',
            'TESTE TRIGGER: Não há pedidos em análise para testar',
            'debug_trigger_test',
            now()
        );
    END IF;
END $$;