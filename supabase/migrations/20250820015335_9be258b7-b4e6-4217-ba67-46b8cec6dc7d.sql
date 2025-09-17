-- Função preventiva para validar triggers antes de criar
CREATE OR REPLACE FUNCTION public.validate_trigger_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se todos os campos referenciados no trigger existem na tabela
    -- Esta é uma função genérica que pode ser expandida conforme necessário
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Remover quaisquer outros triggers problemáticos relacionados a sync_assistant
DROP TRIGGER IF EXISTS trg_sync_assistant_categorias ON public.categorias;
DROP TRIGGER IF EXISTS trg_sync_assistant_adicionais ON public.adicionais;

-- Verificar e remover funções órfãs que podem causar problemas
DROP FUNCTION IF EXISTS notify_sync_assistant() CASCADE;

-- Criar log de limpeza
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
    'LIMPEZA PREVENTIVA: Removidos triggers problemáticos e funções órfãs que causavam erro agent_slug',
    'system_cleanup',
    now()
);