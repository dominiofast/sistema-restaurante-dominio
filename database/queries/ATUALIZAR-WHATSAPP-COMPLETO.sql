-- ATUALIZAR FUNÇÃO WHATSAPP COM ADICIONAIS E FORMA DE PAGAMENTO
-- Drop da função e trigger existentes
DROP TRIGGER IF EXISTS trigger_confirmacao_limpa_final ON pedido_itens;
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- Criar função atualizada
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_item_record RECORD;
    v_message_text TEXT;
    v_itens_texto TEXT := '';
    v_adicionais_texto TEXT := '';
    v_endereco_texto TEXT := '';
    v_observacoes_texto TEXT := '';
    v_pagamento_texto TEXT := '';
    v_total_pedido DECIMAL(10,2);
    v_taxa_entrega DECIMAL(10,2) := 0;
    v_api_response TEXT;
    v_item_id INTEGER;
    v_adicionais_count INTEGER;
BEGIN
    -- Buscar dados do pedido
    SELECT 
        p.id,
        p.numero_pedido,
        p.nome as nome_cliente,
        p.telefone,
        p.tipo as tipo_pedido,
        p.total as valor_total,
        p.observacoes,
        p.endereco_completo,
        p.referencia,
        p.forma_pagamento,
        c.telefone as company_phone
    INTO v_pedido_record
    FROM pedidos p
    LEFT JOIN companies c ON c.id = p.company_id
    WHERE p.id = NEW.pedido_id;
    
    -- Buscar integração WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations
    WHERE company_id = (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id)
    AND purpose = 'orders'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_whatsapp_integration IS NULL THEN
        RAISE NOTICE 'Integração WhatsApp não encontrada para company_id %', (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id);
        RETURN NEW;
    END IF;
    
    -- Verificar se é o primeiro item do pedido (para evitar duplicação)
    SELECT COUNT(*) INTO v_adicionais_count
    FROM pedido_itens
    WHERE pedido_id = NEW.pedido_id;
    
    IF v_adicionais_count > 1 THEN
        RETURN NEW; -- Não é o primeiro item, não enviar mensagem
    END IF;
    
    -- Buscar taxa de entrega se for delivery
    IF v_pedido_record.tipo_pedido = 'delivery' THEN
        SELECT COALESCE(taxa_entrega, 0) INTO v_taxa_entrega
        FROM delivery_methods
        WHERE company_id = (SELECT company_id FROM pedidos WHERE id = NEW.pedido_id)
        AND is_active = true
        LIMIT 1;
    END IF;
    
    -- Buscar todos os itens do pedido
    FOR v_item_record IN
        SELECT 
            pi.id as item_id,
            pi.quantidade,
            pi.valor_unitario,
            pi.valor_total,
            pi.observacoes as item_observacoes,
            p.nome as produto_nome,
            p.descricao as produto_descricao
        FROM pedido_itens pi
        JOIN produtos p ON p.id = pi.produto_id
        WHERE pi.pedido_id = NEW.pedido_id
        ORDER BY pi.id
    LOOP
        v_item_id := v_item_record.item_id;
        
        -- Adicionar item principal
        v_itens_texto := v_itens_texto || 
            '• ' || v_item_record.quantidade || 'x ' || v_item_record.produto_nome;
        
        -- Adicionar descrição se existir
        IF v_item_record.produto_descricao IS NOT NULL AND v_item_record.produto_descricao != '' THEN
            v_itens_texto := v_itens_texto || ' - ' || v_item_record.produto_descricao;
        END IF;
        
        v_itens_texto := v_itens_texto || ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',') || E'\n';
        
        -- Buscar adicionais do item
        SELECT string_agg(
            CASE 
                WHEN a.categoria = 'massas' THEN '  🍝 ' || a.nome
                WHEN a.categoria = 'bordas' THEN '  🥖 ' || a.nome
                WHEN a.categoria = 'condimentos' THEN '  🌶️ ' || a.nome
                ELSE '  ➕ ' || a.nome
            END, 
            E'\n'
        ) INTO v_adicionais_texto
        FROM pedido_item_adicionais pia
        JOIN adicionais a ON a.id = pia.adicional_id
        WHERE pia.pedido_item_id = v_item_id;
        
        -- Adicionar adicionais se existirem
        IF v_adicionais_texto IS NOT NULL AND v_adicionais_texto != '' THEN
            v_itens_texto := v_itens_texto || v_adicionais_texto || E'\n';
        END IF;
        
        -- Adicionar observações do item se existirem
        IF v_item_record.item_observacoes IS NOT NULL AND v_item_record.item_observacoes != '' THEN
            v_itens_texto := v_itens_texto || '  📝 Obs: ' || v_item_record.item_observacoes || E'\n';
        END IF;
        
        v_itens_texto := v_itens_texto || E'\n';
    END LOOP;
    
    -- Calcular total do pedido
    v_total_pedido := v_pedido_record.valor_total + v_taxa_entrega;
    
    -- Preparar endereço se for delivery
    IF v_pedido_record.tipo_pedido = 'delivery' THEN
        v_endereco_texto := E'\n📍 *Endereço de Entrega:*' || E'\n' || 
            COALESCE(v_pedido_record.endereco_completo, 'Não informado') || E'\n';
        IF v_pedido_record.referencia IS NOT NULL AND v_pedido_record.referencia != '' THEN
            v_endereco_texto := v_endereco_texto || '📍 *Referência:* ' || v_pedido_record.referencia || E'\n';
        END IF;
    END IF;
    
    -- Preparar observações se existirem
    IF v_pedido_record.observacoes IS NOT NULL AND v_pedido_record.observacoes != '' THEN
        v_observacoes_texto := E'\n📝 *Observações:* ' || v_pedido_record.observacoes || E'\n';
    END IF;
    
    -- Preparar forma de pagamento
    v_pagamento_texto := '';
    IF v_pedido_record.forma_pagamento IS NOT NULL AND v_pedido_record.forma_pagamento != '' THEN
        v_pagamento_texto := E'\n💳 *Forma de Pagamento:* ' || v_pedido_record.forma_pagamento || E'\n';
    END IF;
    
    -- Montar mensagem final
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
        '🛍 *Itens:*' || E'\n' || v_itens_texto ||
        v_endereco_texto || v_observacoes_texto || v_pagamento_texto ||
        E'\n💰 *Resumo Financeiro:*' || E'\n' ||
        '• Subtotal: R$ ' || REPLACE(v_pedido_record.valor_total::text, '.', ',') || E'\n';
    
    -- Adicionar taxa de entrega se for delivery
    IF v_taxa_entrega > 0 THEN
        v_message_text := v_message_text || 
            '• Taxa de Entrega: R$ ' || REPLACE(v_taxa_entrega::text, '.', ',') || E'\n';
    END IF;
    
    v_message_text := v_message_text || 
        '• *TOTAL: R$ ' || REPLACE(v_total_pedido::text, '.', ',') || '*' || E'\n\n' ||
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
        -- Em caso de erro, apenas retorna NEW sem interromper o processo
        RAISE NOTICE 'Erro ao enviar WhatsApp: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER trigger_confirmacao_limpa_final
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar se função foi criada
SELECT 'Função send_whatsapp_notification_after_items atualizada com sucesso!' as status;
