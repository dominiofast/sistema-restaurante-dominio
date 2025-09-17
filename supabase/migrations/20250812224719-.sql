-- Helper para neutralizar preview de links
CREATE OR REPLACE FUNCTION public.defang_links(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
           replace(
             replace($1, 'https://', 'https://' || chr(8203)),
             'http://',  'http://'  || chr(8203)
           ),
           'pedido.dominio.tech', 'pedido.' || chr(8203) || 'dominio.' || chr(8203) || 'tech'
         );
$$;

-- Atualizar função de notificação de pedido pronto/entregue para remover preview
CREATE OR REPLACE FUNCTION public.send_whatsapp_ready_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    whatsapp_integration RECORD;
    message_text TEXT;
    api_response TEXT;
    pedido_itens_text TEXT := '';
    item_record RECORD;
    notification_type TEXT;
    log_type TEXT;
BEGIN
    IF OLD.status != NEW.status THEN
        IF (LOWER(NEW.status) LIKE '%pronto%' OR 
            LOWER(NEW.status) LIKE '%ready%' OR
            NEW.status = 'pronto_entrega') THEN
            notification_type := 'pronto';
            log_type := 'ready_notification';
        ELSIF (LOWER(NEW.status) LIKE '%entregue%' OR 
               LOWER(NEW.status) LIKE '%delivered%' OR
               NEW.status = 'entregue') THEN
            notification_type := 'entregue';
            log_type := 'delivered_notification';
        ELSE
            RETURN NEW; 
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM ai_conversation_logs 
            WHERE company_id = NEW.company_id 
            AND customer_phone = NEW.telefone 
            AND message_type = log_type
            AND message_content LIKE '%#' || COALESCE(NEW.numero_pedido, NEW.id) || '%'
        ) THEN
            RETURN NEW;
        END IF;
        
        SELECT * INTO whatsapp_integration 
        FROM whatsapp_integrations 
        WHERE company_id = NEW.company_id
        LIMIT 1;
        
        IF NOT FOUND THEN
            INSERT INTO ai_conversation_logs (
                company_id, customer_phone, customer_name, message_content, message_type, created_at
            ) VALUES (
                NEW.company_id, NEW.telefone, NEW.nome,
                'ERRO: Integração WhatsApp não encontrada para notificação de ' || notification_type, 'notification_error', now()
            );
            RETURN NEW;
        END IF;
        
        FOR item_record IN 
            SELECT nome_produto, quantidade, valor_total
            FROM pedido_itens 
            WHERE pedido_id = NEW.id
            ORDER BY created_at
        LOOP
            pedido_itens_text := pedido_itens_text || 
                '• ' || item_record.quantidade || 'x ' || item_record.nome_produto || E'\n';
        END LOOP;
        
        IF notification_type = 'pronto' THEN
            message_text := '🍕 *PEDIDO PRONTO!* 🚀' || E'\n\n' ||
                           '📋 *Pedido:* #' || COALESCE(NEW.numero_pedido, NEW.id) || E'\n' ||
                           '👤 *Cliente:* ' || COALESCE(NEW.nome, 'Não informado') || E'\n\n';
            
            IF NEW.tipo = 'delivery' THEN
                message_text := message_text || '🚗 *Saindo para entrega!*' || E'\n' ||
                    'Tempo estimado: 15-25 minutos' || E'\n\n';
            ELSE
                message_text := message_text || '🏪 *Pronto para retirada!*' || E'\n' ||
                    'Pode vir buscar quando quiser!' || E'\n\n';
            END IF;
            
        ELSIF notification_type = 'entregue' THEN
            message_text := '✅ *PEDIDO ENTREGUE!* 🎉' || E'\n\n' ||
                           '📋 *Pedido:* #' || COALESCE(NEW.numero_pedido, NEW.id) || E'\n' ||
                           '👤 *Cliente:* ' || COALESCE(NEW.nome, 'Não informado') || E'\n\n' ||
                           '🚚 *Seu pedido foi entregue com sucesso!*' || E'\n\n' ||
                           'Esperamos que tenha gostado!' || E'\n';
        END IF;
        
        message_text := message_text || 'Obrigado pela preferência! 😊';
        
        -- Remover preview de links (caso haja) e enviar
        message_text := public.defang_links(message_text);
        
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
                        'to', NEW.telefone,
                        'text', message_text,
                        'preview_url', false,
                        'linkPreview', false
                    )
                )::text
            ));
        EXCEPTION
            WHEN OTHERS THEN
                api_response := 'Erro: ' || SQLERRM;
        END;
        
        INSERT INTO ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            UPPER(notification_type) || ': ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
            log_type, now()
        );
        
    END IF;
    
    RETURN NEW;
END;
$$;

-- Atualizar função de notificação do pedido (resumo do pedido)
CREATE OR REPLACE FUNCTION public.send_whatsapp_order_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
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
    RAISE LOG 'Trigger executado para pedido ID: %', NEW.id;
    
    SELECT * INTO pedido_record
    FROM pedidos 
    WHERE id = NEW.id;
    
    SELECT * INTO whatsapp_integration
    FROM whatsapp_order_notifications 
    WHERE company_id = pedido_record.company_id;
    
    IF NOT FOUND THEN
        RAISE LOG 'Configuração WhatsApp não encontrada para company_id: %', pedido_record.company_id;
        RETURN NEW;
    END IF;
    
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
        pedido_itens_text := pedido_itens_text || 
            '➡ ' || item_record.quantidade || 'x ' || item_record.nome_produto;
        
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
        
        IF item_adicionais_text != '' THEN
            pedido_itens_text := pedido_itens_text || item_adicionais_text;
        END IF;
        
        pedido_itens_text := pedido_itens_text || E'\n\n';
    END LOOP;
    
    message_text := '*Pedido nº ' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || '*' || E'\n\n' ||
                   '*Itens:*' || E'\n' ||
                   pedido_itens_text;
    
    IF pedido_record.tipo = 'delivery' THEN
        message_text := message_text || E'\n🚚 Entrega no endereço' || E'\n' ||
                       '(Estimativa: entre 30~45 minutos)';
    ELSE
        message_text := message_text || E'\n🏪 Retirada no local' || E'\n' ||
                       '(Estimativa: entre 20~35 minutos)';
    END IF;
    
    IF pedido_record.observacoes IS NOT NULL AND pedido_record.observacoes != '' THEN
        message_text := message_text || E'\n\n*Observações:* ' || pedido_record.observacoes;
    END IF;
    
    message_text := message_text || E'\n\n*Total: R$ ' || 
                   REPLACE(COALESCE(pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
                   'Obrigado pela preferência, se precisar de algo é só chamar! 😉';

    -- Remover preview de links
    message_text := public.defang_links(message_text);
    
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
                    'text', message_text,
                    'preview_url', false,
                    'linkPreview', false
                )
            )::text
        ));
    EXCEPTION
        WHEN OTHERS THEN
            api_response := 'Erro: ' || SQLERRM;
    END;
    
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
$$;