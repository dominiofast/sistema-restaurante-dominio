-- 🔧 REINSTALAÇÃO CORRIGIDA DO SISTEMA WHATSAPP
-- Esta versão corrige problemas de compatibilidade com a estrutura existente

SELECT '🔧 REINSTALAÇÃO CORRIGIDA DO SISTEMA WHATSAPP' as titulo;
SELECT '═══════════════════════════════════════════════' as separador;

-- ============================================================================
-- PASSO 1: LIMPEZA TOTAL (MAIS AGRESSIVA)
-- ============================================================================

SELECT '🧹 LIMPEZA TOTAL...' as status;

-- Remover TODOS os triggers relacionados a WhatsApp
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'pedido_itens'
        AND trigger_name LIKE '%whatsapp%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON pedido_itens CASCADE';
        RAISE NOTICE 'Removido trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Remover funções antigas
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

SELECT '✅ Limpeza total concluída!' as resultado_limpeza;

-- ============================================================================
-- PASSO 2: DESCOBRIR ESTRUTURA REAL DA TABELA WHATSAPP_INTEGRATIONS
-- ============================================================================

SELECT '🔍 DESCOBRINDO ESTRUTURA REAL...' as status;

-- Ver estrutura da tabela whatsapp_integrations
SELECT 
    column_name,
    data_type,
    is_nullable,
    'Coluna encontrada' as status
FROM information_schema.columns 
WHERE table_name = 'whatsapp_integrations'
ORDER BY ordinal_position;

-- ============================================================================
-- PASSO 3: CRIAR TABELAS DE SUPORTE (SE NÃO EXISTIREM)
-- ============================================================================

SELECT '📋 CRIANDO TABELAS DE SUPORTE...' as status;

-- Tabela para queue de notificações assíncronas
CREATE TABLE IF NOT EXISTS notification_queue (
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

-- Tabela para logs detalhados
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_notification_queue_pedido_id ON notification_queue (pedido_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_pedido_id ON notification_logs (pedido_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs (created_at DESC);

SELECT '✅ Tabelas de suporte criadas!' as resultado_tabelas;

-- ============================================================================
-- PASSO 4: CRIAR FUNÇÃO COMPATÍVEL (SEM USAR COLUNA 'ACTIVE')
-- ============================================================================

SELECT '⚙️ CRIANDO FUNÇÃO COMPATÍVEL...' as status;

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
    -- Log de execução do trigger
    RAISE NOTICE '[WHATSAPP_TRIGGER] ===== EXECUTANDO PARA PEDIDO_ID: % =====', NEW.pedido_id;
    
    -- Controle de duplicação: só executa no primeiro item do pedido
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens 
    WHERE pedido_id = NEW.pedido_id;
    
    RAISE NOTICE '[WHATSAPP_TRIGGER] Total de itens no pedido: %', v_total_itens;
    
    IF v_total_itens > 1 THEN
        RAISE NOTICE '[WHATSAPP_TRIGGER] Pulando envio - já existem % itens no pedido', v_total_itens;
        RETURN NEW;
    END IF;
    
    -- Buscar dados do pedido com informações da empresa
    SELECT p.*, c.name as company_name, c.id as company_uuid
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RAISE WARNING '[WHATSAPP_TRIGGER] Pedido não encontrado: %', NEW.pedido_id;
        RETURN NEW;
    END IF;
    
    RAISE NOTICE '[WHATSAPP_TRIGGER] Pedido encontrado: % - Cliente: %', v_pedido_record.numero_pedido, v_pedido_record.nome;
    
    -- Validar se o telefone existe e é válido
    IF v_pedido_record.telefone IS NULL OR LENGTH(TRIM(v_pedido_record.telefone)) < 10 THEN
        RAISE WARNING '[WHATSAPP_TRIGGER] Telefone inválido para pedido %: %', NEW.pedido_id, v_pedido_record.telefone;
        
        -- Log do erro
        BEGIN
            INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
            VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                    jsonb_build_object(
                        'error', 'invalid_phone',
                        'phone', v_pedido_record.telefone,
                        'trigger_executed', true
                    ), NOW());
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '[WHATSAPP_TRIGGER] Erro ao inserir log: %', SQLERRM;
        END;
        
        RETURN NEW;
    END IF;
    
    -- Limpar telefone (remover caracteres especiais)
    v_phone_clean := REGEXP_REPLACE(v_pedido_record.telefone, '[^0-9]', '', 'g');
    RAISE NOTICE '[WHATSAPP_TRIGGER] Telefone limpo: %', v_phone_clean;
    
    -- Buscar configuração WhatsApp da empresa (SEM USAR COLUNA 'ACTIVE')
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE WARNING '[WHATSAPP_TRIGGER] Integração WhatsApp não encontrada para empresa: %', v_pedido_record.company_id;
        
        -- Log do erro
        BEGIN
            INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
            VALUES (NEW.pedido_id, 'whatsapp_trigger', 'failed', 
                    jsonb_build_object(
                        'error', 'integration_not_found',
                        'company_id', v_pedido_record.company_id,
                        'trigger_executed', true
                    ), NOW());
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '[WHATSAPP_TRIGGER] Erro ao inserir log: %', SQLERRM;
        END;
        
        RETURN NEW;
    END IF;
    
    RAISE NOTICE '[WHATSAPP_TRIGGER] Integração WhatsApp encontrada: %', v_whatsapp_integration.instance_key;
    
    -- Montar lista de itens do pedido
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
    WHERE pi.pedido_id = NEW.pedido_id
    AND NOT (COALESCE(pi.nome_produto, p.name, '') ILIKE '%taxa%');
    
    -- Montar mensagem de confirmação
    v_message_text := 
        '🎉 *PEDIDO CONFIRMADO*' || E'\n\n' ||
        '📋 *Pedido:* ' || COALESCE(v_pedido_record.numero_pedido::text, 'N/A') || E'\n' ||
        '👤 *Cliente:* ' || COALESCE(v_pedido_record.nome, 'N/A') || E'\n' ||
        '📱 *Telefone:* ' || v_phone_clean || E'\n\n' ||
        '🛍️ *Itens:*' || E'\n' || COALESCE(v_itens_texto, 'Nenhum item encontrado') || E'\n\n' ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(v_pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
        '✅ Seu pedido foi recebido e está sendo preparado!' || E'\n' ||
        '⏰ Em breve você receberá atualizações sobre o status.';
    
    RAISE NOTICE '[WHATSAPP_TRIGGER] Mensagem preparada. Enviando para: %', v_phone_clean;
    
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
        
        RAISE NOTICE '[WHATSAPP_TRIGGER] Resposta da API: %', v_api_response;
        
        -- Verificar se a resposta indica sucesso
        IF v_api_response IS NOT NULL AND v_api_response NOT LIKE '%error%' THEN
            v_notification_sent := TRUE;
            RAISE NOTICE '[WHATSAPP_TRIGGER] ✅ NOTIFICAÇÃO ENVIADA COM SUCESSO!';
        ELSE
            v_notification_sent := FALSE;
            v_error_message := 'API response: ' || COALESCE(v_api_response, 'null');
            RAISE WARNING '[WHATSAPP_TRIGGER] ❌ Falha no envio - Response: %', v_api_response;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            v_notification_sent := FALSE;
            v_error_message := SQLERRM;
            RAISE WARNING '[WHATSAPP_TRIGGER] ❌ Erro na API WhatsApp: %', SQLERRM;
    END;
    
    -- Se falhou, adicionar à queue assíncrona (fallback)
    IF NOT v_notification_sent THEN
        BEGIN
            INSERT INTO notification_queue (pedido_id, type, status, payload, created_at)
            VALUES (
                NEW.pedido_id, 
                'whatsapp_order_confirmation', 
                'pending',
                jsonb_build_object(
                    'phone', v_phone_clean,
                    'message', v_message_text,
                    'company_id', v_pedido_record.company_id,
                    'trigger_failed', true,
                    'error', v_error_message
                ),
                NOW()
            );
            
            RAISE NOTICE '[WHATSAPP_TRIGGER] Adicionado à queue assíncrona devido à falha';
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '[WHATSAPP_TRIGGER] Erro ao adicionar à queue: %', SQLERRM;
        END;
    END IF;
    
    -- Log detalhado da operação
    BEGIN
        INSERT INTO notification_logs (pedido_id, type, status, details, created_at)
        VALUES (
            NEW.pedido_id, 
            'whatsapp_trigger', 
            CASE WHEN v_notification_sent THEN 'success' ELSE 'failed' END,
            jsonb_build_object(
                'trigger_executed', true,
                'sent', v_notification_sent,
                'phone', v_phone_clean,
                'company_id', v_pedido_record.company_id,
                'api_response', v_api_response,
                'error', v_error_message,
                'fallback_queued', NOT v_notification_sent
            ),
            NOW()
        );
        
        RAISE NOTICE '[WHATSAPP_TRIGGER] Log registrado com status: %', 
                     CASE WHEN v_notification_sent THEN 'success' ELSE 'failed' END;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '[WHATSAPP_TRIGGER] Erro ao inserir log detalhado: %', SQLERRM;
    END;
    
    RAISE NOTICE '[WHATSAPP_TRIGGER] ===== FIM DA EXECUÇÃO =====';
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log de erro crítico
        RAISE WARNING '[WHATSAPP_TRIGGER] ❌ ERRO CRÍTICO NO TRIGGER: %', SQLERRM;
        
        -- Tentar adicionar à queue mesmo com erro crítico
        BEGIN
            INSERT INTO notification_queue (pedido_id, type, status, payload, created_at)
            VALUES (
                NEW.pedido_id, 
                'whatsapp_order_confirmation', 
                'pending',
                jsonb_build_object(
                    'trigger_error', SQLERRM,
                    'company_id', COALESCE(v_pedido_record.company_id, 'unknown')
                ),
                NOW()
            );
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING '[WHATSAPP_TRIGGER] Falha crítica - não foi possível adicionar à queue: %', SQLERRM;
        END;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Função compatível criada!' as resultado_funcao;

-- ============================================================================
-- PASSO 5: CRIAR TRIGGER
-- ============================================================================

SELECT '🔗 CRIANDO TRIGGER...' as status;

CREATE TRIGGER trigger_whatsapp_notification
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

SELECT '✅ Trigger criado!' as resultado_trigger;

-- ============================================================================
-- PASSO 6: VERIFICAÇÃO FINAL
-- ============================================================================

SELECT '🔍 VERIFICAÇÃO FINAL...' as status;

-- Verificar se o trigger foi criado
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled as habilitado,
    '✅ ATIVO' as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND t.tgname = 'trigger_whatsapp_notification'
AND NOT t.tgisinternal;

-- Verificar tabelas criadas
SELECT 
    tablename,
    '✅ CRIADA' as status
FROM pg_tables 
WHERE tablename IN ('notification_queue', 'notification_logs')
ORDER BY tablename;

-- ============================================================================
-- RESULTADO FINAL
-- ============================================================================

SELECT '🎉 REINSTALAÇÃO CORRIGIDA CONCLUÍDA!' as resultado_final;
SELECT '🔧 CORREÇÕES APLICADAS:' as correcoes;
SELECT '• Removida dependência da coluna "active"' as correcao_1;
SELECT '• Logs mais detalhados com RAISE NOTICE' as correcao_2;
SELECT '• Limpeza mais agressiva de triggers antigos' as correcao_3;
SELECT '• Compatibilidade com estrutura existente' as correcao_4;

SELECT '🧪 TESTE AGORA:' as teste;
SELECT '1. Faça um novo pedido' as passo_1;
SELECT '2. Verifique os logs do PostgreSQL (aba Messages)' as passo_2;
SELECT '3. Execute: SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 3;' as passo_3;