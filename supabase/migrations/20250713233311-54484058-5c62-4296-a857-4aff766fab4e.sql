-- Remover trigger antigo do pedidos
DROP TRIGGER IF EXISTS trigger_send_whatsapp_notification ON pedidos;

-- Criar novo trigger nos itens do pedido que será executado após inserção de itens
CREATE OR REPLACE FUNCTION public.send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    pedido_record RECORD;
    notification_config RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    pedido_itens_text TEXT := '';
    item_record RECORD;
    adicional_record RECORD;
    adicional_text TEXT := '';
    items_count INTEGER := 0;
BEGIN
    -- Buscar dados do pedido
    SELECT * INTO pedido_record FROM pedidos WHERE id = NEW.pedido_id;
    
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Verificar se já enviamos notificação para este pedido
    IF EXISTS (
        SELECT 1 FROM ai_conversation_logs 
        WHERE company_id = pedido_record.company_id 
        AND customer_phone = pedido_record.telefone 
        AND message_content LIKE 'WHATSAPP PEDIDO COMPLETO:%#' || pedido_record.id || '%'
        AND created_at > pedido_record.created_at
    ) THEN
        RETURN NEW; -- Já enviamos notificação
    END IF;
    
    -- Contar quantos itens tem o pedido
    SELECT COUNT(*) INTO items_count FROM pedido_itens WHERE pedido_id = NEW.pedido_id;
    
    -- Só enviar notificação se tiver pelo menos 1 item (assume que o pedido está completo)
    IF items_count = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Buscar configuração de notificações
    SELECT * INTO notification_config 
    FROM whatsapp_order_notifications 
    WHERE company_id = pedido_record.company_id AND is_active = true;
    
    -- Se não há configuração ativa, não fazer nada
    IF NOT FOUND OR NOT notification_config.send_confirmation THEN
        RETURN NEW;
    END IF;
    
    -- Buscar integração WhatsApp ativa
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = pedido_record.company_id;
    
    -- Se não há integração WhatsApp, não fazer nada
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Buscar itens do pedido com adicionais
    FOR item_record IN 
        SELECT pi.nome_produto, pi.quantidade, pi.valor_unitario, pi.valor_total, pi.observacoes
        FROM pedido_itens pi 
        WHERE pi.pedido_id = NEW.pedido_id
        ORDER BY pi.created_at
    LOOP
        -- Adicionar item ao texto
        pedido_itens_text := pedido_itens_text || 
            '• ' || item_record.quantidade || 'x ' || item_record.nome_produto || 
            ' - R$ ' || REPLACE(item_record.valor_total::text, '.', ',') || E'\n';
        
        -- Buscar adicionais do item
        adicional_text := '';
        FOR adicional_record IN
            SELECT pia.nome_adicional, pia.quantidade, pia.valor_total
            FROM pedido_item_adicionais pia
            JOIN pedido_itens pi ON pi.id = pia.pedido_item_id
            WHERE pi.pedido_id = NEW.pedido_id AND pi.nome_produto = item_record.nome_produto
        LOOP
            adicional_text := adicional_text || 
                '  + ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional ||
                ' (+R$ ' || REPLACE(adicional_record.valor_total::text, '.', ',') || ')' || E'\n';
        END LOOP;
        
        -- Adicionar adicionais se existirem
        IF adicional_text != '' THEN
            pedido_itens_text := pedido_itens_text || adicional_text;
        END IF;
        
        -- Adicionar observações se existirem
        IF item_record.observacoes IS NOT NULL AND item_record.observacoes != '' THEN
            pedido_itens_text := pedido_itens_text || 
                '  Obs: ' || item_record.observacoes || E'\n';
        END IF;
        
        pedido_itens_text := pedido_itens_text || E'\n';
    END LOOP;
    
    -- Preparar mensagem completa
    message_text := '🛍️ *CONFIRMAÇÃO DE PEDIDO* 🛍️' || E'\n\n' ||
                   '📋 *Pedido:* #' || pedido_record.id || E'\n' ||
                   '👤 *Cliente:* ' || COALESCE(pedido_record.nome, 'Não informado') || E'\n' ||
                   '📞 *Telefone:* ' || COALESCE(pedido_record.telefone, 'Não informado') || E'\n';
    
    -- Adicionar endereço se for delivery
    IF pedido_record.tipo = 'delivery' AND pedido_record.endereco IS NOT NULL THEN
        message_text := message_text || '📍 *Endereço:* ' || pedido_record.endereco || E'\n';
    END IF;
    
    message_text := message_text || 
        '🚚 *Tipo:* ' || CASE 
            WHEN pedido_record.tipo = 'delivery' THEN 'Entrega'
            WHEN pedido_record.tipo = 'retirada' THEN 'Retirada'
            WHEN pedido_record.tipo = 'balcao' THEN 'Balcão'
            ELSE UPPER(pedido_record.tipo)
        END || E'\n' ||
        '💳 *Pagamento:* ' || CASE 
            WHEN pedido_record.pagamento = 'dinheiro' THEN 'Dinheiro'
            WHEN pedido_record.pagamento = 'cartao' THEN 'Cartão'
            WHEN pedido_record.pagamento = 'pix' THEN 'PIX'
            WHEN pedido_record.pagamento LIKE 'Dinheiro%' THEN pedido_record.pagamento
            ELSE UPPER(pedido_record.pagamento)
        END || E'\n\n' ||
        '📝 *ITENS DO PEDIDO:*' || E'\n' ||
        pedido_itens_text ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
        '⏰ *Tempo estimado:* 30-45 minutos' || E'\n\n' ||
        '✅ Seu pedido foi confirmado e já está sendo preparado!' || E'\n' ||
        'Obrigado pela preferência! 😊';
    
    -- Chamar edge function para enviar WhatsApp
    BEGIN
        SELECT content INTO api_response
        FROM http((
            'POST',
            'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/send-whatsapp-message',
            ARRAY[http_header('Content-Type', 'application/json')],
            'application/json',
            json_build_object(
                'phone', pedido_record.telefone,
                'message', message_text,
                'integration', json_build_object(
                    'host', whatsapp_integration.host,
                    'token', whatsapp_integration.token,
                    'instance_key', whatsapp_integration.instance_key
                )
            )::text
        ));
    EXCEPTION
        WHEN OTHERS THEN
            api_response := 'Erro: ' || SQLERRM;
    END;
    
    -- Log da notificação
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        pedido_record.company_id,
        pedido_record.telefone,
        pedido_record.nome,
        'WHATSAPP PEDIDO COMPLETO: ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
        'notification_sent',
        now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para ser executado APÓS inserção de itens
CREATE TRIGGER trigger_whatsapp_after_items
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();