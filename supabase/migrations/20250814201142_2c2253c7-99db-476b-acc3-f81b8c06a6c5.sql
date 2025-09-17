-- Função para corrigir os templates dos prompts para usar o builder
CREATE OR REPLACE FUNCTION public.fix_assistant_templates()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Atualizar todos os prompts para usar o template padrão do builder
    UPDATE public.ai_agent_prompts 
    SET template = 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER',
        updated_at = now(),
        version = version + 1
    WHERE template != 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Log da correção
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
        'TEMPLATES CORRIGIDOS: ' || updated_count || ' assistentes foram corrigidos para usar o template do builder',
        'template_fix',
        now()
    );
    
    RETURN 'Sucesso: ' || updated_count || ' templates corrigidos para usar o builder';
END;
$$;