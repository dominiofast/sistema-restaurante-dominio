-- VERIFICAR E CORRIGIR CONSTRAINTS DA TABELA CASHBACK_TRANSACTIONS
-- Execute este script para diagnosticar problemas de constraint

-- 1. VERIFICAR CONSTRAINTS EXISTENTES
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'cashback_transactions'
AND tc.table_schema = 'public';

-- 2. VERIFICAR SE A CONSTRAINT check_valor_positivo EXISTE
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_valor_positivo'
AND constraint_schema = 'public';

-- 3. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cashback_transactions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. OPÇÃO 1: REMOVER A CONSTRAINT PROBLEMÁTICA (se existir)
-- DESCOMENTE APENAS SE NECESSÁRIO
/*
ALTER TABLE public.cashback_transactions 
DROP CONSTRAINT IF EXISTS check_valor_positivo;
*/

-- 5. OPÇÃO 2: MODIFICAR A CONSTRAINT PARA PERMITIR VALORES ZERO
-- DESCOMENTE APENAS SE NECESSÁRIO
/*
-- Remover constraint antiga
ALTER TABLE public.cashback_transactions 
DROP CONSTRAINT IF EXISTS check_valor_positivo;

-- Adicionar nova constraint que permite zero
ALTER TABLE public.cashback_transactions 
ADD CONSTRAINT check_valor_positivo 
CHECK (valor >= 0);
*/

-- 6. OPÇÃO 3: CRIAR CONSTRAINT MAIS FLEXÍVEL
-- DESCOMENTE APENAS SE NECESSÁRIO
/*
-- Remover constraint antiga
ALTER TABLE public.cashback_transactions 
DROP CONSTRAINT IF EXISTS check_valor_positivo;

-- Adicionar constraint que permite zero e valores positivos
ALTER TABLE public.cashback_transactions 
ADD CONSTRAINT check_valor_nao_negativo 
CHECK (valor >= 0);

-- Adicionar constraint para valores de débito (negativos) e crédito (positivos)
ALTER TABLE public.cashback_transactions 
ADD CONSTRAINT check_valor_por_tipo 
CHECK (
    (tipo = 'credito' AND valor > 0) OR 
    (tipo = 'debito' AND valor > 0)
);
*/

-- 7. TESTAR INSERÇÃO COM VALOR ZERO (após corrigir constraint)
-- DESCOMENTE APENAS APÓS CORRIGIR A CONSTRAINT
/*
INSERT INTO public.cashback_transactions (
    company_id,
    customer_phone,
    customer_name,
    tipo,
    valor,
    pedido_id,
    descricao
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'SISTEMA',
    'Sistema',
    'credito',
    0,
    NULL,
    'TESTE: Verificação de constraint corrigida'
);
*/

-- 8. INSTRUÇÕES PARA RESOLVER O PROBLEMA
/*
INSTRUÇÕES PARA RESOLVER O ERRO DE CONSTRAINT:

1. Execute este script para verificar as constraints existentes
2. Identifique qual constraint está causando o problema
3. Escolha uma das opções (4, 5 ou 6) para corrigir
4. Execute a correção escolhida
5. Teste a inserção com valor zero (opção 7)
6. Execute novamente o script CORRECAO-CASHBACK-DUPLICADO.sql

ALTERNATIVA RÁPIDA:
Se você quiser apenas resolver o problema imediatamente, execute:

ALTER TABLE public.cashback_transactions 
DROP CONSTRAINT IF EXISTS check_valor_positivo;

ALTER TABLE public.cashback_transactions 
ADD CONSTRAINT check_valor_nao_negativo 
CHECK (valor >= 0);

Isso permitirá valores zero e positivos, resolvendo o erro.
*/
