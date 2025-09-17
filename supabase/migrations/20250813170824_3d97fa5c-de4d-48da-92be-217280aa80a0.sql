-- Corrigir função create_prompt_from_global_template para incluir telefone e endereço dinâmicos
CREATE OR REPLACE FUNCTION public.create_prompt_from_global_template(company_slug_param text, company_name_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    global_template record;
    final_vars jsonb;
    company_info RECORD;
    company_details RECORD;
    company_address RECORD;
    working_hours_text TEXT;
    phone_number TEXT := 'Não informado';
    company_address_text TEXT := 'Endereço não informado';
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
    
    -- Buscar detalhes da empresa (telefone/contato)
    SELECT * INTO company_details
    FROM public.company_info
    WHERE company_id = company_info.id;
    
    -- Definir telefone da empresa
    IF company_details.contato IS NOT NULL AND company_details.contato != '' THEN
        phone_number := company_details.contato;
    END IF;
    
    -- Buscar endereço principal da empresa
    SELECT * INTO company_address
    FROM public.company_addresses
    WHERE company_id = company_info.id 
    AND is_principal = true
    LIMIT 1;
    
    -- Formatar endereço da empresa
    IF company_address.id IS NOT NULL THEN
        company_address_text := company_address.logradouro || ', ' || company_address.numero;
        
        IF company_address.complemento IS NOT NULL AND company_address.complemento != '' THEN
            company_address_text := company_address_text || ', ' || company_address.complemento;
        END IF;
        
        company_address_text := company_address_text || ', ' || company_address.bairro || ', ' || company_address.cidade || ' - ' || company_address.estado;
        
        IF company_address.cep IS NOT NULL AND company_address.cep != '' THEN
            company_address_text := company_address_text || ', CEP: ' || company_address.cep;
        END IF;
    END IF;
    
    -- Buscar horários formatados
    working_hours_text := format_working_hours(company_info.id);
    
    -- Criar variáveis personalizadas para a empresa
    final_vars := global_template.default_vars;
    final_vars := jsonb_set(final_vars, '{cardapio_url}', to_jsonb('https://pedido.dominio.tech/' || company_slug_param));
    final_vars := jsonb_set(final_vars, '{company_name}', to_jsonb(company_name_param));
    final_vars := jsonb_set(final_vars, '{agent_name}', to_jsonb('Atendente Virtual ' || company_name_param));
    final_vars := jsonb_set(final_vars, '{working_hours}', to_jsonb(working_hours_text));
    final_vars := jsonb_set(final_vars, '{phone_number}', to_jsonb(phone_number));
    final_vars := jsonb_set(final_vars, '{company_address}', to_jsonb(company_address_text));
    
    -- Adicionar variável telefone também (para compatibilidade)
    final_vars := jsonb_set(final_vars, '{telefone}', to_jsonb(phone_number));
    
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
                    jsonb_set(
                        jsonb_set(
                            jsonb_set(
                                jsonb_set(ai_agent_prompts.vars, '{cardapio_url}', final_vars->'cardapio_url'),
                                '{company_name}', final_vars->'company_name'
                            ),
                            '{agent_name}', final_vars->'agent_name'
                        ),
                        '{working_hours}', final_vars->'working_hours'
                    ),
                    '{phone_number}', final_vars->'phone_number'
                ),
                '{company_address}', final_vars->'company_address'
            ),
            '{telefone}', final_vars->'telefone'
        ),
        version = ai_agent_prompts.version + 1,
        updated_at = now();
END;
$function$;

-- Criar trigger para atualizar prompts quando endereços mudam
CREATE OR REPLACE FUNCTION public.update_ai_prompts_on_address_change()
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

-- Criar trigger para company_addresses
DROP TRIGGER IF EXISTS trigger_update_prompts_on_address_change ON public.company_addresses;
CREATE TRIGGER trigger_update_prompts_on_address_change
    AFTER INSERT OR UPDATE OR DELETE ON public.company_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ai_prompts_on_address_change();