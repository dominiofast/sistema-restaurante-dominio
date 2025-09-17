-- Criar tabela para rastrear pagamentos do Asaas
CREATE TABLE IF NOT EXISTS public.asaas_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados do pagamento no Asaas
    payment_id text NOT NULL UNIQUE, -- pay_...
    external_reference text, -- Referência do pedido
    
    -- Dados financeiros
    amount decimal(10,2) NOT NULL,
    
    -- Tipo e status
    payment_method text NOT NULL, -- PIX, CREDIT_CARD, DEBIT_CARD
    status text NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, RECEIVED, etc.
    
    -- Dados PIX (se aplicável)
    pix_qr_code text,
    pix_qr_code_base64 text,
    pix_expires_at timestamp with time zone,
    
    -- Dados do cliente
    customer_id text, -- ID do cliente no Asaas
    customer_name text,
    customer_email text,
    customer_phone text,
    customer_cpf text,
    
    -- Datas
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    confirmed_at timestamp with time zone,
    
    -- Metadados
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Dados completos da resposta Asaas
    asaas_response jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_asaas_payments_company_id ON public.asaas_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_asaas_payments_payment_id ON public.asaas_payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_asaas_payments_external_reference ON public.asaas_payments(external_reference);
CREATE INDEX IF NOT EXISTS idx_asaas_payments_status ON public.asaas_payments(status);
CREATE INDEX IF NOT EXISTS idx_asaas_payments_customer_id ON public.asaas_payments(customer_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_asaas_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_asaas_payments_updated_at
    BEFORE UPDATE ON public.asaas_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_asaas_payments_updated_at();

-- RLS
ALTER TABLE public.asaas_payments ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can manage their company's Asaas payments" ON public.asaas_payments
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

CREATE POLICY "Allow service role to manage Asaas payments" ON public.asaas_payments
    FOR ALL USING (auth.role() = 'service_role');
