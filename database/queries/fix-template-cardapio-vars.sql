-- ========================================
-- CORREÇÃO DAS VARIÁVEIS DO TEMPLATE GLOBAL DA IA
-- ========================================
-- Trocar {{link_cardapio}} por {{cardapio_url}} em todos os templates

-- Atualizar template global principal
UPDATE ai_global_prompt_template 
SET template = REPLACE(template, '{{link_cardapio}}', '{{cardapio_url}}')
WHERE is_active = true;

-- Atualizar default_vars também se tiver link_cardapio
UPDATE ai_global_prompt_template 
SET default_vars = default_vars::jsonb - 'link_cardapio' || jsonb_build_object('cardapio_url', COALESCE(default_vars->>'link_cardapio', 'https://pedido.dominio.tech'))
WHERE is_active = true AND default_vars ? 'link_cardapio';

-- Verificar o template após correção
SELECT 
  id,
  LEFT(template, 200) || '...' as template_preview,
  default_vars,
  is_active,
  (template LIKE '%{{cardapio_url}}%') as has_correct_var,
  (template LIKE '%{{link_cardapio}}%') as has_old_var
FROM ai_global_prompt_template 
WHERE is_active = true;
