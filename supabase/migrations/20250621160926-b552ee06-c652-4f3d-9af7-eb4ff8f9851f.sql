
-- Tabela principal de configuração de pagamento na entrega/retirada
CREATE TABLE public.payment_delivery_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  accept_cash BOOLEAN DEFAULT false,
  accept_card BOOLEAN DEFAULT false,
  accept_pix BOOLEAN DEFAULT false,
  ask_card_brand BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de bandeiras aceitas por empresa
CREATE TABLE public.payment_delivery_card_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES payment_delivery_config(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL
);

-- Índices para performance
CREATE INDEX idx_payment_delivery_config_company_id ON payment_delivery_config(company_id);
CREATE INDEX idx_payment_delivery_card_brands_config_id ON payment_delivery_card_brands(config_id);

-- Habilitar RLS
ALTER TABLE public.payment_delivery_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_delivery_card_brands ENABLE ROW LEVEL SECURITY;

-- Políticas RLS usando a estrutura existente
CREATE POLICY "Users can manage their company payment config" ON public.payment_delivery_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'company_domain' IN (
        SELECT domain FROM public.companies WHERE id = payment_delivery_config.company_id
      )
    )
  );

CREATE POLICY "Users can manage their company card brands" ON public.payment_delivery_card_brands
  FOR ALL USING (
    config_id IN (
      SELECT pdc.id FROM public.payment_delivery_config pdc
      WHERE EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'company_domain' IN (
          SELECT domain FROM public.companies WHERE id = pdc.company_id
        )
      )
    )
  );

-- Super admin policies
CREATE POLICY "Super admins can manage all payment configs" ON public.payment_delivery_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all card brands" ON public.payment_delivery_card_brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_payment_delivery_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_delivery_config_updated_at
    BEFORE UPDATE ON public.payment_delivery_config
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_delivery_config_updated_at();
