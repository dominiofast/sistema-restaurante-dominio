-- TESTAR A FUNÇÃO MANUALMENTE CRIANDO UMA VERSÃO DE TESTE
CREATE OR REPLACE FUNCTION test_whatsapp_notification_debug()
RETURNS TEXT AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_itens_texto TEXT := '';
    v_total_itens INTEGER;
    v_result TEXT := '';
BEGIN
    -- Testar com o pedido mais recente (ID 397)
    v_result := 'TESTE INICIADO' || chr(10);
    
    -- Contar itens
    SELECT COUNT(*) INTO v_total_itens
    FROM pedido_itens 
    WHERE pedido_id = 397;
    
    v_result := v_result || 'Total de itens: ' || v_total_itens || chr(10);
    
    -- Buscar pedido
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = 397;
    
    IF NOT FOUND THEN
        v_result := v_result || 'ERRO: Pedido não encontrado' || chr(10);
        RETURN v_result;
    END IF;
    
    v_result := v_result || 'Pedido encontrado: #' || v_pedido_record.numero_pedido || ' - ' || v_pedido_record.nome || chr(10);
    v_result := v_result || 'Company ID: ' || v_pedido_record.company_id || chr(10);
    
    -- Buscar WhatsApp (usar 'primary')
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    AND purpose = 'primary'
    LIMIT 1;
    
    IF NOT FOUND THEN 
        v_result := v_result || 'ERRO: Integração WhatsApp não encontrada para company_id ' || v_pedido_record.company_id || chr(10);
        RETURN v_result;
    END IF;
    
    v_result := v_result || 'WhatsApp encontrado: ' || v_whatsapp_integration.host || ' - ' || v_whatsapp_integration.instance_key || chr(10);
    
    -- Montar lista de itens
    SELECT string_agg(
        '• ' || pi.quantidade || 'x ' || pi.nome_produto || ' - R$ ' || REPLACE(pi.valor_total::text, '.', ','), 
        chr(10)
    ) INTO v_itens_texto
    FROM pedido_itens pi
    WHERE pi.pedido_id = 397
    AND pi.nome_produto NOT ILIKE '%taxa%';
    
    v_result := v_result || 'Itens do pedido:' || chr(10) || v_itens_texto || chr(10);
    
    -- Testar montagem da mensagem
    v_message_text := 
        '🎉 *PEDIDO CONFIRMADO*' || chr(10) || chr(10) ||
        '📋 *Pedido:* ' || v_pedido_record.numero_pedido || chr(10) ||
        '👤 *Cliente:* ' || v_pedido_record.nome || chr(10) ||
        '📱 *Telefone:* ' || v_pedido_record.telefone || chr(10);
        
    v_result := v_result || 'Mensagem montada com sucesso!' || chr(10);
    v_result := v_result || 'Primeira linha: ' || substring(v_message_text, 1, 100) || '...' || chr(10);
    
    RETURN v_result || 'TESTE CONCLUÍDO - Tudo funcionando!';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN v_result || 'ERRO: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar o teste
SELECT test_whatsapp_notification_debug() as resultado_teste;