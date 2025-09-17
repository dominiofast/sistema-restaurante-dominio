-- Otimizar configuração de IA para respostas mais rápidas
UPDATE ai_global_config 
SET 
  max_tokens = 150,  -- Reduzir de 400 para 150 tokens para respostas mais concisas
  temperature = 0.1  -- Reduzir de 0.3 para 0.1 para respostas mais diretas
WHERE is_active = true;