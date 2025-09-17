-- CRIAR COLUNA ACTIVATED_AT - SCRIPT SIMPLES
-- Execute este script primeiro

-- 1. ADICIONAR COLUNA ACTIVATED_AT
ALTER TABLE public.cashback_config 
ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE;

-- 2. VERIFICAR SE A COLUNA FOI CRIADA
SELECT 
    'COLUNA CRIADA' as status,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'cashback_config' 
  AND column_name = 'activated_at';

-- 3. ATUALIZAR VALORES PADRÃO
UPDATE public.cashback_config 
SET activated_at = created_at 
WHERE activated_at IS NULL;

-- 4. VERIFICAR RESULTADO
SELECT 
    'DADOS ATUALIZADOS' as status,
    company_id,
    percentual_cashback,
    is_active,
    activated_at
FROM cashback_config
LIMIT 5;
