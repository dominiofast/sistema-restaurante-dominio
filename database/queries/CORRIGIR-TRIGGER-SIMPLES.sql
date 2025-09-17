-- =====================================================
-- CORREÇÃO: TRIGGER WHATSAPP SIMPLES E FUNCIONAL
-- =====================================================

-- 1. REMOVER TRIGGER E FUNÇÃO ATUAIS
DROP TRIGGER IF EXISTS trigger_whatsapp_completo_final ON pedido_itens;
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- 2. CRIAR FUNÇÃO SIMPLES E TESTADA
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_itens_texto TEXT := '';
    v_api_response TEXT;
    v_total_itens INTEGER;
BEGIN
    -- Verificar se é o primeiro item do pedido (evitar duplicação)
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens
    WHERE pedido_id = NEW.pedido_id;
    
    IF v_total_itens > 1 THEN
        RETURN NEW; -- Não é o primeiro item
    END IF;
    
    -- Buscar dados do pedido
    SELECT 
        p.id,
        p.numero_pedido,
        p.nome as nome_cliente,
        p.telefone,
        p.tipo as tipo_pedido,
        p.total as valor_total,
        p.observacoes
    INTO v_pedido_record
    FROM pedidos p
    WHERE p.id = NEW.pedido_id;
    
    -- Buscar integração WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations
    WHERE company_id = (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id)
    AND purpose = 'orders'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_whatsapp_integration IS NULL THEN
        RAISE NOTICE 'Integração WhatsApp não encontrada';
        RETURN NEW;
    END IF;
    
    -- Buscar itens do pedido
    SELECT string_agg(
        pi.quantidade || 'x ' || p.nome || ' - R$ ' || REPLACE(pi.valor_total::text, '.', ','),
        E'\n'
    ) INTO v_itens_texto
    FROM pedido_itens pi
    JOIN produtos p ON p.id = pi.produto_id
    WHERE pi.pedido_id = NEW.pedido_id;
    
    -- Montar mensagem simples
    v_message_text := 
        '🎉 *PEDIDO CONFIRMADO*' || E'\n\n' ||
        '📋 *Pedido:* ' || v_pedido_record.numero_pedido || E'\n' ||
        '👤 *Cliente:* ' || v_pedido_record.nome_cliente || E'\n' ||
        '📱 *Telefone:* ' || v_pedido_record.telefone || E'\n' ||
        '🚚 *Tipo:* ' || 
        CASE 
            WHEN v_pedido_record.tipo_pedido = 'delivery' THEN 'Entrega'
            WHEN v_pedido_record.tipo_pedido = 'pickup' THEN 'Retirada'
            ELSE 'Balcão'
        END || E'\n\n' ||
        '🛍 *Itens:*' || E'\n' || v_itens_texto || E'\n';
    
    -- Forma de pagamento não disponível na tabela pedidos
    -- Será adicionada posteriormente quando a coluna for criada
    
    -- Adicionar observações se existirem
    IF v_pedido_record.observacoes IS NOT NULL AND v_pedido_record.observacoes != '' THEN
        v_message_text := v_message_text || '📝 *Observações:* ' || v_pedido_record.observacoes || E'\n';
    END IF;
    
    v_message_text := v_message_text || 
        E'\n💰 *TOTAL: R$ ' || REPLACE(v_pedido_record.valor_total::text, '.', ',') || '*' || E'\n\n' ||
        '✅ Seu pedido foi recebido e está sendo preparado!' || E'\n' ||
        '⏰ Em breve você receberá atualizações sobre o status.';
    
    -- Enviar mensagem via WhatsApp
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
                'to', v_pedido_record.telefone,
                'text', v_message_text
            )
        )::text
    ));
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao enviar WhatsApp: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR TRIGGER
CREATE TRIGGER trigger_whatsapp_simples
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- 4. VERIFICAR SE FOI CRIADO
SELECT 
    '✅ Trigger WhatsApp simples criado com sucesso!' as status,
    'Versão simplificada sem adicionais complexos' as descricao;

-- 5. VERIFICAR TRIGGER ATIVO
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    CASE 
        WHEN t.tgenabled = 'O' THEN '✅ ATIVO'
        WHEN t.tgenabled = 'D' THEN '❌ DESABILITADO'
        ELSE '⚠️ STATUS: ' || t.tgenabled::text
    END as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND t.tgname = 'trigger_whatsapp_simples'
AND NOT t.tgisinternal;
