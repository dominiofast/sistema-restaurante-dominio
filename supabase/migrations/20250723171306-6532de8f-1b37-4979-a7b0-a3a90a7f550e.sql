-- Corrigir todas as funções e triggers para usar numero_pedido ao invés de id

-- 1. Atualizar função de impressão automática
CREATE OR REPLACE FUNCTION public.auto_print_pedido_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Registrar o trigger
    INSERT INTO public.ai_conversation_logs (
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
        'TRIGGER: Pedido #' || COALESCE(NEW.numero_pedido, NEW.id) || ' criado, iniciando impressão automática',
        'auto_print_trigger',
        now()
    );

    RETURN NEW;
END;
$$;

-- 2. Atualizar função de notificação WhatsApp após itens
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
    
    -- Buscar itens do pedido
    FOR item_record IN 
        SELECT nome_produto, quantidade, valor_total
        FROM pedido_itens 
        WHERE pedido_id = NEW.pedido_id
        ORDER BY created_at
    LOOP
        pedido_itens_text := pedido_itens_text || 
            '• ' || item_record.quantidade || 'x ' || item_record.nome_produto || 
            ' - R$ ' || REPLACE(item_record.valor_total::text, '.', ',') || E'\n';
    END LOOP;
    
    -- Mensagem completa usando numero_pedido
    message_text := '🛍️ *CONFIRMAÇÃO DE PEDIDO* 🛍️' || E'\n\n' ||
                   '📋 *Pedido:* #' || COALESCE(pedido_record.numero_pedido, pedido_record.id) || E'\n' ||
                   '👤 *Cliente:* ' || COALESCE(pedido_record.nome, 'Não informado') || E'\n' ||
                   '📞 *Telefone:* ' || COALESCE(pedido_record.telefone, 'Não informado') || E'\n';
    
    IF pedido_record.endereco IS NOT NULL THEN
        message_text := message_text || '📍 *Endereço:* ' || pedido_record.endereco || E'\n';
    END IF;
    
    message_text := message_text || 
        '🚚 *Tipo:* ' || COALESCE(UPPER(pedido_record.tipo), 'N/A') || E'\n' ||
        '💳 *Pagamento:* ' || COALESCE(UPPER(pedido_record.pagamento), 'N/A') || E'\n\n' ||
        '📝 *ITENS DO PEDIDO:*' || E'\n' ||
        pedido_itens_text || E'\n' ||
        '💰 *TOTAL: R$ ' || REPLACE(COALESCE(pedido_record.total, 0)::text, '.', ',') || '*' || E'\n\n' ||
        '⏰ *Tempo estimado:* 30-45 minutos' || E'\n\n' ||
        '✅ Seu pedido foi confirmado e já está sendo preparado!' || E'\n' ||
        'Obrigado pela preferência! 😊';
    
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

-- 3. Atualizar função de notificação de pedido pronto
CREATE OR REPLACE FUNCTION public.send_whatsapp_ready_notification()
RETURNS TRIGGER
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
    -- Verificar se o status mudou
    IF OLD.status != NEW.status THEN
        
        -- Determinar tipo de notificação
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
            RETURN NEW; -- Status não relevante
        END IF;
        
        -- Verificar se já enviamos notificação deste tipo para este pedido
        IF EXISTS (
            SELECT 1 FROM ai_conversation_logs 
            WHERE company_id = NEW.company_id 
            AND customer_phone = NEW.telefone 
            AND message_type = log_type
            AND message_content LIKE '%#' || COALESCE(NEW.numero_pedido, NEW.id) || '%'
        ) THEN
            RETURN NEW;
        END IF;
        
        -- Buscar integração WhatsApp
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
        
        -- Buscar itens do pedido
        FOR item_record IN 
            SELECT nome_produto, quantidade, valor_total
            FROM pedido_itens 
            WHERE pedido_id = NEW.id
            ORDER BY created_at
        LOOP
            pedido_itens_text := pedido_itens_text || 
                '• ' || item_record.quantidade || 'x ' || item_record.nome_produto || E'\n';
        END LOOP;
        
        -- Mensagem baseada no tipo usando numero_pedido
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
                        'to', NEW.telefone,
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
            NEW.company_id, NEW.telefone, NEW.nome,
            UPPER(notification_type) || ': ' || message_text || ' | Resposta API: ' || COALESCE(api_response, 'N/A'),
            log_type, now()
        );
        
    END IF;
    
    RETURN NEW;
END;
$$;