-- Excluir templates globais antigos, mantendo apenas o que funciona
-- O template ativo que funciona é: bbfaabc0-7b70-48cf-9d04-255a21b4c1bc

DELETE FROM ai_global_config 
WHERE id != 'bbfaabc0-7b70-48cf-9d04-255a21b4c1bc';

-- Confirmar que apenas 1 template global resta
SELECT COUNT(*) as total_templates FROM ai_global_config;