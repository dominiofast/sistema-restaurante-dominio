-- ================================================
-- MIGRATION: Criar tabela company_addresses
-- Data: 2025-01-18
-- ================================================
-- 
-- INSTRUÇÕES:
-- 1. Copie TODO este conteúdo
-- 2. Cole no SQL Editor do Supabase
-- 3. Clique em "Run" ou pressione Ctrl+Enter
-- ================================================

-- Verificar se a tabela já existe antes de criar
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'company_addresses'
) as tabela_existe;

-- ================================================
-- CRIAR TABELA E ESTRUTURA
-- ================================================

-- Create company_addresses table
CREATE TABLE IF NOT EXISTS public.company_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    cep VARCHAR(10),
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(255),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    referencia VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hide_from_customers BOOLEAN DEFAULT false,
    manual_coordinates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique index to ensure one address per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_addresses_company_id ON public.company_addresses(company_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS handle_company_addresses_updated_at ON public.company_addresses;
CREATE TRIGGER handle_company_addresses_updated_at
    BEFORE UPDATE ON public.company_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.company_addresses ENABLE ROW LEVEL SECURITY;

-- ================================================
-- CRIAR POLÍTICAS RLS
-- ================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their company addresses" ON public.company_addresses;
DROP POLICY IF EXISTS "Users can insert their company addresses" ON public.company_addresses;
DROP POLICY IF EXISTS "Users can update their company addresses" ON public.company_addresses;
DROP POLICY IF EXISTS "Users can delete their company addresses" ON public.company_addresses;
DROP POLICY IF EXISTS "Super admins can do everything" ON public.company_addresses;

-- Policy for super admins (pode fazer tudo)
CREATE POLICY "Super admins can do everything" ON public.company_addresses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
    );

-- Policy for viewing addresses (usuários podem ver endereços de suas empresas)
CREATE POLICY "Users can view their company addresses" ON public.company_addresses
    FOR SELECT
    USING (
        -- Super admin pode ver tudo
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Usuário normal pode ver endereço da sua empresa
        EXISTS (
            SELECT 1 FROM public.companies c
            JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
            WHERE c.id = company_addresses.company_id
            AND u.id = auth.uid()
        )
    );

-- Policy for inserting addresses
CREATE POLICY "Users can insert their company addresses" ON public.company_addresses
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
            WHERE c.id = company_addresses.company_id
            AND u.id = auth.uid()
            AND u.raw_user_meta_data->>'role' = 'company_admin'
        )
    );

-- Policy for updating addresses
CREATE POLICY "Users can update their company addresses" ON public.company_addresses
    FOR UPDATE
    USING (
        -- Super admin pode atualizar qualquer endereço
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Admin da empresa pode atualizar endereço da sua empresa
        EXISTS (
            SELECT 1 FROM public.companies c
            JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
            WHERE c.id = company_addresses.company_id
            AND u.id = auth.uid()
            AND u.raw_user_meta_data->>'role' = 'company_admin'
        )
    );

-- Policy for deleting addresses
CREATE POLICY "Users can delete their company addresses" ON public.company_addresses
    FOR DELETE
    USING (
        -- Super admin pode deletar qualquer endereço
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
        )
        OR
        -- Admin da empresa pode deletar endereço da sua empresa
        EXISTS (
            SELECT 1 FROM public.companies c
            JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain
            WHERE c.id = company_addresses.company_id
            AND u.id = auth.uid()
            AND u.raw_user_meta_data->>'role' = 'company_admin'
        )
    );

-- ================================================
-- PERMISSÕES E COMENTÁRIOS
-- ================================================

-- Grant permissions
GRANT ALL ON public.company_addresses TO authenticated;
GRANT SELECT ON public.company_addresses TO anon;

-- Add comment to table
COMMENT ON TABLE public.company_addresses IS 'Stores company addresses and location information';

-- Add comments to columns
COMMENT ON COLUMN public.company_addresses.company_id IS 'Reference to the company';
COMMENT ON COLUMN public.company_addresses.cep IS 'Brazilian postal code';
COMMENT ON COLUMN public.company_addresses.logradouro IS 'Street name';
COMMENT ON COLUMN public.company_addresses.numero IS 'Street number';
COMMENT ON COLUMN public.company_addresses.complemento IS 'Additional address information';
COMMENT ON COLUMN public.company_addresses.bairro IS 'Neighborhood';
COMMENT ON COLUMN public.company_addresses.cidade IS 'City';
COMMENT ON COLUMN public.company_addresses.estado IS 'State (2 letter code)';
COMMENT ON COLUMN public.company_addresses.referencia IS 'Reference point for delivery';
COMMENT ON COLUMN public.company_addresses.latitude IS 'Geographic latitude';
COMMENT ON COLUMN public.company_addresses.longitude IS 'Geographic longitude';
COMMENT ON COLUMN public.company_addresses.hide_from_customers IS 'Whether to hide address from customers in digital menu';
COMMENT ON COLUMN public.company_addresses.manual_coordinates IS 'Whether coordinates were manually set';

-- ================================================
-- VERIFICAÇÃO FINAL
-- ================================================

-- Verificar se a tabela foi criada com sucesso
SELECT 
    'Tabela criada' as status,
    COUNT(*) as existe
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'company_addresses';

-- Verificar políticas RLS
SELECT 
    'Políticas RLS' as tipo,
    COUNT(*) as quantidade
FROM pg_policies
WHERE tablename = 'company_addresses';

-- Listar colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'company_addresses'
ORDER BY ordinal_position;

-- ================================================
-- FIM DA MIGRATION
-- ================================================ 