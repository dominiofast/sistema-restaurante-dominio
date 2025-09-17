-- Função para atualizar todos os prompts dos assistentes com o novo formato
CREATE OR REPLACE FUNCTION public.update_all_assistant_prompts()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    company_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Buscar todas as empresas ativas com assistentes
    FOR company_record IN 
        SELECT DISTINCT c.id, c.name, c.slug
        FROM public.companies c
        INNER JOIN public.ai_agent_assistants aa ON c.id = aa.company_id
        WHERE c.status = 'active' AND aa.is_active = true
    LOOP
        -- Atualizar ou criar prompt para cada empresa
        INSERT INTO public.ai_agent_prompts (agent_slug, template, vars, updated_at)
        VALUES (
            company_record.slug,
            'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER',
            jsonb_build_object(
                'customer_name', '{{customer_name}}',
                'agent_name', 'Assistente ' || company_record.name,
                'company_name', company_record.name,
                'cardapio_url', 'https://pedido.dominio.tech/' || company_record.slug
            ),
            now()
        )
        ON CONFLICT (agent_slug) DO UPDATE SET
            vars = jsonb_build_object(
                'customer_name', '{{customer_name}}',
                'agent_name', 'Assistente ' || company_record.name,
                'company_name', company_record.name,
                'cardapio_url', 'https://pedido.dominio.tech/' || company_record.slug
            ),
            updated_at = now(),
            version = ai_agent_prompts.version + 1;
            
        updated_count := updated_count + 1;
    END LOOP;
    
    -- Log da atualização
    INSERT INTO public.ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        (SELECT id FROM companies WHERE status = 'active' LIMIT 1),
        'SYSTEM',
        'ADMIN',
        'PROMPTS ATUALIZADOS: ' || updated_count || ' assistentes foram atualizados com o novo formato de prompt melhorado',
        'system_update',
        now()
    );
    
    RETURN 'Sucesso: ' || updated_count || ' assistentes atualizados com novo formato de prompt';
END;
$$;