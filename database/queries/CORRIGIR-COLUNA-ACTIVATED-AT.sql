-- CORRIGIR: Adicionar coluna activated_at que está faltando
-- Execute este script primeiro

-- 1. ADICIONAR COLUNA ACTIVATED_AT
ALTER TABLE public.cashback_config 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;

-- 2. ATUALIZAR REGISTROS EXISTENTES
UPDATE public.cashback_config 
SET activated_at = created_at 
WHERE activated_at IS NULL AND is_active = true;

UPDATE public.cashback_config 
SET activated_at = now() 
WHERE activated_at IS NULL AND is_active = false;

-- 3. VERIFICAR SE A COLUNA FOI CRIADA
SELECT 
    'COLUNA STATUS' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cashback_config' 
  AND column_name = 'activated_at';

-- 4. VERIFICAR DADOS ATUALIZADOS
SELECT 
    'DADOS ATUALIZADOS' as tipo,
    company_id,
    percentual_cashback,
    valor_minimo_compra,
    is_active,
    activated_at,
    created_at
FROM cashback_config
ORDER BY company_id;
