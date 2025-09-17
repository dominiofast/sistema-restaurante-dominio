-- 🚀 AUTOMATIZAR HORÁRIOS DINÂMICOS PARA NOVAS LOJAS

-- 1. Criar função que ativa horários dinâmicos automaticamente
CREATE OR REPLACE FUNCTION auto_enable_dynamic_hours_for_new_assistant()
RETURNS TRIGGER AS $$
BEGIN
    -- Definir use_direct_mode = false (horários dinâmicos) por padrão para novos assistentes
    NEW.use_direct_mode = false;
    
    -- Log da ativação automática
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        NEW.company_id,
        'SYSTEM',
        'AUTO_CONFIG',
        '🚀 NOVA LOJA: Horários dinâmicos ativados automaticamente para ' || NEW.bot_name || '. Sistema calculará horários em tempo real.',
        'auto_dynamic_hours_enabled',
        now()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar trigger para novos assistentes
DROP TRIGGER IF EXISTS trigger_auto_enable_dynamic_hours ON ai_agent_assistants;

CREATE TRIGGER trigger_auto_enable_dynamic_hours
    BEFORE INSERT ON ai_agent_assistants
    FOR EACH ROW
    EXECUTE FUNCTION auto_enable_dynamic_hours_for_new_assistant();

-- 3. Atualizar função existente de criação automática de assistente para empresas
CREATE OR REPLACE FUNCTION ensure_ai_agent_assistant()
RETURNS TRIGGER AS $$
BEGIN
    -- Upsert placeholder row com nome baseado na empresa e horários dinâmicos ativados
    INSERT INTO public.ai_agent_assistants (company_id, bot_name, cardapio_url, produtos_path, config_path, is_active, use_direct_mode)
    VALUES (
        NEW.id, 
        generate_assistant_name(NEW.name), 
        null, 
        NEW.id::text || '/produtos.json', 
        NEW.id::text || '/config.json', 
        true,
        false  -- Horários dinâmicos ativados por padrão
    )
    ON CONFLICT (company_id) DO UPDATE SET
        bot_name = generate_assistant_name(NEW.name),
        produtos_path = EXCLUDED.produtos_path,
        config_path = EXCLUDED.config_path,
        use_direct_mode = false,  -- Garantir horários dinâmicos
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Log de confirmação
INSERT INTO ai_conversation_logs (
    company_id,
    customer_phone,
    customer_name,
    message_content,
    message_type,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SYSTEM',
    'ADMIN',
    '✅ CONFIGURAÇÃO AUTOMÁTICA: Trigger criado! Todas as novas lojas terão horários dinâmicos ativados automaticamente (use_direct_mode = false).',
    'auto_config_enabled',
    now()
);

-- 5. Verificar se a função generate_assistant_name existe, se não criar uma básica
CREATE OR REPLACE FUNCTION generate_assistant_name(company_name text)
RETURNS text AS $$
BEGIN
    RETURN 'Assistente ' || company_name;
END;
$$ LANGUAGE plpgsql;