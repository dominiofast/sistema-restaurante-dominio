-- =====================================================
-- VERIFICAR ESTRUTURA REAL DA TABELA PEDIDOS
-- =====================================================

-- 1. VERIFICAR COLUNAS DA TABELA PEDIDOS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE EXISTE COLUNA DE PAGAMENTO
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'pedidos'
AND column_name LIKE '%pagamento%'
OR column_name LIKE '%payment%'
OR column_name LIKE '%forma%';

-- 3. VERIFICAR ÚLTIMOS PEDIDOS PARA VER ESTRUTURA
SELECT 
    id,
    numero_pedido,
    nome,
    telefone,
    tipo,
    total,
    created_at
FROM pedidos
ORDER BY created_at DESC
LIMIT 3;

-- 4. VERIFICAR SE HÁ OUTRAS TABELAS RELACIONADAS A PAGAMENTO
SELECT 
    table_name,
    column_name
FROM information_schema.columns
WHERE table_name LIKE '%pagamento%'
OR table_name LIKE '%payment%'
OR column_name LIKE '%pagamento%'
OR column_name LIKE '%payment%';
