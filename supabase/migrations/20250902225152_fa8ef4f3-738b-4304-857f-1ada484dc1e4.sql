-- Adicionar coluna is_active na tabela adicionais
ALTER TABLE public.adicionais 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Criar índice para melhor performance nas consultas por status
CREATE INDEX IF NOT EXISTS idx_adicionais_is_active 
ON public.adicionais(is_active);

-- Atualizar todos os adicionais existentes para ficarem ativos por padrão
UPDATE public.adicionais 
SET is_active = true 
WHERE is_active IS NULL;