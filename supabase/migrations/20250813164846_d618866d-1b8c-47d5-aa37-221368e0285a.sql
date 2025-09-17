-- Criar função para formatar horários de funcionamento
CREATE OR REPLACE FUNCTION public.format_working_hours(company_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    horario_rec RECORD;
    horarios_text TEXT := '';
    dia_horarios TEXT;
    horario_dia RECORD;
    dias_semana TEXT[] := ARRAY['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
BEGIN
    -- Buscar configuração de horário da empresa
    SELECT * INTO horario_rec
    FROM public.horario_funcionamento 
    WHERE company_id = company_uuid;
    
    -- Se não encontrou configuração, retornar padrão
    IF NOT FOUND THEN
        RETURN 'Consulte nossos horários de funcionamento';
    END IF;
    
    -- Verificar tipo de disponibilidade
    CASE horario_rec.tipo_disponibilidade
        WHEN 'sempre' THEN
            RETURN 'Sempre aberto - 24 horas por dia';
        WHEN 'fechado' THEN
            RETURN 'Fechado temporariamente';
        WHEN 'especificos' THEN
            -- Formatar horários específicos por dia
            FOR i IN 0..6 LOOP
                dia_horarios := '';
                
                -- Buscar horários do dia
                FOR horario_dia IN 
                    SELECT horario_inicio, horario_fim
                    FROM public.horarios_dias
                    WHERE horario_funcionamento_id = horario_rec.id
                    AND dia_semana = i
                    AND ativo = true
                    ORDER BY horario_inicio
                LOOP
                    IF dia_horarios != '' THEN
                        dia_horarios := dia_horarios || ' e ';
                    END IF;
                    dia_horarios := dia_horarios || horario_dia.horario_inicio || ' às ' || horario_dia.horario_fim;
                END LOOP;
                
                -- Adicionar ao texto final se há horários para este dia
                IF dia_horarios != '' THEN
                    IF horarios_text != '' THEN
                        horarios_text := horarios_text || ' | ';
                    END IF;
                    horarios_text := horarios_text || dias_semana[i+1] || ': ' || dia_horarios;
                END IF;
            END LOOP;
            
            -- Se não há horários específicos, retornar padrão
            IF horarios_text = '' THEN
                RETURN 'Horários em definição';
            END IF;
            
            RETURN horarios_text;
        ELSE
            RETURN 'Consulte nossos horários de funcionamento';
    END CASE;
END;
$function$;

-- Atualizar função create_prompt_from_global_template para incluir horários dinâmicos
CREATE OR REPLACE FUNCTION public.create_prompt_from_global_template(company_slug_param text, company_name_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    global_template record;
    final_vars jsonb;
    company_info RECORD;
    working_hours_text TEXT;
BEGIN
    -- Buscar template global ativo
    SELECT * INTO global_template 
    FROM public.ai_global_prompt_template 
    WHERE is_active = true 
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template global não encontrado';
    END IF;
    
    -- Buscar informações da empresa
    SELECT * INTO company_info
    FROM public.companies
    WHERE slug = company_slug_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Empresa não encontrada';
    END IF;
    
    -- Buscar horários formatados
    working_hours_text := format_working_hours(company_info.id);
    
    -- Criar variáveis personalizadas para a empresa
    final_vars := global_template.default_vars;
    final_vars := jsonb_set(final_vars, '{cardapio_url}', to_jsonb('https://pedido.dominio.tech/' || company_slug_param));
    final_vars := jsonb_set(final_vars, '{company_name}', to_jsonb(company_name_param));
    final_vars := jsonb_set(final_vars, '{agent_name}', to_jsonb('Atendente Virtual ' || company_name_param));
    final_vars := jsonb_set(final_vars, '{working_hours}', to_jsonb(working_hours_text));
    
    -- Inserir ou atualizar prompt da empresa
    INSERT INTO public.ai_agent_prompts (agent_slug, template, vars, version, owner_id)
    VALUES (
        company_slug_param,
        global_template.template,
        final_vars,
        1,
        null
    )
    ON CONFLICT (agent_slug) 
    DO UPDATE SET
        template = EXCLUDED.template,
        vars = jsonb_set(
            jsonb_set(
                jsonb_set(
                    jsonb_set(ai_agent_prompts.vars, '{cardapio_url}', final_vars->'cardapio_url'),
                    '{company_name}', final_vars->'company_name'
                ),
                '{agent_name}', final_vars->'agent_name'
            ),
            '{working_hours}', final_vars->'working_hours'
        ),
        version = ai_agent_prompts.version + 1,
        updated_at = now();
END;
$function$;

-- Trigger para atualizar horários nos prompts quando horário é alterado
CREATE OR REPLACE FUNCTION public.update_ai_prompts_on_horario_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    company_rec RECORD;
BEGIN
    -- Buscar informações da empresa
    SELECT slug, name INTO company_rec
    FROM public.companies
    WHERE id = COALESCE(NEW.company_id, OLD.company_id);
    
    -- Se a empresa tem slug, atualizar o prompt
    IF company_rec.slug IS NOT NULL THEN
        PERFORM create_prompt_from_global_template(company_rec.slug, company_rec.name);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Criar triggers para atualizar prompts quando horários mudam
DROP TRIGGER IF EXISTS trigger_update_prompts_on_horario_funcionamento_change ON public.horario_funcionamento;
CREATE TRIGGER trigger_update_prompts_on_horario_funcionamento_change
    AFTER INSERT OR UPDATE OR DELETE ON public.horario_funcionamento
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ai_prompts_on_horario_change();

DROP TRIGGER IF EXISTS trigger_update_prompts_on_horarios_dias_change ON public.horarios_dias;
CREATE TRIGGER trigger_update_prompts_on_horarios_dias_change
    AFTER INSERT OR UPDATE OR DELETE ON public.horarios_dias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ai_prompts_on_horario_change();