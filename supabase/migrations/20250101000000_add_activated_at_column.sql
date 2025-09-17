-- Adicionar coluna activated_at à tabela cashback_config
ALTER TABLE public.cashback_config 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;

-- Atualizar valores padrão
UPDATE public.cashback_config 
SET activated_at = created_at 
WHERE activated_at IS NULL;
