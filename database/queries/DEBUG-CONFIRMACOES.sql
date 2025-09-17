-- DEBUG CONFIRMACOES WHATSAPP
-- Verificar triggers e funcoes ativas

-- 1. VERIFICAR TRIGGERS ATIVOS
SELECT 
    schemaname,
    tablename,
    triggername,
    actionstatement as function_called
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND (tablename = 'pedido_itens' OR tablename = 'pedidos')
AND NOT tgisinternal
ORDER BY tablename, triggername;

-- 2. VERIFICAR FUNCOES EXISTENTES
SELECT 
    proname as function_name,
    prosrc as function_code_preview
FROM pg_proc 
WHERE proname LIKE '%whatsapp%' OR proname LIKE '%production%' OR proname LIKE '%notification%'
ORDER BY proname;

-- 3. TESTAR INTEGRACAO WHATSAPP ATIVA
SELECT 
    company_id,
    instance_key,
    is_active,
    created_at
FROM whatsapp_integrations 
WHERE is_active = true;

-- 4. VERIFICAR PEDIDO 12 ESPECIFICAMENTE
SELECT 
    p.id,
    p.numero_pedido,
    p.nome_cliente,
    p.telefone,
    p.status,
    p.company_id,
    p.created_at
FROM pedidos p 
WHERE numero_pedido = '12'
ORDER BY created_at DESC;

-- 5. VERIFICAR ITENS DO PEDIDO 12
SELECT 
    pi.id,
    pi.pedido_id,
    pi.produto_id,
    pi.quantidade,
    pi.created_at,
    p.name as produto_nome
FROM pedido_itens pi
JOIN produtos p ON pi.produto_id = p.id
WHERE pi.pedido_id = (SELECT id FROM pedidos WHERE numero_pedido = '12' ORDER BY created_at DESC LIMIT 1);

-- 6. CRIAR FUNCAO DE TESTE MANUAL
CREATE OR REPLACE FUNCTION test_whatsapp_manual(p_pedido_numero TEXT)
RETURNS TEXT AS $$
DECLARE
    v_pedido RECORD;
    v_whatsapp RECORD;
    v_result TEXT;
BEGIN
    -- Buscar pedido
    SELECT * INTO v_pedido 
    FROM pedidos 
    WHERE numero_pedido = p_pedido_numero 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 'Pedido nao encontrado: ' || p_pedido_numero;
    END IF;
    
    -- Buscar integracao WhatsApp
    SELECT * INTO v_whatsapp
    FROM whatsapp_integrations 
    WHERE company_id = v_pedido.company_id 
    AND is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 'Integracao WhatsApp nao encontrada para company_id: ' || v_pedido.company_id;
    END IF;
    
    v_result := 'PEDIDO: ' || v_pedido.numero_pedido || 
                ', CLIENTE: ' || v_pedido.nome_cliente ||
                ', TELEFONE: ' || v_pedido.telefone ||
                ', WHATSAPP: ' || v_whatsapp.instance_key ||
                ', STATUS: OK';
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- EXECUTAR TESTE MANUAL PARA PEDIDO 12
SELECT test_whatsapp_manual('12') as diagnostic_result;
