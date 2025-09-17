-- Corrigir a configuração da chave OpenAI
UPDATE ai_global_config 
SET openai_api_key = 'sk-proj-...' -- A chave real da OpenAI
WHERE openai_api_key = 'USE_SUPABASE_SECRET';

-- Verificar a configuração atual
SELECT 
  id,
  openai_api_key,
  openai_model,
  max_tokens,
  temperature,
  is_active
FROM ai_global_config 
WHERE is_active = true;