
-- Tabela principal de formas de entrega por empresa
CREATE TABLE public.delivery_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  delivery BOOLEAN DEFAULT false,         -- Entrega por entregador
  pickup BOOLEAN DEFAULT false,           -- Retirada no estabelecimento
  eat_in BOOLEAN DEFAULT false,           -- Consumo no local
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice único para garantir uma configuração por empresa
CREATE UNIQUE INDEX idx_delivery_methods_company_id ON delivery_methods(company_id);

-- Habilitar Row Level Security
ALTER TABLE public.delivery_methods ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem acessar configurações de suas empresas
CREATE POLICY "Users can view their company delivery methods" ON public.delivery_methods
    FOR SELECT
    USING (
        -- Super admin pode ver tudo
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Usuário normal pode ver configuração da sua empresa
        EXISTS (
            SELECT 1 FROM public.companies c
            JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
            WHERE c.id = delivery_methods.company_id
            AND u.id = auth.uid()
        )
    );

-- Política para inserção
CREATE POLICY "Users can insert their company delivery methods" ON public.delivery_methods
    FOR INSERT
    WITH CHECK (
        -- Super admin pode inserir para qualquer empresa
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Admin da empresa pode inserir para sua empresa
        EXISTS (
            SELECT 1 FROM public.companies c
            JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
            WHERE c.id = delivery_methods.company_id
            AND u.id = auth.uid()
            AND u.raw_user_meta_data->>'role' = 'company_admin'
        )
    );

-- Política para atualização
CREATE POLICY "Users can update their company delivery methods" ON public.delivery_methods
    FOR UPDATE
    USING (
        -- Super admin pode atualizar qualquer configuração
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Admin da empresa pode atualizar configuração da sua empresa
        EXISTS (
            SELECT 1 FROM public.companies c
            JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
            WHERE c.id = delivery_methods.company_id
            AND u.id = auth.uid()
            AND u.raw_user_meta_data->>'role' = 'company_admin'
        )
    );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_delivery_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delivery_methods_updated_at
    BEFORE UPDATE ON public.delivery_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_methods_updated_at();

-- Permissões
GRANT ALL ON public.delivery_methods TO authenticated;
GRANT SELECT ON public.delivery_methods TO anon;

-- Comentários
COMMENT ON TABLE public.delivery_methods IS 'Configurações de formas de entrega por empresa';
COMMENT ON COLUMN public.delivery_methods.delivery IS 'Se aceita entrega por entregador';
COMMENT ON COLUMN public.delivery_methods.pickup IS 'Se aceita retirada no estabelecimento';
COMMENT ON COLUMN public.delivery_methods.eat_in IS 'Se aceita consumo no local';
