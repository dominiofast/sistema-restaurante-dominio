-- Corrigir configuração da OpenAI para usar a chave do Supabase Secrets
UPDATE ai_global_config 
SET openai_api_key = 'SUPABASE_SECRET'
WHERE openai_api_key = 'sk-proj-...';

-- Verificar a configuração atualizada
SELECT 
  id,
  openai_api_key,
  openai_model,
  max_tokens,
  temperature,
  is_active
FROM ai_global_config 
WHERE is_active = true;