-- Atualizar função para enviar notificação WhatsApp com pedido completo
CREATE OR REPLACE FUNCTION public.send_whatsapp_order_notification()
RETURNS TRIGGER AS $$
DECLARE
    notification_config RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    pedido_itens_text TEXT := '';
    item_record RECORD;
    adicional_record RECORD;
    adicional_text TEXT := '';
BEGIN
    -- Buscar configuração de notificações
    SELECT * INTO notification_config 
    FROM whatsapp_order_notifications 
    WHERE company_id = NEW.company_id AND is_active = true;
    
    -- Se não há configuração ativa, não fazer nada
    IF NOT FOUND OR NOT notification_config.send_confirmation THEN
        RETURN NEW;
    END IF;
    
    -- Buscar integração WhatsApp ativa
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = NEW.company_id;
    
    -- Se não há integração WhatsApp, não fazer nada
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Buscar itens do pedido com adicionais
    FOR item_record IN 
        SELECT pi.nome_produto, pi.quantidade, pi.valor_unitario, pi.valor_total, pi.observacoes
        FROM pedido_itens pi 
        WHERE pi.pedido_id = NEW.id
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
            WHERE pi.pedido_id = NEW.id AND pi.nome_produto = item_record.nome_produto
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
                   '📋 *Pedido:* #' || NEW.id || E'\n' ||
                   '👤 *Cliente:* ' || COALESCE(NEW.nome, 'Não informado') || E'\n' ||
                   '📞 *Telefone:* ' || COALESCE(NEW.telefone, 'Não informado') || E'\n';
    
    -- Adicionar endereço se for delivery
    IF NEW.tipo = 'delivery' AND NEW.endereco IS NOT NULL THEN
        message_text := message_text || '📍 *Endereço:* ' || NEW.endereco || E'\n';
    END IF;
    
    message_text := message_text || 
        '🚚 *Tipo:* ' || CASE 
            WHEN NEW.tipo = 'delivery' THEN 'Entrega'
            WHEN NEW.tipo = 'retirada' THEN 'Retirada'
            WHEN NEW.tipo = 'balcao' THEN 'Balcão'
            ELSE UPPER(NEW.tipo)
        END || E'\n' ||
        '💳 *Pagamento:* ' || CASE 
            WHEN NEW.pagamento = 'dinheiro' THEN 'Dinheiro'
            WHEN NEW.pagamento = 'cartao' THEN 'Cartão'
            WHEN NEW.pagamento = 'pix' THEN 'PIX'
            ELSE UPPER(NEW.pagamento)
        END || E'\n\n' ||
        '📝 *ITENS DO PEDIDO:*' || E'\n' ||
        pedido_itens_text ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(NEW.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
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
                'phone', NEW.telefone,
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
        NEW.company_id,
        NEW.telefone,
        NEW.nome,
        'WHATSAPP PEDIDO COMPLETO: ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
        'notification_sent',
        now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;