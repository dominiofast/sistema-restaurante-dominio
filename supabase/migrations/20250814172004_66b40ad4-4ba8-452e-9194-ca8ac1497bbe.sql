-- Reduzir ainda mais max_tokens para 100 para respostas mais rápidas
UPDATE ai_global_config 
SET max_tokens = 100
WHERE is_active = true;