-- Script para configurar a API do Firecrawl
-- Execute este script após obter sua chave da API em https://www.firecrawl.dev/

-- Inserir ou atualizar a chave da API do Firecrawl
INSERT INTO app_settings (key, value, created_at, updated_at)
VALUES (
  'FIRECRAWL_API_KEY',
  'fc-987060ceb5834d139f247bf55db7a249', -- Chave da API do Firecrawl configurada
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verificar se a configuração foi inserida
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

-- Comentário: Para obter sua chave da API do Firecrawl:
-- 1. Acesse https://www.firecrawl.dev/
-- 2. Faça login ou crie uma conta
-- 3. Vá para a seção de API Keys
-- 4. Copie sua chave e substitua 'SUA_CHAVE_API_AQUI' no script acima
-- 5. Execute este script no seu banco Supabase
