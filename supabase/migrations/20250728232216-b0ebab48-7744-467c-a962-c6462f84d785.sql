-- Verificar se a tabela printer_configs existe e criar se necessário
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'printer_configs') THEN
        CREATE TABLE public.printer_configs (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            company_id UUID NOT NULL,
            printer_type TEXT NOT NULL DEFAULT 'network',
            printer_ip TEXT,
            printer_port INTEGER DEFAULT 9100,
            printer_name TEXT,
            dominio_printer_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    END IF;
END $$;

-- Habilitar RLS na tabela
ALTER TABLE public.printer_configs ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view printer configs for their company" ON public.printer_configs;
DROP POLICY IF EXISTS "Users can insert printer configs for their company" ON public.printer_configs;
DROP POLICY IF EXISTS "Users can update printer configs for their company" ON public.printer_configs;
DROP POLICY IF EXISTS "Users can delete printer configs for their company" ON public.printer_configs;

-- Criar políticas RLS para printer_configs
CREATE POLICY "Users can view printer configs for their company"
ON public.printer_configs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.company_id = printer_configs.company_id
        AND cu.user_id = auth.uid()
        AND cu.status = 'active'
    )
);

CREATE POLICY "Users can insert printer configs for their company"
ON public.printer_configs
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.company_id = printer_configs.company_id
        AND cu.user_id = auth.uid()
        AND cu.status = 'active'
    )
);

CREATE POLICY "Users can update printer configs for their company"
ON public.printer_configs
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.company_id = printer_configs.company_id
        AND cu.user_id = auth.uid()
        AND cu.status = 'active'
    )
);

CREATE POLICY "Users can delete printer configs for their company"
ON public.printer_configs
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.company_users cu
        WHERE cu.company_id = printer_configs.company_id
        AND cu.user_id = auth.uid()
        AND cu.status = 'active'
    )
);

-- Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_printer_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para timestamps
DROP TRIGGER IF EXISTS update_printer_configs_updated_at ON public.printer_configs;
CREATE TRIGGER update_printer_configs_updated_at
    BEFORE UPDATE ON public.printer_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_printer_configs_updated_at();