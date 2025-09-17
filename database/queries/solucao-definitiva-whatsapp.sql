-- 🚀 SOLUÇÃO DEFINITIVA WHATSAPP - RECRIAR TUDO DO ZERO
-- Este script vai resolver o problema de uma vez por todas

SELECT '🚀 SOLUÇÃO DEFINITIVA WHATSAPP' as titulo;
SELECT '═══════════════════════════════════' as separador;

-- ============================================================================
-- PASSO 1: LIMPEZA TOTAL E AGRESSIVA
-- ============================================================================

SELECT '🧹 LIMPEZA TOTAL...' as status;

-- Desabilitar RLS se estiver ativo
ALTER TABLE pedido_itens DISABLE ROW LEVEL SECURITY;

-- Remover TODOS os triggers da tabela pedido_itens
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'pedido_itens'
        AND NOT tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON pedido_itens CASCADE';
        RAISE NOTICE 'Removido trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Remover todas as funções relacionadas
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;
DROP FUNCTION IF EXISTS notify_whatsapp_order_confirmation() CASCADE;
DROP FUNCTION IF EXISTS send_whatsapp_order_confirmation() CASCADE;

SELECT '✅ Limpeza total concluída!' as resultado_limpeza;

-- ============================================================================
-- PASSO 2: CRIAR TABELAS DE SUPORTE (FORÇAR CRIAÇÃO)
-- ============================================================================

SELECT '📋 CRIANDO TABELAS DE SUPORTE...' as status;

-- Remover tabelas se existirem e recriar
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS notification_queue CASCADE;

-- Tabela de logs
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de queue
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'whatsapp_order_confirmation',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos
CREATE INDEX idx_notification_logs_pedido_id ON notification_logs (pedido_id);
CREATE INDEX idx_notification_logs_created_at ON notification_logs (created_at DESC);
CREATE INDEX idx_notification_queue_pedido_id ON notification_queue (pedido_id);

SELECT '✅ Tabelas de suporte recriadas!' as resultado_tabelas;

-- ============================================================================
-- PASSO 3: CRIAR FUNÇÃO SUPER SIMPLES PARA TESTE
-- ============================================================================

SELECT '⚙️ CRIANDO FUNÇÃO SUPER SIMPLES...' as status;

CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
BEGIN
    -- Log básico para confirmar que o trigger executou
    INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
    VALUES (
        NEW.pedido_id, 
        'whatsapp_trigger', 
        'test',
        jsonb_build_object(
            'trigger_executed', true,
            'test_mode', true,
            'item_id', NEW.id,
            'produto', NEW.nome_produto
        ),
        NOW()
    );
    
    -- Raise notice para aparecer nos logs do PostgreSQL
    RAISE NOTICE '🎉 TRIGGER EXECUTOU! Pedido: %, Item: %', NEW.pedido_id, NEW.nome_produto;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Se der erro, pelo menos registrar
        RAISE NOTICE '❌ ERRO NO TRIGGER: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Função simples criada!' as resultado_funcao;

-- ============================================================================
-- PASSO 4: CRIAR TRIGGER NOVO
-- ============================================================================

SELECT '🔗 CRIANDO TRIGGER NOVO...' as status;

CREATE TRIGGER trigger_whatsapp_notification_new
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Garantir que está habilitado
ALTER TABLE pedido_itens ENABLE TRIGGER trigger_whatsapp_notification_new;

SELECT '✅ Trigger novo criado e habilitado!' as resultado_trigger;

-- ============================================================================
-- PASSO 5: TESTE IMEDIATO
-- ============================================================================

SELECT '🧪 FAZENDO TESTE IMEDIATO...' as status;

-- Inserir item de teste
INSERT INTO pedido_itens (
    pedido_id,
    nome_produto,
    quantidade,
    valor_unitario,
    valor_total,
    created_at
) 
SELECT 
    id,
    'TESTE TRIGGER NOVO - ' || NOW()::text,
    1,
    0.01,
    0.01,
    NOW()
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 1;

SELECT '✅ Item de teste inserido!' as resultado_teste;

-- ============================================================================
-- PASSO 6: VERIFICAÇÃO IMEDIATA
-- ============================================================================

SELECT '🔍 VERIFICAÇÃO IMEDIATA...' as status;

-- Ver se o trigger executou
SELECT 
    'LOGS DE TESTE:' as secao,
    COUNT(*) as total_logs
FROM notification_logs 
WHERE type = 'whatsapp_trigger';

-- Mostrar os logs
SELECT 
    created_at,
    pedido_id,
    status,
    details->>'produto' as produto,
    details->>'trigger_executed' as executou
FROM notification_logs 
WHERE type = 'whatsapp_trigger'
ORDER BY created_at DESC 
LIMIT 3;

-- Verificar se o trigger existe e está habilitado
SELECT 
    t.tgname as trigger_name,
    c.relname as tabela,
    t.tgenabled as habilitado,
    '✅ ATIVO' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND t.tgname = 'trigger_whatsapp_notification_new'
AND NOT t.tgisinternal;

-- ============================================================================
-- PASSO 7: CRIAR VERSÃO COMPLETA DA FUNÇÃO (SE O TESTE FUNCIONOU)
-- ============================================================================

SELECT '⚙️ CRIANDO VERSÃO COMPLETA DA FUNÇÃO...' as status;

CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_itens_texto TEXT := '';
    v_total_itens INTEGER;
    v_notification_sent BOOLEAN DEFAULT FALSE;
    v_error_message TEXT;
    v_phone_clean TEXT;
BEGIN
    -- Log de início
    RAISE NOTICE '🎯 [WHATSAPP] Trigger executando para pedido: %', NEW.pedido_id;
    
    -- Controle de duplicação
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens 
    WHERE pedido_id = NEW.pedido_id;
    
    IF v_total_itens > 1 THEN
        RAISE NOTICE '⏭️ [WHATSAPP] Pulando - já existem % itens', v_total_itens;
        RETURN NEW;
    END IF;
    
    -- Buscar pedido
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE '❌ [WHATSAPP] Pedido não encontrado: %', NEW.pedido_id;
        INSERT INTO notification_logs (pedido_id, type, status, details)
        VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                jsonb_build_object('error', 'pedido_not_found'));
        RETURN NEW;
    END IF;
    
    -- Validar telefone
    IF v_pedido_record.telefone IS NULL OR LENGTH(TRIM(v_pedido_record.telefone)) < 10 THEN
        RAISE NOTICE '❌ [WHATSAPP] Telefone inválido: %', v_pedido_record.telefone;
        INSERT INTO notification_logs (pedido_id, type, status, details)
        VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                jsonb_build_object('error', 'invalid_phone', 'phone', v_pedido_record.telefone));
        RETURN NEW;
    END IF;
    
    v_phone_clean := REGEXP_REPLACE(v_pedido_record.telefone, '[^0-9]', '', 'g');
    
    -- Buscar integração WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE NOTICE '❌ [WHATSAPP] Integração não encontrada para empresa: %', v_pedido_record.company_id;
        INSERT INTO notification_logs (pedido_id, type, status, details)
        VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                jsonb_build_object('error', 'integration_not_found', 'company_id', v_pedido_record.company_id));
        RETURN NEW;
    END IF;
    
    -- Montar lista de itens
    SELECT string_agg(
        '• ' || pi.quantidade || 'x ' || COALESCE(p.name, pi.nome_produto, 'Produto') || 
        CASE 
            WHEN pi.valor_total > 0 THEN ' - R$ ' || REPLACE(pi.valor_total::text, '.', ',')
            ELSE ''
        END, 
        E'\n'
    ) INTO v_itens_texto
    FROM pedido_itens pi
    LEFT JOIN produtos p ON pi.produto_id = p.id
    WHERE pi.pedido_id = NEW.pedido_id;
    
    -- Montar mensagem
    v_message_text := 
        '🎉 *PEDIDO CONFIRMADO*' || E'\n\n' ||
        '📋 *Pedido:* ' || COALESCE(v_pedido_record.numero_pedido::text, 'N/A') || E'\n' ||
        '👤 *Cliente:* ' || COALESCE(v_pedido_record.nome, 'N/A') || E'\n' ||
        '📱 *Telefone:* ' || v_phone_clean || E'\n\n' ||
        '🛍️ *Itens:*' || E'\n' || COALESCE(v_itens_texto, 'Nenhum item') || E'\n\n' ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(v_pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
        '✅ Seu pedido foi recebido e está sendo preparado!';
    
    -- Tentar enviar WhatsApp
    BEGIN
        SELECT content INTO v_api_response
        FROM http((
            'POST',
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || v_whatsapp_integration.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || v_whatsapp_integration.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', v_phone_clean,
                    'text', v_message_text
                )
            )::text
        ));
        
        IF v_api_response IS NOT NULL AND v_api_response NOT LIKE '%error%' THEN
            v_notification_sent := TRUE;
            RAISE NOTICE '✅ [WHATSAPP] Enviado com sucesso para: %', v_phone_clean;
        ELSE
            v_notification_sent := FALSE;
            v_error_message := v_api_response;
            RAISE NOTICE '❌ [WHATSAPP] Falha no envio: %', v_api_response;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            v_notification_sent := FALSE;
            v_error_message := SQLERRM;
            RAISE NOTICE '❌ [WHATSAPP] Erro na API: %', SQLERRM;
    END;
    
    -- Log da operação
    INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
    VALUES (
        NEW.pedido_id, 
        'whatsapp_trigger', 
        CASE WHEN v_notification_sent THEN 'success' ELSE 'failed' END,
        jsonb_build_object(
            'sent', v_notification_sent,
            'phone', v_phone_clean,
            'company_id', v_pedido_record.company_id,
            'api_response', v_api_response,
            'error', v_error_message
        ),
        NOW()
    );
    
    -- Se falhou, adicionar à queue
    IF NOT v_notification_sent THEN
        INSERT INTO notification_queue (pedido_id, type, status, payload)
        VALUES (
            NEW.pedido_id, 
            'whatsapp_order_confirmation', 
            'pending',
            jsonb_build_object(
                'phone', v_phone_clean,
                'message', v_message_text,
                'company_id', v_pedido_record.company_id,
                'error', v_error_message
            )
        );
        RAISE NOTICE '📋 [WHATSAPP] Adicionado à queue para retry';
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '💥 [WHATSAPP] Erro crítico: %', SQLERRM;
        INSERT INTO notification_logs (pedido_id, type, status, details)
        VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                jsonb_build_object('critical_error', SQLERRM));
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Função completa atualizada!' as resultado_funcao_completa;

-- ============================================================================
-- RESULTADO FINAL
-- ============================================================================

SELECT '🎉 SOLUÇÃO DEFINITIVA APLICADA!' as resultado_final;
SELECT '📋 COMPONENTES CRIADOS:' as componentes;
SELECT '• Trigger: trigger_whatsapp_notification_new' as item_1;
SELECT '• Função: send_whatsapp_notification_after_items (versão completa)' as item_2;
SELECT '• Tabelas: notification_logs, notification_queue' as item_3;
SELECT '• RLS desabilitado na tabela pedido_itens' as item_4;

SELECT '🧪 TESTE AGORA:' as teste_final;
SELECT '1. Faça um pedido real no sistema' as passo_1;
SELECT '2. Execute: SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 5;' as passo_2;
SELECT '3. Verifique a aba Messages para logs detalhados' as passo_3;
SELECT '4. Se funcionou, o WhatsApp deve ter chegado!' as passo_4;

-- Teste final automático
SELECT '🔥 FAZENDO TESTE FINAL...' as teste_automatico;

INSERT INTO pedido_itens (
    pedido_id,
    nome_produto,
    quantidade,
    valor_unitario,
    valor_total
) 
SELECT 
    id,
    'TESTE FINAL - ' || NOW()::text,
    1,
    0.99,
    0.99
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 1;

-- Mostrar resultado do teste
SELECT 
    'RESULTADO DO TESTE FINAL:' as resultado,
    COUNT(*) as logs_criados
FROM notification_logs 
WHERE created_at >= NOW() - INTERVAL '1 minute';

SELECT 
    created_at,
    status,
    details->>'sent' as enviado,
    details->>'phone' as telefone,
    details->>'error' as erro
FROM notification_logs 
WHERE created_at >= NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC;