-- Criar tabela para rastrear pagamentos do Stripe
CREATE TABLE IF NOT EXISTS public.stripe_payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Dados do pagamento no Stripe
    payment_intent_id text NOT NULL UNIQUE, -- pi_...
    external_reference text, -- Referência do pedido
    
    -- Dados financeiros
    amount decimal(10,2) NOT NULL,
    currency text DEFAULT 'brl',
    
    -- Tipo e status
    payment_method text NOT NULL, -- pix, card
    status text NOT NULL DEFAULT 'requires_payment_method', -- Stripe payment intent status
    
    -- Dados PIX (se aplicável)
    pix_qr_code text,
    pix_expires_at timestamp with time zone,
    
    -- Dados do cliente
    customer_name text,
    customer_email text,
    customer_phone text,
    
    -- Datas
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    succeeded_at timestamp with time zone,
    
    -- Metadados
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_stripe_payments_company_id ON public.stripe_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_payment_intent_id ON public.stripe_payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_external_reference ON public.stripe_payments(external_reference);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON public.stripe_payments(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_stripe_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_stripe_payments_updated_at
    BEFORE UPDATE ON public.stripe_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_stripe_payments_updated_at();

-- RLS
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can manage their company's Stripe payments" ON public.stripe_payments
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id FROM user_companies uc
            WHERE uc.user_id = auth.uid()
            AND uc.is_active = true
        )
    );

CREATE POLICY "Allow service role to manage Stripe payments" ON public.stripe_payments
    FOR ALL USING (auth.role() = 'service_role');
