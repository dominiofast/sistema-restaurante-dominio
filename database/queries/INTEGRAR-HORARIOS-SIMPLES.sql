-- 🔄 INTEGRAR HORÁRIOS PADRÃO AOS PROMPTS DE IA
-- Versão simplificada que funciona sem depender de tabelas específicas

-- ================================
-- ATUALIZAR PROMPTS COM HORÁRIOS PADRÃO
-- ================================

-- 1. Atualizar todos os prompts com horários padrão
UPDATE ai_agent_prompts 
SET 
    vars = jsonb_set(
        COALESCE(vars, '{}'::jsonb),
        '{working_hours}',
        '"Segunda a Sexta: 17:45 às 23:30 | Sábado: 17:45 às 23:30 | Domingo: 17:45 às 23:59"'
    ),
    version = COALESCE(version, 0) + 1,
    updated_at = NOW()
WHERE agent_slug IS NOT NULL;

-- 2. Verificar resultado da atualização
SELECT 
    'PROMPTS ATUALIZADOS' as status,
    c.name as empresa,
    c.slug as agent_slug,
    p.vars->>'working_hours' as horarios_integrados,
    p.version,
    p.updated_at
FROM companies c
LEFT JOIN ai_agent_prompts p ON p.agent_slug = c.slug
WHERE c.slug IS NOT NULL
ORDER BY c.name;

-- ================================
-- FUNÇÃO PARA ATUALIZAR HORÁRIOS AUTOMATICAMENTE
-- ================================

-- 3. Criar função para atualizar horários automaticamente
CREATE OR REPLACE FUNCTION update_ai_prompts_with_default_hours()
RETURNS void AS $$
DECLARE
    company_record RECORD;
BEGIN
    FOR company_record IN 
        SELECT c.id, c.name, c.slug 
        FROM companies c 
        WHERE c.slug IS NOT NULL
    LOOP
        -- Atualizar prompt da empresa com horários padrão
        UPDATE ai_agent_prompts 
        SET 
            vars = jsonb_set(
                COALESCE(vars, '{}'::jsonb),
                '{working_hours}',
                '"Segunda a Sexta: 17:45 às 23:30 | Sábado: 17:45 às 23:30 | Domingo: 17:45 às 23:59"'
            ),
            version = COALESCE(version, 0) + 1,
            updated_at = NOW()
        WHERE agent_slug = company_record.slug;
        
        RAISE NOTICE 'Horários padrão aplicados para %', company_record.name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Executar função para atualizar todos os horários
SELECT update_ai_prompts_with_default_hours();

-- 5. Verificar resultado final
SELECT 
    'RESULTADO FINAL' as status,
    c.name as empresa,
    c.slug as agent_slug,
    p.vars->>'working_hours' as horarios_finais,
    p.version,
    p.updated_at
FROM companies c
LEFT JOIN ai_agent_prompts p ON p.agent_slug = c.slug
WHERE c.slug IS NOT NULL
ORDER BY c.name;

-- ================================
-- MENSAGEM DE SUCESSO
-- ================================

SELECT 
    '🎉 SUCESSO!' as status,
    'Todos os prompts foram atualizados com horários padrão' as mensagem,
    COUNT(*) as total_empresas_atualizadas
FROM ai_agent_prompts
WHERE vars->>'working_hours' IS NOT NULL;
