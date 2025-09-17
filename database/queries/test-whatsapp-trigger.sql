-- SCRIPT DE TESTE PARA FUNÇÃO DE TRIGGER WHATSAPP OTIMIZADA
-- Execute este script após criar as tabelas de suporte e a função de trigger

-- 1. Verificar se as tabelas existem
SELECT 'VERIFICANDO ESTRUTURA...' as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_queue') 
        THEN '✅ notification_queue existe'
        ELSE '❌ notification_queue NÃO existe'
    END as tabela_queue;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') 
        THEN '✅ notification_logs existe'
        ELSE '❌ notification_logs NÃO existe'
    END as tabela_logs;

-- 2. Verificar se o trigger existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_whatsapp_notification' 
            AND event_object_table = 'pedido_itens'
        ) 
        THEN '✅ Trigger existe e está ativo'
        ELSE '❌ Trigger NÃO existe'
    END as status_trigger;

-- 3. Verificar se a função existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'send_whatsapp_notification_after_items'
        ) 
        THEN '✅ Função existe'
        ELSE '❌ Função NÃO existe'
    END as status_funcao;

-- 4. Buscar um pedido recente para teste
SELECT 'PEDIDOS RECENTES PARA TESTE:' as info;
SELECT 
    id,
    numero_pedido,
    nome,
    telefone,
    company_id,
    total,
    created_at
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Verificar integrações WhatsApp ativas
SELECT 'INTEGRAÇÕES WHATSAPP ATIVAS:' as info;
SELECT 
    company_id,
    instance_key,
    active,
    created_at
FROM whatsapp_integrations 
WHERE active = true
ORDER BY created_at DESC;

-- 6. Função de teste manual (sem inserir item real)
CREATE OR REPLACE FUNCTION test_whatsapp_trigger_simulation(p_pedido_id UUID)
RETURNS TABLE(
    status TEXT,
    message TEXT,
    details JSONB
) AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_total_itens INTEGER;
    v_phone_clean TEXT;
BEGIN
    -- Verificar se o pedido existe
    SELECT p.*, c.name as company_name, c.id as company_uuid
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = p_pedido_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            'ERROR'::TEXT,
            'Pedido não encontrado'::TEXT,
            jsonb_build_object('pedido_id', p_pedido_id);
        RETURN;
    END IF;
    
    -- Verificar quantos itens tem
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens 
    WHERE pedido_id = p_pedido_id;
    
    -- Verificar telefone
    IF v_pedido_record.telefone IS NULL OR LENGTH(TRIM(v_pedido_record.telefone)) < 10 THEN
        RETURN QUERY SELECT 
            'ERROR'::TEXT,
            'Telefone inválido'::TEXT,
            jsonb_build_object(
                'telefone', v_pedido_record.telefone,
                'pedido_id', p_pedido_id
            );
        RETURN;
    END IF;
    
    v_phone_clean := REGEXP_REPLACE(v_pedido_record.telefone, '[^0-9]', '', 'g');
    
    -- Verificar integração WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    AND active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            'ERROR'::TEXT,
            'Integração WhatsApp não encontrada'::TEXT,
            jsonb_build_object(
                'company_id', v_pedido_record.company_id,
                'pedido_id', p_pedido_id
            );
        RETURN;
    END IF;
    
    -- Retornar sucesso com detalhes
    RETURN QUERY SELECT 
        'SUCCESS'::TEXT,
        'Trigger funcionaria corretamente'::TEXT,
        jsonb_build_object(
            'pedido_id', p_pedido_id,
            'numero_pedido', v_pedido_record.numero_pedido,
            'cliente', v_pedido_record.nome,
            'telefone_original', v_pedido_record.telefone,
            'telefone_limpo', v_phone_clean,
            'total_itens', v_total_itens,
            'company_id', v_pedido_record.company_id,
            'whatsapp_instance', v_whatsapp_integration.instance_key,
            'total_pedido', v_pedido_record.total
        );
    
END;
$$ LANGUAGE plpgsql;

-- 7. Instruções para teste
SELECT '🧪 COMO TESTAR:' as instrucoes;
SELECT '1. Execute: SELECT * FROM test_whatsapp_trigger_simulation(''UUID_DO_PEDIDO'');' as passo_1;
SELECT '2. Para teste real, insira um item: INSERT INTO pedido_itens (...);' as passo_2;
SELECT '3. Verifique os logs: SELECT * FROM notification_logs ORDER BY created_at DESC;' as passo_3;
SELECT '4. Verifique a queue: SELECT * FROM notification_queue ORDER BY created_at DESC;' as passo_4;

-- 8. Exemplo de como executar teste de simulação
SELECT 'EXEMPLO DE TESTE (substitua o UUID):' as exemplo;
SELECT 'SELECT * FROM test_whatsapp_trigger_simulation((SELECT id FROM pedidos ORDER BY created_at DESC LIMIT 1));' as comando_exemplo;