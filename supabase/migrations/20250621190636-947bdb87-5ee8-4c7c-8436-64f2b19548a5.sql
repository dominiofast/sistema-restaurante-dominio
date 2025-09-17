
-- Adicionar novos campos à tabela regioes_atendimento existente
ALTER TABLE public.regioes_atendimento 
ADD COLUMN IF NOT EXISTS nome TEXT,
ADD COLUMN IF NOT EXISTS cep_inicial TEXT,
ADD COLUMN IF NOT EXISTS cep_final TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT;

-- Criar tabela de endereços de clientes
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_customer_addresses_company_id ON customer_addresses(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_phone ON customer_addresses(customer_phone);
CREATE INDEX IF NOT EXISTS idx_regioes_atendimento_cep ON regioes_atendimento(cep_inicial, cep_final);

-- Habilitar RLS na nova tabela
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS corrigidas para customer_addresses
CREATE POLICY "Users can view their company customer addresses" ON public.customer_addresses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = customer_addresses.company_id
        )
    );

CREATE POLICY "Users can insert their company customer addresses" ON public.customer_addresses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = customer_addresses.company_id
        )
    );

CREATE POLICY "Users can update their company customer addresses" ON public.customer_addresses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = customer_addresses.company_id
        )
    );

CREATE POLICY "Users can delete their company customer addresses" ON public.customer_addresses
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies c
            WHERE c.id = customer_addresses.company_id
        )
    );

-- Dar permissões às tabelas
GRANT ALL ON public.customer_addresses TO authenticated;
GRANT SELECT ON public.customer_addresses TO anon;
