-- Script para configurar a API do Firecrawl com a chave fornecida
-- Execute este script no SQL Editor do Supabase

-- Inserir ou atualizar a chave da API do Firecrawl
INSERT INTO app_settings (key, value, created_at, updated_at)
VALUES (
  'FIRECRAWL_API_KEY',
  'fc-987060ceb5834d139f247bf55db7a249',
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verificar se a configuração foi inserida corretamente
SELECT 
  key,
  CASE 
    WHEN LENGTH(value) > 10 THEN CONCAT(LEFT(value, 10), '...')
    ELSE value 
  END as value_preview,
  created_at,
  updated_at
FROM app_settings 
WHERE key = 'FIRECRAWL_API_KEY';

-- Mensagem de confirmação
SELECT '✅ Chave da API do Firecrawl configurada com sucesso!' as status;
