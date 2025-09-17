-- Adicionar campo para armazenar o nome original do arquivo de currículo
ALTER TABLE rh_inscricoes 
ADD COLUMN curriculo_nome TEXT;

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rh_inscricoes' 
AND column_name IN ('curriculo_url', 'curriculo_nome'); 