-- Criar a função create_prompt_from_global_template que está faltando
-- Esta função é necessária para o sistema de prompts de IA

CREATE OR REPLACE FUNCTION public.create_prompt_from_global_template(
    company_slug text, 
    company_name text
) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    global_template_rec RECORD;
    default_vars jsonb;
BEGIN
    -- Buscar template global ativo
    SELECT template, default_vars INTO global_template_rec
    FROM public.ai_global_prompt_template
    WHERE is_active = true
    ORDER BY updated_at DESC
    LIMIT 1;
    
    -- Se não há template global, não fazer nada
    IF NOT FOUND THEN
        RAISE NOTICE 'Nenhum template global encontrado para %', company_slug;
        RETURN;
    END IF;
    
    -- Preparar variáveis padrão com dados da empresa
    default_vars := jsonb_build_object(
        'customer_name', '{{customer_name}}',
        'agent_name', 'Assistente ' || company_name,
        'company_name', company_name,
        'cardapio_url', 'https://pedido.dominio.tech/' || company_slug
    );
    
    -- Inserir ou atualizar prompt para a empresa
    INSERT INTO public.ai_agent_prompts (agent_slug, template, vars, updated_at)
    VALUES (
        company_slug,
        global_template_rec.template,
        default_vars,
        now()
    )
    ON CONFLICT (agent_slug) DO UPDATE SET
        template = global_template_rec.template,
        vars = default_vars,
        updated_at = now(),
        version = ai_agent_prompts.version + 1;
    
    RAISE NOTICE 'Prompt criado/atualizado para empresa: %', company_name;
END;
$$;