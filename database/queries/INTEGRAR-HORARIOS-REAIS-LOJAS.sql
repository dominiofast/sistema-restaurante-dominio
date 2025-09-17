-- 🔄 INTEGRAR HORÁRIOS REAIS DAS LOJAS AOS PROMPTS DE IA
-- Buscar horários reais das tabelas e integrar aos prompts

-- ================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- ================================

-- 1. Verificar estrutura das tabelas de horários
SELECT 
    'VERIFICANDO TABELAS DE HORÁRIOS' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('horario_funcionamento', 'horarios_dias', 'app_settings')
AND column_name LIKE '%hora%' OR column_name LIKE '%dia%' OR column_name LIKE '%funcionamento%'
ORDER BY table_name, ordinal_position;

-- 2. Verificar dados existentes nas tabelas
SELECT 
    'DADOS EM HORARIO_FUNCIONAMENTO' as status,
    COUNT(*) as total_registros
FROM horario_funcionamento;

SELECT 
    'DADOS EM HORARIOS_DIAS' as status,
    COUNT(*) as total_registros
FROM horarios_dias;

-- 3. Verificar estrutura específica das tabelas
SELECT 
    'ESTRUTURA HORARIO_FUNCIONAMENTO' as status,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'horario_funcionamento'
ORDER BY ordinal_position;

SELECT 
    'ESTRUTURA HORARIOS_DIAS' as status,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'horarios_dias'
ORDER BY ordinal_position;

-- ================================
-- BUSCAR HORÁRIOS REAIS DAS LOJAS
-- ================================

-- 4. Buscar horários reais das lojas (versão corrigida)
WITH horarios_lojas AS (
    SELECT 
        c.id as company_id,
        c.name as company_name,
        c.slug as company_slug,
        COALESCE(
            -- Tentar buscar de horarios_dias (estrutura mais comum)
            (SELECT string_agg(
                dia_semana || ': ' || horario_inicio || ' às ' || horario_fim, 
                ' | '
            ) FROM horarios_dias hd 
            WHERE hd.empresa_id = c.id),
            
            -- Tentar buscar de horario_funcionamento (estrutura alternativa)
            (SELECT string_agg(
                COALESCE(dia, 'Dia') || ': ' || COALESCE(horario_inicio, '00:00') || ' às ' || COALESCE(horario_fim, '23:59'), 
                ' | '
            ) FROM horario_funcionamento hf 
            WHERE hf.empresa_id = c.id),
            
            -- Fallback para horários padrão
            'Segunda a Sexta: 17:45 às 23:30 | Sábado: 17:45 às 23:30 | Domingo: 17:45 às 23:59'
        ) as horarios_reais
    FROM companies c
    WHERE c.slug IS NOT NULL
)
SELECT 
    'HORÁRIOS ENCONTRADOS' as status,
    company_name,
    company_slug,
    horarios_reais
FROM horarios_lojas
ORDER BY company_name;

-- ================================
-- ATUALIZAR PROMPTS COM HORÁRIOS REAIS
-- ================================

-- 5. Atualizar prompts com horários reais (versão corrigida)
WITH horarios_lojas AS (
    SELECT 
        c.id as company_id,
        c.name as company_name,
        c.slug as company_slug,
        COALESCE(
            -- Tentar buscar de horarios_dias (estrutura mais comum)
            (SELECT string_agg(
                dia_semana || ': ' || horario_inicio || ' às ' || horario_fim, 
                ' | '
            ) FROM horarios_dias hd 
            WHERE hd.empresa_id = c.id),
            
            -- Tentar buscar de horario_funcionamento (estrutura alternativa)
            (SELECT string_agg(
                COALESCE(dia, 'Dia') || ': ' || COALESCE(horario_inicio, '00:00') || ' às ' || COALESCE(horario_fim, '23:59'), 
                ' | '
            ) FROM horario_funcionamento hf 
            WHERE hf.empresa_id = c.id),
            
            -- Fallback para horários padrão
            'Segunda a Sexta: 17:45 às 23:30 | Sábado: 17:45 às 23:30 | Domingo: 17:45 às 23:59'
        ) as horarios_reais
    FROM companies c
    WHERE c.slug IS NOT NULL
)
UPDATE ai_agent_prompts 
SET 
    vars = jsonb_set(
        COALESCE(vars, '{}'::jsonb),
        '{working_hours}',
        to_jsonb(hl.horarios_reais)
    ),
    version = COALESCE(version, 0) + 1,
    updated_at = NOW()
FROM horarios_lojas hl
WHERE ai_agent_prompts.agent_slug = hl.company_slug;

-- 6. Verificar resultado da atualização
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

-- 7. Criar função para atualizar horários automaticamente (versão corrigida)
CREATE OR REPLACE FUNCTION update_ai_prompts_with_hours()
RETURNS void AS $$
DECLARE
    company_record RECORD;
    horarios_text TEXT;
BEGIN
    FOR company_record IN 
        SELECT c.id, c.name, c.slug 
        FROM companies c 
        WHERE c.slug IS NOT NULL
    LOOP
        -- Buscar horários da empresa (versão corrigida)
        SELECT COALESCE(
            -- Tentar buscar de horarios_dias (estrutura mais comum)
            (SELECT string_agg(
                dia_semana || ': ' || horario_inicio || ' às ' || horario_fim, 
                ' | '
            ) FROM horarios_dias hd 
            WHERE hd.empresa_id = company_record.id),
            
            -- Tentar buscar de horario_funcionamento (estrutura alternativa)
            (SELECT string_agg(
                COALESCE(dia, 'Dia') || ': ' || COALESCE(horario_inicio, '00:00') || ' às ' || COALESCE(horario_fim, '23:59'), 
                ' | '
            ) FROM horario_funcionamento hf 
            WHERE hf.empresa_id = company_record.id),
            
            -- Fallback para horários padrão
            'Segunda a Sexta: 17:45 às 23:30 | Sábado: 17:45 às 23:30 | Domingo: 17:45 às 23:59'
        ) INTO horarios_text;
        
        -- Atualizar prompt da empresa
        UPDATE ai_agent_prompts 
        SET 
            vars = jsonb_set(
                COALESCE(vars, '{}'::jsonb),
                '{working_hours}',
                to_jsonb(horarios_text)
            ),
            version = COALESCE(version, 0) + 1,
            updated_at = NOW()
        WHERE agent_slug = company_record.slug;
        
        RAISE NOTICE 'Horários atualizados para %: %', company_record.name, horarios_text;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Executar função para atualizar todos os horários
SELECT update_ai_prompts_with_hours();

-- 9. Verificar resultado final
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
