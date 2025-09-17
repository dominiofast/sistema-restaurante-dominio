-- CRIAR TABELA PARA CONTROLE DO ASSISTENTE
CREATE TABLE IF NOT EXISTS whatsapp_assistant_control (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    is_paused BOOLEAN DEFAULT false,
    paused_by VARCHAR(255),
    paused_at TIMESTAMP WITH TIME ZONE,
    resumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(company_id, phone)
);

-- HABILITAR RLS
ALTER TABLE whatsapp_assistant_control ENABLE ROW LEVEL SECURITY;

-- POLÍTICA RLS SIMPLES
DROP POLICY IF EXISTS "Allow all operations" ON whatsapp_assistant_control;
CREATE POLICY "Allow all operations" ON whatsapp_assistant_control FOR ALL USING (true);

-- FUNÇÃO PARA PAUSAR ASSISTENTE
CREATE OR REPLACE FUNCTION pause_whatsapp_assistant(
    p_company_id UUID,
    p_phone VARCHAR(20),
    p_paused_by VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
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

-- FUNÇÃO PARA RETOMAR ASSISTENTE
CREATE OR REPLACE FUNCTION resume_whatsapp_assistant(
    p_company_id UUID,
    p_phone VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    UPDATE whatsapp_assistant_control
    SET is_paused = false,
        resumed_at = now(),
        updated_at = now()
    WHERE company_id = p_company_id 
    AND phone = p_phone;
    
    v_result := json_build_object(
        'success', true,
        'message', 'Assistente retomado com sucesso',
        'phone', p_phone,
        'resumed_at', now()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNÇÃO PARA VERIFICAR STATUS
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

-- FUNÇÃO PARA DADOS DO CLIENTE
CREATE OR REPLACE FUNCTION get_customer_info(
    p_company_id UUID,
    p_phone VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    v_result := json_build_object(
        'customer', json_build_object(
            'nome', 'Cliente Teste',
            'telefone', p_phone,
            'total_pedidos', 0,
            'dias_sem_comprar', null
        ),
        'cashback', json_build_object(
            'saldo_disponivel', 0,
            'saldo_total_acumulado', 0
        ),
        'recent_orders', '[]'::json
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CONFIRMAR CRIAÇÃO
SELECT 'ESTRUTURA PARA EXTENSÃO CHROME CRIADA COM SUCESSO!' as resultado;
