-- TESTE MANUAL WHATSAPP - SEM TRIGGER
-- Vamos testar diretamente com um pedido existente

-- Primeiro, ver o pedido mais recente
SELECT 
    id,
    numero_pedido,
    nome,
    telefone,
    company_id,
    total
FROM pedidos 
ORDER BY created_at DESC 
LIMIT 1;

-- Criar funcao de teste manual
CREATE OR REPLACE FUNCTION test_whatsapp_manual(p_pedido_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_pedido_record RECORD;
    v_whatsapp_integration RECORD;
    v_message_text TEXT;
    v_api_response TEXT;
    v_result TEXT;
BEGIN
    -- Buscar pedido
    SELECT p.*, c.name as company_name
    INTO v_pedido_record
    FROM pedidos p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = p_pedido_id;
    
    IF NOT FOUND THEN
        RETURN 'ERRO: Pedido nao encontrado';
    END IF;
    
    -- Buscar WhatsApp
    SELECT * INTO v_whatsapp_integration
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido_record.company_id
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 'ERRO: WhatsApp integration nao encontrada para company_id: ' || v_pedido_record.company_id;
    END IF;
    
    -- Mensagem simples de teste
    v_message_text := 
        '*TESTE MANUAL*' || E'\n' ||
        'Pedido: ' || v_pedido_record.numero_pedido || E'\n' ||
        'Cliente: ' || v_pedido_record.nome || E'\n' ||
        'Total: R$ ' || REPLACE(v_pedido_record.total::text, '.', ',');
    
    -- Tentar enviar
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
    
    v_result := 'SUCESSO! Mensagem enviada para: ' || v_pedido_record.telefone || 
                ' | API Response: ' || COALESCE(v_api_response, 'NULL');
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ERRO: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- EXECUTAR TESTE COM O PEDIDO MAIS RECENTE
-- Substitua o UUID pelo ID do pedido mais recente da query acima
SELECT test_whatsapp_manual(
    (SELECT id FROM pedidos ORDER BY created_at DESC LIMIT 1)
) as resultado_teste;
