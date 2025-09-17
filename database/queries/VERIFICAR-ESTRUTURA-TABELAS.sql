-- 🔍 VERIFICAR ESTRUTURA REAL DAS TABELAS DE HORÁRIOS
-- Descobrir os nomes corretos das colunas

-- ================================
-- VERIFICAR SE AS TABELAS EXISTEM
-- ================================

SELECT 
    'TABELAS EXISTENTES' as status,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name LIKE '%hora%' OR table_name LIKE '%dia%' OR table_name LIKE '%funcionamento%'
ORDER BY table_name;

-- ================================
-- VERIFICAR ESTRUTURA COMPLETA
-- ================================

-- 1. Estrutura da tabela horarios_dias
SELECT 
    'ESTRUTURA HORARIOS_DIAS' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'horarios_dias'
ORDER BY ordinal_position;

-- 2. Estrutura da tabela horario_funcionamento
SELECT 
    'ESTRUTURA HORARIO_FUNCIONAMENTO' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'horario_funcionamento'
ORDER BY ordinal_position;

-- 3. Verificar se existe alguma tabela com horários
SELECT 
    'TODAS AS TABELAS COM HORÁRIOS' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
AND (column_name LIKE '%hora%' OR column_name LIKE '%dia%' OR column_name LIKE '%funcionamento%')
ORDER BY table_name, ordinal_position;

-- ================================
-- VERIFICAR DADOS EXISTENTES
-- ================================

-- 4. Verificar se há dados nas tabelas
SELECT 
    'DADOS EM HORARIOS_DIAS' as status,
    COUNT(*) as total_registros
FROM horarios_dias;

SELECT 
    'DADOS EM HORARIO_FUNCIONAMENTO' as status,
    COUNT(*) as total_registros
FROM horario_funcionamento;

-- 5. Verificar alguns registros de exemplo
SELECT 
    'EXEMPLO HORARIOS_DIAS' as status,
    *
FROM horarios_dias
LIMIT 3;

SELECT 
    'EXEMPLO HORARIO_FUNCIONAMENTO' as status,
    *
FROM horario_funcionamento
LIMIT 3;

-- ================================
-- VERIFICAR RELACIONAMENTOS
-- ================================

-- 6. Verificar chaves estrangeiras
SELECT 
    'CHAVES ESTRANGEIRAS' as status,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (tc.table_name LIKE '%hora%' OR tc.table_name LIKE '%dia%' OR tc.table_name LIKE '%funcionamento%')
ORDER BY tc.table_name, kcu.column_name;
