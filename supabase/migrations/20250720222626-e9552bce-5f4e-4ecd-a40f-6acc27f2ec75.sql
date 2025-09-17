-- Função para gerar slug automaticamente baseado no nome da empresa
CREATE OR REPLACE FUNCTION public.generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o slug não foi fornecido, gerar baseado no nome
    IF NEW.slug IS NULL THEN
        NEW.slug := lower(regexp_replace(
            NEW.name,
            '[^a-zA-Z0-9]+', 
            '', 
            'g'
        ));
        
        -- Limitar tamanho do slug e remover caracteres especiais
        NEW.slug := substring(NEW.slug from 1 for 50);
        
        -- Se ficou vazio, usar o domain como fallback
        IF NEW.slug IS NULL OR NEW.slug = '' THEN
            NEW.slug := NEW.domain;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar antes de inserir nova empresa
CREATE TRIGGER generate_slug_on_company_insert
    BEFORE INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_company_slug();

-- Também executar antes de update caso o nome mude e slug esteja vazio
CREATE TRIGGER generate_slug_on_company_update
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION public.generate_company_slug();