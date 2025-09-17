-- CRIAR TABELA PARA CONTROLE DO ASSISTENTE
-- Execute no SQL Editor do Supabase

-- 1. TABELA PARA CONTROLAR QUANDO IA ESTÁ PAUSADA
CREATE TABLE IF NOT EXISTS whatsapp_assistant_control (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    is_paused BOOLEAN DEFAULT false,
    paused_by VARCHAR(255), -- email/nome do operador
    paused_at TIMESTAMP WITH TIME ZONE,
    resumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Índices únicos por empresa e telefone
    UNIQUE(company_id, phone)
);

-- 2. HABILITAR RLS
ALTER TABLE whatsapp_assistant_control ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA RLS
CREATE POLICY "Users can manage assistant control for their company" 
ON whatsapp_assistant_control FOR ALL 
USING (
    company_id IN (
        SELECT company_id 
        FROM user_company_roles 
        WHERE user_id = auth.uid()
    )
);

-- 4. FUNÇÃO PARA PAUSAR ASSISTENTE
CREATE OR REPLACE FUNCTION pause_whatsapp_assistant(
    p_company_id UUID,
    p_phone VARCHAR(20),
    p_paused_by VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Inserir ou atualizar controle
    INSERT INTO whatsapp_assistant_control (
        company_id,
        phone,
        is_paused,
        paused_by,
        paused_at,
        updated_at
    ) VALUES (
        p_company_id,
        p_phone,
        true,
        p_paused_by,
        now(),
        now()
    )
    ON CONFLICT (company_id, phone)
    DO UPDATE SET
        is_paused = true,
        paused_by = p_paused_by,
        paused_at = now(),
        updated_at = now();
    
    -- Log da ação
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        p_company_id,
        p_phone,
        'Sistema',
        'ASSISTENTE PAUSADO por: ' || p_paused_by,
        'assistant_paused',
        now()
    );
    
    v_result := json_build_object(
        'success', true,
        'message', 'Assistente pausado com sucesso',
        'phone', p_phone,
        'paused_by', p_paused_by,
        'paused_at', now()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA RETOMAR ASSISTENTE
CREATE OR REPLACE FUNCTION resume_whatsapp_assistant(
    p_company_id UUID,
    p_phone VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Atualizar controle
    UPDATE whatsapp_assistant_control
    SET is_paused = false,
        resumed_at = now(),
        updated_at = now()
    WHERE company_id = p_company_id 
    AND phone = p_phone;
    
    -- Log da ação
    INSERT INTO ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        p_company_id,
        p_phone,
        'Sistema',
        'ASSISTENTE RETOMADO',
        'assistant_resumed',
        now()
    );
    
    v_result := json_build_object(
        'success', true,
        'message', 'Assistente retomado com sucesso',
        'phone', p_phone,
        'resumed_at', now()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA VERIFICAR STATUS
CREATE OR REPLACE FUNCTION get_assistant_status(
    p_company_id UUID,
    p_phone VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    v_control RECORD;
    v_result JSON;
BEGIN
    SELECT * INTO v_control
    FROM whatsapp_assistant_control
    WHERE company_id = p_company_id
    AND phone = p_phone;
    
    IF FOUND THEN
        v_result := json_build_object(
            'is_paused', v_control.is_paused,
            'paused_by', v_control.paused_by,
            'paused_at', v_control.paused_at,
            'resumed_at', v_control.resumed_at
        );
    ELSE
        v_result := json_build_object(
            'is_paused', false,
            'paused_by', null,
            'paused_at', null,
            'resumed_at', null
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA DADOS DO CLIENTE (para a extensão)
CREATE OR REPLACE FUNCTION get_customer_info(
    p_company_id UUID,
    p_phone VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    v_customer RECORD;
    v_cashback RECORD;
    v_recent_orders JSON;
    v_result JSON;
    v_clean_phone VARCHAR(20);
BEGIN
    -- Limpar telefone
    v_clean_phone := regexp_replace(p_phone, '[^0-9]', '', 'g');
    
    -- Buscar dados do cliente
    SELECT nome, telefone, total_pedidos, dias_sem_comprar
    INTO v_customer
    FROM clientes
    WHERE company_id = p_company_id
    AND regexp_replace(telefone, '[^0-9]', '', 'g') = v_clean_phone;
    
    -- Buscar cashback
    SELECT saldo_disponivel, saldo_total_acumulado
    INTO v_cashback
    FROM customer_cashback
    WHERE company_id = p_company_id
    AND customer_phone = v_clean_phone;
    
    -- Buscar pedidos recentes
    SELECT json_agg(
        json_build_object(
            'id', id,
            'numero_pedido', numero_pedido,
            'status', status,
            'valor_total', valor_total,
            'created_at', created_at
        ) ORDER BY created_at DESC
    )
    INTO v_recent_orders
    FROM pedidos
    WHERE company_id = p_company_id
    AND regexp_replace(telefone, '[^0-9]', '', 'g') = v_clean_phone
    LIMIT 5;
    
    v_result := json_build_object(
        'customer', COALESCE(
            json_build_object(
                'nome', v_customer.nome,
                'telefone', v_customer.telefone,
                'total_pedidos', v_customer.total_pedidos,
                'dias_sem_comprar', v_customer.dias_sem_comprar
            ),
            json_build_object(
                'nome', 'Cliente não encontrado',
                'telefone', p_phone,
                'total_pedidos', 0,
                'dias_sem_comprar', null
            )
        ),
        'cashback', COALESCE(
            json_build_object(
                'saldo_disponivel', v_cashback.saldo_disponivel,
                'saldo_total_acumulado', v_cashback.saldo_total_acumulado
            ),
            json_build_object(
                'saldo_disponivel', 0,
                'saldo_total_acumulado', 0
            )
        ),
        'recent_orders', COALESCE(v_recent_orders, '[]'::json)
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CONFIRMAR CRIAÇÃO
SELECT 'ESTRUTURA PARA EXTENSÃO CHROME CRIADA COM SUCESSO!' as resultado;
