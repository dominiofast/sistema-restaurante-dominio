-- ===================================
-- CORREÇÃO COMPLETA: Variáveis e Horários Reais
-- ===================================

-- 1. Corrigir template da 300graus ({{nome_empresa}} → {{company_name}})
UPDATE ai_agent_prompts 
SET template = REPLACE(template, '{{nome_empresa}}', '{{company_name}}')
WHERE agent_slug = '300graus';

-- 2. Corrigir template da cookielab
UPDATE ai_agent_prompts 
SET template = REPLACE(template, '{{nome_empresa}}', '{{company_name}}')
WHERE agent_slug = 'cookielab';

-- 3. Corrigir template da quadratapizzas
UPDATE ai_agent_prompts 
SET template = REPLACE(template, '{{nome_empresa}}', '{{company_name}}')
WHERE agent_slug = 'quadratapizzas';

-- 4. Aplicar horários reais para DOMÍNIO PIZZAS
UPDATE ai_agent_prompts 
SET 
    template = REPLACE(template, 'Horários específicos da loja - verificar dados disponíveis', 'HORÁRIOS DE FUNCIONAMENTO REAIS: Domingo: 17:45-23:59 | Segunda: 17:45-23:30 | Terça: 17:45-23:30 | Quarta: 10:45-23:30 | Quinta: 17:45-23:30 | Sexta: 17:45-23:30 | Sábado: 17:45-23:30'),
    vars = jsonb_set(vars, '{working_hours}', '"HORÁRIOS REAIS: Domingo: 17:45-23:59 | Segunda: 17:45-23:30 | Terça: 17:45-23:30 | Quarta: 10:45-23:30 | Quinta: 17:45-23:30 | Sexta: 17:45-23:30 | Sábado: 17:45-23:30"'::jsonb),
    version = version + 1,
    updated_at = NOW()
WHERE agent_slug = 'dominiopizzas';

-- 5. Aplicar horários reais para 300GRAUS
UPDATE ai_agent_prompts 
SET 
    template = REPLACE(template, 'Horários específicos da loja - verificar dados disponíveis', 'HORÁRIOS DE FUNCIONAMENTO REAIS: Domingo: 18:00-23:30 | Segunda: 18:00-23:30 | Terça: 10:00-23:30 | Quarta: 10:00-23:30 | Quinta: 10:00-23:30 | Sexta: 18:00-23:30 | Sábado: 10:00-23:30'),
    vars = jsonb_set(vars, '{working_hours}', '"HORÁRIOS REAIS: Domingo: 18:00-23:30 | Segunda: 18:00-23:30 | Terça: 10:00-23:30 | Quarta: 10:00-23:30 | Quinta: 10:00-23:30 | Sexta: 18:00-23:30 | Sábado: 10:00-23:30"'::jsonb),
    version = version + 1,
    updated_at = NOW()
WHERE agent_slug = '300graus';

-- 6. Aplicar horários reais para COOKIELAB
UPDATE ai_agent_prompts 
SET 
    template = REPLACE(template, 'Horários específicos da loja - verificar dados disponíveis', 'HORÁRIOS DE FUNCIONAMENTO REAIS: Segunda a Sábado: 10:00-15:00 | Domingo: FECHADO'),
    vars = jsonb_set(vars, '{working_hours}', '"HORÁRIOS REAIS: Segunda a Sábado: 10:00-15:00 | Domingo: FECHADO"'::jsonb),
    version = version + 1,
    updated_at = NOW()
WHERE agent_slug = 'cookielab';

-- 7. Aplicar horários reais para QUADRATA PIZZAS
UPDATE ai_agent_prompts 
SET 
    template = REPLACE(template, 'Horários específicos da loja - verificar dados disponíveis', 'HORÁRIOS DE FUNCIONAMENTO REAIS: Domingo: 17:45-23:30 | Segunda: 10:45-23:30 | Terça: 17:45-23:30 | Quarta: 17:45-23:30 | Quinta: 17:45-23:30 | Sexta: 14:45-23:30 | Sábado: 10:45-23:30'),
    vars = jsonb_set(vars, '{working_hours}', '"HORÁRIOS REAIS: Domingo: 17:45-23:30 | Segunda: 10:45-23:30 | Terça: 17:45-23:30 | Quarta: 17:45-23:30 | Quinta: 17:45-23:30 | Sexta: 14:45-23:30 | Sábado: 10:45-23:30"'::jsonb),
    version = version + 1,
    updated_at = NOW()
WHERE agent_slug = 'quadratapizzas';

-- 8. Adicionar regras críticas contra invenção de horários em TODOS os prompts
UPDATE ai_agent_prompts 
SET template = template || E'\n\n🚨 REGRAS CRÍTICAS SOBRE HORÁRIOS:\n- JAMAIS invente horários que não estejam especificados acima\n- SEMPRE use EXATAMENTE os horários fornecidos\n- Se não souber, diga: "Preciso verificar com a equipe"\n- NUNCA crie horários diferentes dos listados\n- NUNCA use expressões como "das 11h às 22h" se não estiver nos dados'
WHERE agent_slug IN ('dominiopizzas', '300graus', 'cookielab', 'quadratapizzas');