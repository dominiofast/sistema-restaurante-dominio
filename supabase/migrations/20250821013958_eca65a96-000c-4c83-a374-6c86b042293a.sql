-- 🚫 DESATIVAR TODOS OS ASSISTANTS DA OPENAI TEMPORARIAMENTE
UPDATE ai_agent_assistants 
SET is_active = false 
WHERE is_active = true;

-- 🚫 DESATIVAR TODAS AS CONFIGURAÇÕES DE IA
UPDATE ai_agent_config 
SET is_active = false 
WHERE is_active = true;

-- Verificar quantos foram desativados
SELECT 
  'ai_agent_assistants' as tabela, 
  COUNT(*) as total_desativados 
FROM ai_agent_assistants 
WHERE is_active = false

UNION ALL

SELECT 
  'ai_agent_config' as tabela, 
  COUNT(*) as total_desativados 
FROM ai_agent_config 
WHERE is_active = false;