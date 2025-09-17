-- Criar configuração de entrega grátis para empresas
CREATE TABLE IF NOT EXISTS public.free_delivery_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    minimum_order_value NUMERIC NOT NULL DEFAULT 0.00,
    free_delivery_message TEXT DEFAULT 'Entrega grátis em pedidos acima de R$',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(company_id)
);

-- Habilitar RLS
ALTER TABLE public.free_delivery_config ENABLE ROW LEVEL SECURITY;

-- Criar política para visualização pública (para o cardápio)
CREATE POLICY "Public can view active free delivery config" ON public.free_delivery_config
    FOR SELECT USING (is_enabled = true);

-- Criar política para usuários autenticados gerenciarem
CREATE POLICY "Company users can manage free delivery config" ON public.free_delivery_config
    FOR ALL USING (
        company_id IN (
            SELECT uc.company_id 
            FROM user_companies uc 
            WHERE uc.user_id = auth.uid() AND uc.is_active = true
        )
    );

-- Inserir configuração de entrega grátis para Domínio Pizzas
INSERT INTO public.free_delivery_config (
    company_id,
    is_enabled,
    minimum_order_value,
    free_delivery_message
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    50.00,
    'Entrega grátis em pedidos acima de R$ 50'
) ON CONFLICT (company_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    minimum_order_value = EXCLUDED.minimum_order_value,
    free_delivery_message = EXCLUDED.free_delivery_message,
    updated_at = now();