-- Criar tabela para controle de caixa
CREATE TABLE public.caixas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    valor_abertura DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_fechamento DECIMAL(10,2),
    data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_fechamento TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
    usuario_abertura TEXT,
    usuario_fechamento TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para lançamentos do caixa
CREATE TABLE public.caixa_lancamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    caixa_id UUID NOT NULL REFERENCES public.caixas(id) ON DELETE CASCADE,
    company_id UUID NOT NULL,
    data_lancamento DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_lancamento TIME NOT NULL DEFAULT CURRENT_TIME,
    descricao TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    usuario TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar foreign keys
ALTER TABLE public.caixas ADD CONSTRAINT caixas_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id);

ALTER TABLE public.caixa_lancamentos ADD CONSTRAINT caixa_lancamentos_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- Habilitar RLS
ALTER TABLE public.caixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_lancamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para caixas
CREATE POLICY "Users can view their company caixas" ON public.caixas
FOR SELECT USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can insert their company caixas" ON public.caixas
FOR INSERT WITH CHECK (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can update their company caixas" ON public.caixas
FOR UPDATE USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Criar políticas RLS para caixa_lancamentos
CREATE POLICY "Users can view their company caixa lancamentos" ON public.caixa_lancamentos
FOR SELECT USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can insert their company caixa lancamentos" ON public.caixa_lancamentos
FOR INSERT WITH CHECK (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can update their company caixa lancamentos" ON public.caixa_lancamentos
FOR UPDATE USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

CREATE POLICY "Users can delete their company caixa lancamentos" ON public.caixa_lancamentos
FOR DELETE USING (
    company_id IN (
        SELECT c.id FROM companies c 
        JOIN auth.users u ON u.raw_user_meta_data->>'company_domain' = c.domain 
        WHERE u.id = auth.uid()
    ) OR 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'super_admin'
    )
);

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_caixa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_caixas_updated_at
    BEFORE UPDATE ON public.caixas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_caixa_updated_at();

CREATE TRIGGER update_caixa_lancamentos_updated_at
    BEFORE UPDATE ON public.caixa_lancamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_caixa_updated_at();

-- Criar índices para performance
CREATE INDEX idx_caixas_company_id ON public.caixas(company_id);
CREATE INDEX idx_caixas_status ON public.caixas(status);
CREATE INDEX idx_caixa_lancamentos_caixa_id ON public.caixa_lancamentos(caixa_id);
CREATE INDEX idx_caixa_lancamentos_company_id ON public.caixa_lancamentos(company_id);
CREATE INDEX idx_caixa_lancamentos_data ON public.caixa_lancamentos(data_lancamento);