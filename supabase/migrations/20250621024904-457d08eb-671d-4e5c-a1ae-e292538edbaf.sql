
-- Adiciona os campos de integração de cardápio e pedidos na tabela agente_ia_config, caso não existam
ALTER TABLE agente_ia_config
ADD COLUMN IF NOT EXISTS url_cardapio TEXT,
ADD COLUMN IF NOT EXISTS habilitar_lancamento_pedidos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS url_pedidos TEXT,
ADD COLUMN IF NOT EXISTS token_pedidos TEXT;
