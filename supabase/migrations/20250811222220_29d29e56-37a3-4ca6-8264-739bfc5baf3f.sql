-- Atualizar função de notificação WhatsApp para incluir adicionais e observações
CREATE OR REPLACE FUNCTION public.send_whatsapp_notification_after_items()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    pedido_record RECORD;
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    pedido_itens_text TEXT := '';
    item_record RECORD;
    adicional_record RECORD;
    adicional_text TEXT := '';
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
        AND message_content LIKE '%WHATSAPP DIRETO:%'
        AND message_content LIKE '%#' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || '%'
    ) THEN
        RETURN NEW;
    END IF;
    
    -- Buscar integração WhatsApp
    SELECT * INTO whatsapp_integration 
    FROM whatsapp_integrations 
    WHERE company_id = pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            pedido_record.company_id, pedido_record.telefone, pedido_record.nome,
            'ERRO: Integração WhatsApp não encontrada', 'notification_error', now()
        );
        RETURN NEW;
    END IF;
    
    -- Buscar itens do pedido com adicionais e observações
    FOR item_record IN 
        SELECT nome_produto, quantidade, valor_total, observacoes
        FROM pedido_itens 
        WHERE pedido_id = NEW.pedido_id
        ORDER BY created_at
    LOOP
        -- Adicionar item ao texto
        pedido_itens_text := pedido_itens_text || 
            '🍽️ ' || item_record.quantidade || 'x ' || item_record.nome_produto || 
            ' - R$ ' || REPLACE(item_record.valor_total::text, '.', ',') || E'\n';
        
        -- Buscar adicionais do item
        adicional_text := '';
        FOR adicional_record IN
            SELECT pia.nome_adicional, pia.quantidade, pia.valor_total
            FROM pedido_item_adicionais pia
            JOIN pedido_itens pi ON pi.id = pia.pedido_item_id
            WHERE pi.pedido_id = NEW.pedido_id 
            AND pi.nome_produto = item_record.nome_produto
            ORDER BY pia.nome_adicional
        LOOP
            adicional_text := adicional_text || 
                '   ➕ ' || adicional_record.quantidade || 'x ' || adicional_record.nome_adicional ||
                ' (+R$ ' || REPLACE(adicional_record.valor_total::text, '.', ',') || ')' || E'\n';
        END LOOP;
        
        -- Adicionar adicionais se existirem
        IF adicional_text != '' THEN
            pedido_itens_text := pedido_itens_text || adicional_text;
        END IF;
        
        -- Adicionar observações se existirem
        IF item_record.observacoes IS NOT NULL AND item_record.observacoes != '' THEN
            pedido_itens_text := pedido_itens_text || 
                '   💬 *Obs:* ' || item_record.observacoes || E'\n';
        END IF;
        
        pedido_itens_text := pedido_itens_text || E'\n';
    END LOOP;
    
    -- Mensagem completa usando numero_pedido com visual melhorado
    message_text := '🛍️ *CONFIRMAÇÃO DE PEDIDO* 🛍️' || E'\n\n' ||
                   '═══════════════════════════' || E'\n' ||
                   '📋 *Pedido:* #' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || E'\n' ||
                   '👤 *Cliente:* ' || COALESCE(pedido_record.nome, 'Não informado') || E'\n' ||
                   '📞 *Telefone:* ' || COALESCE(pedido_record.telefone, 'Não informado') || E'\n';
    
    IF pedido_record.endereco IS NOT NULL THEN
        message_text := message_text || '📍 *Endereço:* ' || pedido_record.endereco || E'\n';
    END IF;
    
    message_text := message_text || 
        '🚚 *Tipo:* ' || CASE 
            WHEN pedido_record.tipo = 'delivery' THEN 'ENTREGA 🛵'
            WHEN pedido_record.tipo = 'retirada' THEN 'RETIRADA 🏪'
            WHEN pedido_record.tipo = 'balcao' THEN 'BALCÃO 🍽️'
            ELSE UPPER(pedido_record.tipo)
        END || E'\n' ||
        '💳 *Pagamento:* ' || CASE 
            WHEN pedido_record.pagamento = 'dinheiro' THEN 'DINHEIRO 💵'
            WHEN pedido_record.pagamento = 'cartao' THEN 'CARTÃO 💳'
            WHEN pedido_record.pagamento = 'pix' THEN 'PIX 📱'
            ELSE UPPER(pedido_record.pagamento)
        END || E'\n' ||
        '═══════════════════════════' || E'\n\n' ||
        '📝 *ITENS DO PEDIDO:*' || E'\n\n' ||
        pedido_itens_text ||
        '═══════════════════════════' || E'\n' ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(pedido_record.total, 0)::text, '.', ',') || '*' || E'\n' ||
        '═══════════════════════════' || E'\n\n' ||
        '⏰ *Tempo estimado:* 30-45 minutos' || E'\n\n' ||
        '✅ *Seu pedido foi confirmado e já está sendo preparado!*' || E'\n' ||
        '🙏 *Obrigado pela preferência!* 😊';
    
    -- Enviar via API
    BEGIN
        SELECT content INTO api_response
        FROM http((
            'POST',
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || whatsapp_integration.instance_key || '/text',
            ARRAY[
                http_header('Authorization', 'Bearer ' || whatsapp_integration.token),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            json_build_object(
                'messageData', json_build_object(
                    'to', pedido_record.telefone,
                    'text', message_text
                )
            )::text
        ));
    EXCEPTION
        WHEN OTHERS THEN
            api_response := 'Erro: ' || SQLERRM;
    END;
    
    -- Log da notificação
    INSERT INTO ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        pedido_record.company_id, pedido_record.telefone, pedido_record.nome,
        'WHATSAPP DIRETO: ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
        'notification_sent', now()
    );
    
    RETURN NEW;
END;
$$;