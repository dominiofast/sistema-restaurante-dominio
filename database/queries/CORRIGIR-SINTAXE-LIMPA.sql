-- CORRIGIR ERRO DE SINTAXE NA FUNCAO DE CONFIRMACAO WHATSAPP
-- Versao sem emojis para evitar problemas de encoding

-- Primeiro, remover funcao com problema
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items();

-- Recriar funcao com sintaxe correta
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_item_record RECORD;
    v_adicional_record RECORD;
    v_taxa_entrega DECIMAL := 0;
    v_itens_texto TEXT := '';
    v_adicionais_sabores TEXT := '';
    v_adicionais_massas TEXT := '';
    v_adicionais_extras TEXT := '';
    v_adicionais_condimentos TEXT := '';
    v_total_pedido DECIMAL := 0;
    v_endereco_texto TEXT := '';
    v_observacoes_texto TEXT := '';
BEGIN
    -- Buscar dados do pedido
    SELECT 
        p.*,
        c.name as company_name,
        c.phone as company_phone,
        COALESCE(dm.delivery_fee, 0) as delivery_fee
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    LEFT JOIN delivery_methods dm ON p.company_id = dm.company_id
    WHERE p.id = NEW.pedido_id;
    
    -- Buscar integracao WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id 
    AND is_active = true
    LIMIT 1;
    
    -- Se nao encontrar integracao, sair
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Calcular taxa de entrega
    IF v_pedido_record.tipo_pedido = 'delivery' THEN
        v_taxa_entrega := v_pedido_record.delivery_fee;
    END IF;
    
    -- Montar texto dos itens com adicionais organizados por categoria
    FOR v_item_record IN 
        SELECT 
            pi.quantidade,
            pi.valor_unitario,
            pi.valor_total,
            p.name as produto_nome,
            pi.observacoes as item_observacoes
        FROM pedido_itens pi
        JOIN produtos p ON pi.produto_id = p.id
        WHERE pi.pedido_id = NEW.pedido_id
        ORDER BY pi.created_at
    LOOP
        v_itens_texto := v_itens_texto || 
            '• ' || v_item_record.quantidade || 'x ' || v_item_record.produto_nome || 
            ' - R$ ' || REPLACE(v_item_record.valor_total::text, '.', ',') || E'\n';
        
        -- Resetar variaveis de adicionais para cada item
        v_adicionais_sabores := '';
        v_adicionais_massas := '';
        v_adicionais_extras := '';
        v_adicionais_condimentos := '';
        
        -- Buscar adicionais por categoria
        FOR v_adicional_record IN 
            SELECT 
                a.name as adicional_nome,
                ac.name as categoria_nome,
                pia.quantidade as adicional_quantidade
            FROM pedido_item_adicionais pia
            JOIN adicionais a ON pia.adicional_id = a.id
            JOIN adicional_categories ac ON a.category_id = ac.id
            WHERE pia.pedido_item_id IN (
                SELECT id FROM pedido_itens WHERE pedido_id = NEW.pedido_id AND produto_id = (
                    SELECT produto_id FROM pedido_itens pi2 
                    WHERE pi2.pedido_id = NEW.pedido_id 
                    AND pi2.produto_id = (SELECT produto_id FROM pedido_itens pi3 WHERE pi3.id = pia.pedido_item_id)
                    LIMIT 1
                )
            )
            ORDER BY ac.name, a.name
        LOOP
            CASE 
                WHEN LOWER(v_adicional_record.categoria_nome) LIKE '%sabor%' THEN
                    v_adicionais_sabores := v_adicionais_sabores || '  - ' || v_adicional_record.adicional_nome || E'\n';
                WHEN LOWER(v_adicional_record.categoria_nome) LIKE '%massa%' OR LOWER(v_adicional_record.categoria_nome) LIKE '%borda%' THEN
                    v_adicionais_massas := v_adicionais_massas || '  - ' || v_adicional_record.adicional_nome || E'\n';
                WHEN LOWER(v_adicional_record.categoria_nome) LIKE '%condimento%' THEN
                    v_adicionais_condimentos := v_adicionais_condimentos || '  - ' || v_adicional_record.adicional_nome || E'\n';
                ELSE
                    v_adicionais_extras := v_adicionais_extras || '  - ' || v_adicional_record.adicional_nome || E'\n';
            END CASE;
        END LOOP;
        
        -- Adicionar adicionais ao texto do item se existirem
        IF v_adicionais_sabores != '' THEN
            v_itens_texto := v_itens_texto || '  *Sabores:*' || E'\n' || v_adicionais_sabores;
        END IF;
        IF v_adicionais_massas != '' THEN
            v_itens_texto := v_itens_texto || '  *Massas e Bordas:*' || E'\n' || v_adicionais_massas;
        END IF;
        IF v_adicionais_extras != '' THEN
            v_itens_texto := v_itens_texto || '  *Adicionais:*' || E'\n' || v_adicionais_extras;
        END IF;
        IF v_adicionais_condimentos != '' THEN
            v_itens_texto := v_itens_texto || '  *Condimentos:*' || E'\n' || v_adicionais_condimentos;
        END IF;
        
        -- Adicionar observacoes do item se existirem
        IF v_item_record.item_observacoes IS NOT NULL AND v_item_record.item_observacoes != '' THEN
            v_itens_texto := v_itens_texto || '  *Obs:* ' || v_item_record.item_observacoes || E'\n';
        END IF;
        
        v_itens_texto := v_itens_texto || E'\n';
    END LOOP;
    
    -- Calcular total do pedido
    v_total_pedido := v_pedido_record.valor_total + v_taxa_entrega;
    
    -- Preparar endereco se for delivery
    IF v_pedido_record.tipo_pedido = 'delivery' THEN
        v_endereco_texto := E'\n*Endereco de Entrega:*' || E'\n' || 
            COALESCE(v_pedido_record.endereco_completo, 'Nao informado') || E'\n';
        IF v_pedido_record.referencia IS NOT NULL AND v_pedido_record.referencia != '' THEN
            v_endereco_texto := v_endereco_texto || '*Referencia:* ' || v_pedido_record.referencia || E'\n';
        END IF;
    END IF;
    
    -- Preparar observacoes se existirem
    IF v_pedido_record.observacoes IS NOT NULL AND v_pedido_record.observacoes != '' THEN
        v_observacoes_texto := E'\n*Observacoes:* ' || v_pedido_record.observacoes || E'\n';
    END IF;
    
    -- Montar mensagem final
    v_message_text := 
        '*PEDIDO CONFIRMADO*' || E'\n\n' ||
        '*Pedido n°* ' || v_pedido_record.numero_pedido || E'\n' ||
        '*Cliente:* ' || v_pedido_record.nome_cliente || E'\n' ||
        '*Telefone:* ' || v_pedido_record.telefone || E'\n' ||
        '*Tipo:* ' || 
        CASE 
            WHEN v_pedido_record.tipo_pedido = 'delivery' THEN 'Entrega'
            WHEN v_pedido_record.tipo_pedido = 'pickup' THEN 'Retirada'
            ELSE 'Balcao'
        END || E'\n\n' ||
        '*Itens do Pedido:*' || E'\n' || v_itens_texto ||
        v_endereco_texto || v_observacoes_texto ||
        E'\n*Resumo Financeiro:*' || E'\n' ||
        '• Subtotal: R$ ' || REPLACE(v_pedido_record.valor_total::text, '.', ',') || E'\n';
    
    -- Adicionar taxa de entrega se for delivery
    IF v_taxa_entrega > 0 THEN
        v_message_text := v_message_text || 
            '• Taxa de Entrega: R$ ' || REPLACE(v_taxa_entrega::text, '.', ',') || E'\n';
    END IF;
    
    v_message_text := v_message_text || 
        '• *Total: R$ ' || REPLACE(v_total_pedido::text, '.', ',') || '*' || E'\n\n' ||
        '*Status:* Em preparacao' || E'\n' ||
        '*Contato:* ' || COALESCE(v_pedido_record.company_phone, 'Nao informado');
    
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
DROP TRIGGER IF EXISTS trigger_confirmacao_limpa_final ON pedido_itens;
CREATE TRIGGER trigger_confirmacao_limpa_final
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- Verificar se funcao foi criada
SELECT 'Funcao send_whatsapp_notification_after_items criada com sucesso!' as status;
