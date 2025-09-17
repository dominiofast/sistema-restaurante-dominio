-- Corrigir o template global para usar {{cardapio_url}} em vez de {{link_cardapio}}
UPDATE ai_global_prompt_template 
SET template = REPLACE(template, '{{link_cardapio}}', '{{cardapio_url}}')
WHERE is_active = true;