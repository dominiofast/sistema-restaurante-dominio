-- Criar tabela para links curtos
CREATE TABLE public.short_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id TEXT UNIQUE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    target_slug TEXT NOT NULL,
    clicks_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública dos links ativos
CREATE POLICY "Links curtos são públicos para redirecionamento" 
ON public.short_links 
FOR SELECT 
USING (is_active = true);

-- Política para empresas gerenciarem seus próprios links
CREATE POLICY "Empresas podem gerenciar seus próprios links" 
ON public.short_links 
FOR ALL 
USING (company_id = get_user_company_id());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_short_links_updated_at
BEFORE UPDATE ON public.short_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar short_id único
CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    -- Gerar string aleatória de 8 caracteres
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Inserir links curtos para empresas existentes
INSERT INTO public.short_links (short_id, company_id, target_slug)
SELECT 
    generate_short_id(),
    id,
    slug
FROM public.companies 
WHERE status = 'active' AND slug IS NOT NULL;