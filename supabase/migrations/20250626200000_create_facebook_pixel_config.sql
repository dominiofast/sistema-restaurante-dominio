-- Função para obter o company_id do usuário logado a partir do seu company_domain nos metadados.
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS UUID AS $$
DECLARE
    company_domain_text TEXT;
    company_id_result UUID;
BEGIN
    -- Extrai o company_domain dos metadados do usuário autenticado
    SELECT raw_user_meta_data->>'company_domain' INTO company_domain_text
    FROM auth.users WHERE id = auth.uid();

    -- Se um company_domain foi encontrado, busca o ID da empresa correspondente
    IF company_domain_text IS NOT NULL THEN
        SELECT id INTO company_id_result
        FROM public.companies
        WHERE domain = company_domain_text;
    END IF;

    RETURN company_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Tabela para armazenar as configurações do Facebook Pixel por empresa
CREATE TABLE public.facebook_pixel_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    pixel_id VARCHAR(255) NOT NULL,
    access_token TEXT, -- Deve ser criptografado na aplicação antes de salvar
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    test_mode BOOLEAN NOT NULL DEFAULT FALSE,
    test_event_code VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_company_pixel UNIQUE (company_id) -- Garante uma config por empresa
);

-- Comentários para clareza
COMMENT ON COLUMN public.facebook_pixel_configs.access_token IS 'Token de Acesso para a API de Conversões. Criptografado.';
COMMENT ON COLUMN public.facebook_pixel_configs.test_event_code IS 'Código de evento de teste para validação via Facebook Events Manager.';

-- Habilita a política de segurança a nível de linha (RLS)
ALTER TABLE public.facebook_pixel_configs ENABLE ROW LEVEL SECURITY;

-- Política de acesso CORRIGIDA para os donos da empresa
CREATE POLICY "Allow full access to own company's pixel config"
ON public.facebook_pixel_configs
FOR ALL
USING (company_id = get_my_company_id());


-- Tabela para registrar os logs de eventos enviados (tanto via Pixel quanto Conversions API)
CREATE TABLE public.pixel_event_logs (
    id BIGSERIAL PRIMARY KEY,
    config_id UUID NOT NULL REFERENCES public.facebook_pixel_configs(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_id VARCHAR(255), -- ID de evento para deduplicação
    payload JSONB,
    source TEXT check (source in ('client', 'server')),
    status TEXT check (status in ('sent', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.pixel_event_logs IS 'Registra todos os eventos do Facebook Pixel e da API de Conversões para depuração.';
COMMENT ON COLUMN public.pixel_event_logs.event_id IS 'ID único para cada evento, usado para deduplicação entre client e server.';
COMMENT ON COLUMN public.pixel_event_logs.source IS 'Indica se o evento foi disparado do "client" (navegador) ou "server" (API de Conversões).';


-- Habilita RLS para a tabela de logs
ALTER TABLE public.pixel_event_logs ENABLE ROW LEVEL SECURITY;

-- Política de acesso CORRIGIDA para os donos da empresa verem seus logs
CREATE POLICY "Allow read access to own company's pixel logs"
ON public.pixel_event_logs
FOR SELECT
USING (
    config_id = (
        SELECT id 
        FROM public.facebook_pixel_configs 
        WHERE company_id = get_my_company_id()
    )
);

-- Gatilho para atualizar o campo `updated_at`
CREATE OR REPLACE FUNCTION public.handle_facebook_pixel_configs_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_facebook_pixel_configs_updated
BEFORE UPDATE ON public.facebook_pixel_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_facebook_pixel_configs_update(); 