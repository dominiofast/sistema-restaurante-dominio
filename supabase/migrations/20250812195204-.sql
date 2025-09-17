CREATE OR REPLACE FUNCTION public.send_whatsapp_order_notification()
RETURNS trigger AS $$
DECLARE
    whatsapp_integration RECORD;
    api_response TEXT;
    message_text TEXT;
    pedido_record RECORD;
    pedido_itens_text TEXT := '';
    item_record RECORD;
    adicional_record RECORD;
    item_adicionais_text TEXT;
    
BEGIN
    -- Log do início da função
    RAISE LOG 'Trigger executado para pedido ID: %', NEW.id;
    
    -- Buscar pedido com detalhes
    SELECT * INTO pedido_record
    FROM pedidos 
    WHERE id = NEW.id;
    
    -- Buscar configuração de WhatsApp
    SELECT * INTO whatsapp_integration
    FROM whatsapp_order_notifications 
    WHERE company_id = pedido_record.company_id;
    
    IF NOT FOUND THEN
        RAISE LOG 'Configuração WhatsApp não encontrada para company_id: %', pedido_record.company_id;
        RETURN NEW;
    END IF;
    
    -- Buscar itens do pedido
    FOR item_record IN 
        SELECT 
            pi.nome_produto,
            pi.quantidade,
            pi.preco_unitario,
            pi.produto_id
        FROM pedido_itens pi 
        WHERE pi.pedido_id = pedido_record.id 
        ORDER BY pi.id
    LOOP
        -- Adicionar item principal
        pedido_itens_text := pedido_itens_text || 
            '➡ ' || item_record.quantidade || 'x ' || item_record.nome_produto;
        
        -- Buscar adicionais do item
        item_adicionais_text := '';
        FOR adicional_record IN 
            SELECT 
                pia.nome_adicional,
                pia.quantidade as qtd_adicional
            FROM pedido_item_adicionais pia 
            WHERE pia.pedido_id = pedido_record.id 
            AND pia.produto_id = item_record.produto_id
            ORDER BY pia.id
        LOOP
            item_adicionais_text := item_adicionais_text ||
                E'\n      ' || adicional_record.nome_adicional || E'\n          ' || 
                adicional_record.qtd_adicional || 'x ' || adicional_record.nome_adicional;
        END LOOP;
        
        -- Adicionar adicionais ao item se existirem
        IF item_adicionais_text != '' THEN
            pedido_itens_text := pedido_itens_text || item_adicionais_text;
        END IF;
        
        pedido_itens_text := pedido_itens_text || E'\n\n';
    END LOOP;
    
    -- Mensagem simplificada conforme exemplo
    message_text := '*Pedido nº ' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || '*' || E'\n\n' ||
                   '*Itens:*' || E'\n' ||
                   pedido_itens_text;
    
    -- Adicionar tipo de entrega
    IF pedido_record.tipo = 'delivery' THEN
        message_text := message_text || E'\n🚚 Entrega no endereço' || E'\n' ||
                       '(Estimativa: entre 30~45 minutos)';
    ELSE
        message_text := message_text || E'\n🏪 Retirada no local' || E'\n' ||
                       '(Estimativa: entre 20~35 minutos)';
    END IF;
    
    -- Adicionar observações se existirem
    IF pedido_record.observacoes IS NOT NULL AND pedido_record.observacoes != '' THEN
        message_text := message_text || E'\n\n*Observações:* ' || pedido_record.observacoes;
    END IF;
    
    -- Finalizar mensagem
    message_text := message_text || E'\n\n*Total: R$ ' || 
                   REPLACE(COALESCE(pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
                   'Obrigado pela preferência, se precisar de algo é só chamar! 😉';
    
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
        pedido_record.company_id,
        pedido_record.telefone,
        pedido_record.nome,
        message_text,
        'assistant',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;