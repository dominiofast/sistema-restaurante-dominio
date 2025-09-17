-- DEBUG WHATSAPP DETALHADO
-- Investigar por que nao chegam as notificacoes

-- 1. VERIFICAR SE TABELA WHATSAPP EXISTE E TEM DADOS
SELECT 'Verificando tabela whatsapp_integrations...' as info;

-- Tentar diferentes nomes de tabela
SELECT table_name 
FROM information_schema.tables 
WHERE table_name ILIKE '%whatsapp%' 
OR table_name ILIKE '%notification%'
OR table_name ILIKE '%integration%'
AND table_schema = 'public';

-- 2. SE EXISTIR, VER ESTRUTURA
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name ILIKE '%whatsapp%' 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA PEDIDOS (NOMES REAIS DAS COLUNAS)
SELECT 'Colunas da tabela pedidos:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA PEDIDO_ITENS
SELECT 'Colunas da tabela pedido_itens:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pedido_itens' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. VER SE TRIGGER FOI CRIADO
SELECT 'Trigger criado:' as info;
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'pedido_itens'
AND NOT t.tgisinternal;

-- 6. CRIAR FUNCAO DE TESTE SIMPLES
CREATE OR REPLACE FUNCTION test_trigger_manual()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Funcao de teste executada com sucesso - ' || NOW()::text;
END;
$$ LANGUAGE plpgsql;

-- Testar funcao simples
SELECT test_trigger_manual() as teste_funcao;

-- 7. VERIFICAR LOGS DE ERRO (se houver)
SELECT 'Debug concluido' as status;
