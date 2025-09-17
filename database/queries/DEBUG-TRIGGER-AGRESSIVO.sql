-- DEBUG AGRESSIVO - VERIFICAR SE TRIGGER REALMENTE EXECUTA

-- 1. CRIAR TABELA DE LOG PARA TER CERTEZA
CREATE TABLE IF NOT EXISTS trigger_debug_log (
    id SERIAL PRIMARY KEY,
    message TEXT,
    pedido_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. VERIFICAR SE TRIGGER EXISTE E ESTÁ ATIVO
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled as enabled,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ATIVO'
        WHEN t.tgenabled = 'D' THEN 'DESABILITADO'
        ELSE 'STATUS: ' || t.tgenabled
    END as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal;

-- 3. DROPAR E RECRIAR FUNCAO COM LOG EM TABELA
DROP TRIGGER IF EXISTS trigger_whatsapp_funcionando ON pedido_itens;
DROP FUNCTION IF EXISTS send_whatsapp_notification_after_items() CASCADE;

-- FUNCAO SUPER SIMPLES APENAS PARA REGISTRAR EXECUCAO
CREATE OR REPLACE FUNCTION send_whatsapp_notification_after_items()
RETURNS TRIGGER AS $$
BEGIN
    -- REGISTRAR NA TABELA QUE TRIGGER EXECUTOU
    INSERT INTO trigger_debug_log (message, pedido_id) 
    VALUES ('TRIGGER EXECUTOU!', NEW.pedido_id);
    
    -- RETORNAR SEM FAZER NADA MAIS
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO trigger_debug_log (message, pedido_id) 
        VALUES ('ERRO NO TRIGGER: ' || SQLERRM, NEW.pedido_id);
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RECRIAR TRIGGER
CREATE TRIGGER trigger_debug_simples
    AFTER INSERT ON pedido_itens
    FOR EACH ROW
    EXECUTE FUNCTION send_whatsapp_notification_after_items();

-- 4. TESTAR MANUALMENTE INSERINDO UM ITEM
-- Pegar um pedido existente para testar
WITH ultimo_pedido AS (
    SELECT id as pedido_id, company_id 
    FROM pedidos 
    ORDER BY created_at DESC 
    LIMIT 1
),
produto_teste AS (
    SELECT id as produto_id
    FROM produtos 
    WHERE company_id = (SELECT company_id FROM ultimo_pedido)
    LIMIT 1
)
INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, valor_unitario, valor_total)
SELECT 
    up.pedido_id,
    pt.produto_id,
    1,
    10.00,
    10.00
FROM ultimo_pedido up, produto_teste pt;

-- 5. VERIFICAR SE TRIGGER EXECUTOU
SELECT 
    COUNT(*) as total_logs,
    'LOGS DO TRIGGER' as info
FROM trigger_debug_log;

-- 6. VER OS LOGS
SELECT * 
FROM trigger_debug_log 
ORDER BY created_at DESC 
LIMIT 5;
