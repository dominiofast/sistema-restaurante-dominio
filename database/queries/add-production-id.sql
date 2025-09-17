-- Adicionar campo production_id na tabela mercado_pago_config
ALTER TABLE mercado_pago_config 
ADD COLUMN IF NOT EXISTS production_id text;
