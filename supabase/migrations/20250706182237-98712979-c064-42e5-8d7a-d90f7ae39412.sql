-- Criar tabela para configurações de impressão térmica
CREATE TABLE IF NOT EXISTS public.print_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    printer_name TEXT,
    paper_width INTEGER DEFAULT 48,
    print_copies INTEGER DEFAULT 1,
    auto_print_orders BOOLEAN DEFAULT false,
    auto_print_nfce BOOLEAN DEFAULT false,
    header_text TEXT,
    footer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para fila de impressão
CREATE TABLE IF NOT EXISTS public.print_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('order', 'nfce')),
    data JSONB NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'printed', 'error')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    printed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.print_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_queue ENABLE ROW LEVEL SECURITY;

-- Criar políticas para print_configs
CREATE POLICY "Users can manage their company's print config" 
ON public.print_configs 
FOR ALL 
USING (
    company_id IN (
        SELECT id FROM companies WHERE domain = (
            auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'
        )
    )
    OR
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Criar políticas para print_queue
CREATE POLICY "Users can manage their company's print queue" 
ON public.print_queue 
FOR ALL 
USING (
    company_id IN (
        SELECT id FROM companies WHERE domain = (
            auth.jwt() -> 'raw_user_meta_data' ->> 'company_domain'
        )
    )
    OR
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'super_admin'
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_print_configs_company_id ON public.print_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_print_queue_company_id ON public.print_queue(company_id);
CREATE INDEX IF NOT EXISTS idx_print_queue_status ON public.print_queue(status) WHERE status = 'pending';

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_print_configs_updated_at
    BEFORE UPDATE ON public.print_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();