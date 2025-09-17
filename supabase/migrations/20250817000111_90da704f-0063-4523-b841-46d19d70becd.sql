-- Manter apenas 1 template global ativo (o mais recente)
-- Desativar todos os templates exceto o mais recente

UPDATE ai_global_config 
SET is_active = false 
WHERE id != 'bbfaabc0-7b70-48cf-9d04-255a21b4c1bc';

-- Garantir que apenas o template mais recente está ativo
UPDATE ai_global_config 
SET is_active = true 
WHERE id = 'bbfaabc0-7b70-48cf-9d04-255a21b4c1bc';