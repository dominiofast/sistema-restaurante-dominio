-- Criar tabela de configurações de impressão
CREATE TABLE IF NOT EXISTS public.print_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    auto_print_orders BOOLEAN DEFAULT false,
    auto_print_nfce BOOLEAN DEFAULT false,
    printer_name TEXT,
    print_copies INTEGER DEFAULT 1,
    paper_width INTEGER DEFAULT 48, -- Colunas (32, 42, 48)
    header_text TEXT,
    footer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id)
);

-- Criar tabela de fila de impressão
CREATE TABLE IF NOT EXISTS public.print_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order', 'nfce')),
    data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'printed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    printed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Habilitar RLS
ALTER TABLE public.print_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_queue ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para print_configs
CREATE POLICY "Users can manage their company print configs" 
ON public.print_configs 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para print_queue
CREATE POLICY "Users can manage their company print queue" 
ON public.print_queue 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_print_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_print_configs_updated_at
    BEFORE UPDATE ON public.print_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_print_configs_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_print_configs_company_id ON public.print_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_print_queue_company_status ON public.print_queue(company_id, status);
CREATE INDEX IF NOT EXISTS idx_print_queue_created_at ON public.print_queue(created_at);