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
CREATE UNIQUE INDEX idx_company_addresses_company_id ON public.company_addresses(company_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_company_addresses_updated_at
    BEFORE UPDATE ON public.company_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.company_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for viewing addresses (authenticated users can view addresses of companies they belong to)
CREATE POLICY "Users can view their company addresses" ON public.company_addresses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE companies.id = company_addresses.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Policy for inserting addresses
CREATE POLICY "Users can insert their company addresses" ON public.company_addresses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE companies.id = company_addresses.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Policy for updating addresses
CREATE POLICY "Users can update their company addresses" ON public.company_addresses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE companies.id = company_addresses.company_id
            AND companies.user_id = auth.uid()
        )
    );

-- Policy for deleting addresses
CREATE POLICY "Users can delete their company addresses" ON public.company_addresses
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies
            WHERE companies.id = company_addresses.company_id
            AND companies.user_id = auth.uid()
        )
    );

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