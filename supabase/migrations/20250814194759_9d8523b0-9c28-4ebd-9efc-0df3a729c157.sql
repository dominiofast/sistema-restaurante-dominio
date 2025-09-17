-- Função para gerar nome do assistente baseado no nome da empresa
CREATE OR REPLACE FUNCTION public.generate_assistant_name(company_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    -- Se o nome da empresa estiver vazio, usar nome padrão
    IF company_name IS NULL OR TRIM(company_name) = '' THEN
        RETURN 'Assistente Virtual';
    END IF;
    
    -- Gerar nome usando o nome da empresa
    -- Exemplos: "Pizza Express" -> "Assistente Pizza Express"
    --          "Lanchonete do João" -> "Assistente Lanchonete do João"
    RETURN 'Assistente ' || TRIM(company_name);
END;
$$;

-- Atualizar função ensure_ai_agent_assistant para usar nome da empresa
CREATE OR REPLACE FUNCTION public.ensure_ai_agent_assistant()
RETURNS trigger AS $$
BEGIN
  -- Upsert placeholder row com nome baseado na empresa
  INSERT INTO public.ai_agent_assistants (company_id, bot_name, cardapio_url, produtos_path, config_path, is_active)
  VALUES (
    NEW.id, 
    generate_assistant_name(NEW.name), 
    null, 
    NEW.id::text || '/produtos.json', 
    NEW.id::text || '/config.json', 
    true
  )
  ON CONFLICT (company_id) DO UPDATE SET
    bot_name = generate_assistant_name(NEW.name),
    produtos_path = EXCLUDED.produtos_path,
    config_path = EXCLUDED.config_path,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar todos os assistentes existentes para usar nomes baseados nas empresas
UPDATE public.ai_agent_assistants 
SET 
    bot_name = generate_assistant_name(c.name),
    updated_at = now()
FROM public.companies c
WHERE ai_agent_assistants.company_id = c.id;

-- Log da atualização
INSERT INTO public.ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    (SELECT id FROM companies LIMIT 1),
    'SYSTEM',
    'SYSTEM',
    'ASSISTENTES ATUALIZADOS: Todos os assistentes agora usam nomes baseados nas empresas ao invés de "RangoBot"',
    'system_update',
    now()
);