-- Verificar se existe configuração de OpenAI
SELECT key, value FROM app_settings WHERE key = 'openai_api_key' LIMIT 1;