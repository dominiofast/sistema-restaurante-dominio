-- Corrigir estrutura das tabelas de horário de funcionamento

-- 1. Adicionar campo horarios_detalhados faltante na tabela horario_funcionamento
ALTER TABLE horario_funcionamento 
ADD COLUMN IF NOT EXISTS horarios_detalhados text;

-- 2. Remover triggers problemáticos se existirem
DROP TRIGGER IF EXISTS update_ai_prompts_on_horario_change ON horario_funcionamento;
DROP TRIGGER IF EXISTS update_ai_prompts_on_horarios_dias_change ON horarios_dias;

-- 3. Criar trigger correto para atualizar prompts quando horário muda
CREATE OR REPLACE FUNCTION update_ai_prompts_on_horario_change()
RETURNS TRIGGER AS $$
DECLARE
    company_rec RECORD;
BEGIN
    -- Buscar informações da empresa usando company_id do registro
    SELECT slug, name INTO company_rec
    FROM public.companies
    WHERE id = COALESCE(NEW.company_id, OLD.company_id);
    
    -- Se a empresa tem slug, atualizar o prompt
    IF company_rec.slug IS NOT NULL THEN
        PERFORM create_prompt_from_global_template(company_rec.slug, company_rec.name);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger para horarios_dias (que NÃO tem company_id direto)
CREATE OR REPLACE FUNCTION update_ai_prompts_on_horarios_dias_change()
RETURNS TRIGGER AS $$
DECLARE
    company_rec RECORD;
    horario_funcionamento_rec RECORD;
BEGIN
    -- Buscar company_id através da tabela horario_funcionamento
    SELECT company_id INTO horario_funcionamento_rec
    FROM public.horario_funcionamento
    WHERE id = COALESCE(NEW.horario_funcionamento_id, OLD.horario_funcionamento_id);
    
    -- Buscar informações da empresa
    SELECT slug, name INTO company_rec
    FROM public.companies
    WHERE id = horario_funcionamento_rec.company_id;
    
    -- Se a empresa tem slug, atualizar o prompt
    IF company_rec.slug IS NOT NULL THEN
        PERFORM create_prompt_from_global_template(company_rec.slug, company_rec.name);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recriar triggers com segurança
CREATE TRIGGER update_ai_prompts_on_horario_change
    AFTER INSERT OR UPDATE OR DELETE ON horario_funcionamento
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_prompts_on_horario_change();

CREATE TRIGGER update_ai_prompts_on_horarios_dias_change
    AFTER INSERT OR UPDATE OR DELETE ON horarios_dias
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_prompts_on_horarios_dias_change();

-- 6. Garantir que a função create_prompt_from_global_template existe
CREATE OR REPLACE FUNCTION create_prompt_from_global_template(agent_slug text, company_name text)
RETURNS void AS $$
DECLARE
    global_template RECORD;
    template_with_vars TEXT;
BEGIN
    -- Buscar template global ativo
    SELECT template, default_vars INTO global_template
    FROM public.ai_global_prompt_template
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não há template global, não fazer nada
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Substituir variáveis básicas no template
    template_with_vars := replace(global_template.template, '{{company_name}}', company_name);
    template_with_vars := replace(template_with_vars, '{{agent_slug}}', agent_slug);
    
    -- Inserir ou atualizar prompt para o agente
    INSERT INTO public.ai_agent_prompts (agent_slug, template, vars, version, updated_at)
    VALUES (agent_slug, template_with_vars, global_template.default_vars, 1, now())
    ON CONFLICT (agent_slug) DO UPDATE SET
        template = EXCLUDED.template,
        vars = EXCLUDED.vars,
        version = ai_agent_prompts.version + 1,
        updated_at = now();
        
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não interromper a operação principal
        RAISE NOTICE 'Erro ao criar prompt: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;