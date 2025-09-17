-- 🔔 SISTEMA DE NOTIFICAÇÃO DE CASHBACK
-- Data: 2025-01-27
-- Objetivo: Enviar notificação de cashback após finalização do pedido

-- ================================
-- PASSO 1: CRIAR FUNÇÃO DE NOTIFICAÇÃO
-- ================================

CREATE OR REPLACE FUNCTION send_cashback_notification(
    p_pedido_id INTEGER,
    p_company_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    pedido_info RECORD;
    cashback_info RECORD;
    notification_result JSONB;
    company_config RECORD;
    whatsapp_phone VARCHAR;
    message_content TEXT;
BEGIN
    -- Buscar informações do pedido
    SELECT 
        p.id,
        p.numero_pedido,
        p.company_id,
        p.nome as customer_name,
        p.telefone as customer_phone,
        p.total,
        p.status,
        p.created_at,
        c.name as company_name,
        c.domain as company_domain,
        c.logo as company_logo
    INTO pedido_info
    FROM pedidos p
    JOIN companies c ON c.id = p.company_id
    WHERE p.id = p_pedido_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Pedido não encontrado',
            'code', 'PEDIDO_NOT_FOUND'
        );
    END IF;
    
    -- Verificar se o pedido foi finalizado
    IF pedido_info.status NOT IN ('entregue', 'finalizado') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Pedido ainda não foi finalizado',
            'code', 'PEDIDO_NOT_FINALIZED',
            'current_status', pedido_info.status
        );
    END IF;
    
    -- Buscar informações de cashback do pedido
    SELECT 
        ct.valor as cashback_value,
        ct.created_at as cashback_date,
        cc.saldo_disponivel as current_balance
    INTO cashback_info
    FROM cashback_transactions ct
    LEFT JOIN customer_cashback cc ON 
        cc.company_id = ct.company_id 
        AND cc.customer_phone = ct.customer_phone
    WHERE ct.pedido_id = p_pedido_id 
    AND ct.tipo = 'credito'
    ORDER BY ct.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cashback não encontrado para este pedido',
            'code', 'CASHBACK_NOT_FOUND'
        );
    END IF;
    
    -- Buscar configuração da empresa
    SELECT 
        wi.whatsapp_phone,
        wi.ia_model,
        wi.ia_temperature
    INTO company_config
    FROM whatsapp_integrations wi
    WHERE wi.company_id = pedido_info.company_id
    AND wi.is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Integração WhatsApp não configurada',
            'code', 'WHATSAPP_NOT_CONFIGURED'
        );
    END IF;
    
    -- Preparar mensagem de cashback
    message_content := format(
        '✅ *Pedido #%s Finalizado*

Cliente: %s
Total: R$ %.2f
Data: %s

🎁 *Cashback Creditado: R$ %.2f*
💳 Saldo Total: R$ %.2f

Acesse: https://%s.dominio.tech

%s',
        pedido_info.numero_pedido,
        pedido_info.customer_name,
        pedido_info.total,
        to_char(pedido_info.created_at, 'DD/MM/YYYY HH24:MI'),
        cashback_info.cashback_value,
        COALESCE(cashback_info.current_balance, 0),
        pedido_info.company_domain,
        pedido_info.company_logo
    );
    
    -- Enviar notificação via WhatsApp (simulado)
    -- Aqui você pode integrar com sua API de WhatsApp
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        pedido_info.company_id,
        pedido_info.customer_phone,
        pedido_info.customer_name,
        message_content,
        'cashback_notification',
        NOW()
    );
    
    -- Registrar notificação enviada
    INSERT INTO cashback_notifications (
        company_id,
        customer_phone,
        customer_name,
        pedido_id,
        cashback_value,
        message_content,
        notification_type,
        status,
        created_at
    ) VALUES (
        pedido_info.company_id,
        pedido_info.customer_phone,
        pedido_info.customer_name,
        pedido_info.id,
        cashback_info.cashback_value,
        message_content,
        'whatsapp',
        'sent',
        NOW()
    );
    
    -- Retornar sucesso
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Notificação de cashback enviada com sucesso',
        'notification_id', lastval(),
        'customer_phone', pedido_info.customer_phone,
        'cashback_value', cashback_info.cashback_value,
        'message_content', message_content
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', 'INTERNAL_ERROR'
    );
END;
$$;

-- ================================
-- PASSO 2: CRIAR TABELA DE NOTIFICAÇÕES
-- ================================

CREATE TABLE IF NOT EXISTS cashback_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name TEXT,
    pedido_id INTEGER REFERENCES public.pedidos(id),
    cashback_value DECIMAL(10,2) NOT NULL,
    message_content TEXT,
    notification_type VARCHAR(20) NOT NULL DEFAULT 'whatsapp', -- whatsapp, email, sms
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sent, failed, delivered
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cashback_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their company cashback notifications" 
ON public.cashback_notifications FOR SELECT 
USING (company_id IN (
    SELECT company_id FROM user_companies WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their company cashback notifications" 
ON public.cashback_notifications FOR INSERT 
WITH CHECK (company_id IN (
    SELECT company_id FROM user_companies WHERE user_id = auth.uid()
));

-- ================================
-- PASSO 3: TRIGGER AUTOMÁTICO
-- ================================

-- Função para trigger automático
CREATE OR REPLACE FUNCTION auto_send_cashback_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_result JSONB;
BEGIN
    -- Só enviar notificação quando pedido for finalizado
    IF NEW.status IN ('entregue', 'finalizado') AND 
       OLD.status NOT IN ('entregue', 'finalizado') THEN
        
        -- Verificar se já existe cashback para este pedido
        IF EXISTS (
            SELECT 1 FROM cashback_transactions 
            WHERE pedido_id = NEW.id AND tipo = 'credito'
        ) THEN
            -- Enviar notificação de forma assíncrona
            PERFORM send_cashback_notification(NEW.id, NEW.company_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_auto_cashback_notification ON pedidos;

CREATE TRIGGER trigger_auto_cashback_notification
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION auto_send_cashback_notification();

-- ================================
-- PASSO 4: FUNÇÃO DE TESTE
-- ================================

-- Função para testar notificação manualmente
CREATE OR REPLACE FUNCTION test_cashback_notification(p_pedido_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN send_cashback_notification(p_pedido_id);
END;
$$;

-- ================================
-- MENSAGEM DE SUCESSO
-- ================================

SELECT 
    '🔔 SISTEMA DE NOTIFICAÇÃO DE CASHBACK CRIADO!' as resultado,
    'Notificações automáticas serão enviadas após finalização dos pedidos' as detalhes,
    NOW() as data_criacao;
