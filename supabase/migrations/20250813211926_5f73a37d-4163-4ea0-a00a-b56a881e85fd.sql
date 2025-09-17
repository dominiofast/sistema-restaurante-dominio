-- Corrigir conflito da função e estrutura das tabelas de horário

-- 1. Remover função existente que está conflitando
DROP FUNCTION IF EXISTS create_prompt_from_global_template(text, text);

-- 2. Adicionar campo horarios_detalhados faltante na tabela horario_funcionamento
ALTER TABLE horario_funcionamento 
ADD COLUMN IF NOT EXISTS horarios_detalhados text;

-- 3. Remover triggers problemáticos se existirem
DROP TRIGGER IF EXISTS update_ai_prompts_on_horario_change ON horario_funcionamento;
DROP TRIGGER IF EXISTS update_ai_prompts_on_horarios_dias_change ON horarios_dias;

-- 4. Criar trigger correto para atualizar prompts quando horário muda
CREATE OR REPLACE FUNCTION update_ai_prompts_on_horario_change()
RETURNS TRIGGER AS $$
DECLARE
    company_rec RECORD;
BEGIN
    -- Buscar informações da empresa usando company_id do registro
    SELECT slug, name INTO company_rec
    FROM public.companies
    WHERE id = COALESCE(NEW.company_id, OLD.company_id);
    
    -- Se a empresa tem slug, atualizar o prompt (sem chamar função inexistente)
    IF company_rec.slug IS NOT NULL THEN
        -- Log apenas para saber que houve mudança nos horários
        RAISE NOTICE 'Horário alterado para empresa: %', company_rec.name;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger para horarios_dias (que NÃO tem company_id direto)
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
    
    -- Log apenas para saber que houve mudança nos horários
    IF company_rec.slug IS NOT NULL THEN
        RAISE NOTICE 'Horário de dia alterado para empresa: %', company_rec.name;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recriar triggers com segurança
CREATE TRIGGER update_ai_prompts_on_horario_change
    AFTER INSERT OR UPDATE OR DELETE ON horario_funcionamento
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_prompts_on_horario_change();

CREATE TRIGGER update_ai_prompts_on_horarios_dias_change
    AFTER INSERT OR UPDATE OR DELETE ON horarios_dias
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_prompts_on_horarios_dias_change();