-- Criar tabela para armazenar campanhas de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(50) NOT NULL DEFAULT 'todos-clientes',
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_company_id ON public.whatsapp_campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status ON public.whatsapp_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_created_at ON public.whatsapp_campaigns(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem ver campanhas da própria empresa
CREATE POLICY "Users can view campaigns from their company" ON public.whatsapp_campaigns
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.user_companies 
            WHERE user_id = auth.uid()
        )
    );

-- Política RLS: usuários podem inserir campanhas para sua empresa
CREATE POLICY "Users can insert campaigns for their company" ON public.whatsapp_campaigns
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_companies 
            WHERE user_id = auth.uid()
        )
    );

-- Política RLS: usuários podem atualizar campanhas da própria empresa
CREATE POLICY "Users can update campaigns from their company" ON public.whatsapp_campaigns
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.user_companies 
            WHERE user_id = auth.uid()
        )
    );

-- Política RLS: usuários podem deletar campanhas da própria empresa
CREATE POLICY "Users can delete campaigns from their company" ON public.whatsapp_campaigns
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.user_companies 
            WHERE user_id = auth.uid()
        )
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_whatsapp_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_campaigns_updated_at
    BEFORE UPDATE ON public.whatsapp_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_campaigns_updated_at();
