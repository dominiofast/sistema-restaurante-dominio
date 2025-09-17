
-- Adicionar campo para arquivar inscrições
ALTER TABLE rh_inscricoes 
ADD COLUMN arquivado BOOLEAN DEFAULT FALSE;

-- Criar índice para otimizar consultas
CREATE INDEX idx_rh_inscricoes_arquivado ON rh_inscricoes(arquivado);
