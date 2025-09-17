-- Aplicar template padrão para todas as empresas existentes
DO $$
DECLARE
    company_rec record;
BEGIN
    FOR company_rec IN 
        SELECT DISTINCT c.slug, c.name
        FROM companies c
        WHERE c.status = 'active' AND c.slug IS NOT NULL
    LOOP
        PERFORM create_prompt_from_global_template(company_rec.slug, company_rec.name);
    END LOOP;
END $$;

-- Aplicar RLS na nova tabela
ALTER TABLE public.ai_global_prompt_template ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage global templates" 
ON public.ai_global_prompt_template 
FOR ALL 
USING (get_user_role() = 'super_admin'::text)
WITH CHECK (get_user_role() = 'super_admin'::text);

-- Trigger automático para criar prompt quando empresa é criada
CREATE OR REPLACE FUNCTION auto_create_prompt_for_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Só criar se o slug existir
    IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
        PERFORM create_prompt_from_global_template(NEW.slug, NEW.name);
    END IF;
    RETURN NEW;
END;
$$;

-- Criar trigger que executa após insert/update na tabela companies
CREATE TRIGGER trigger_auto_create_prompt
    AFTER INSERT OR UPDATE OF slug, name
    ON public.companies
    FOR EACH ROW
    WHEN (NEW.slug IS NOT NULL AND NEW.slug != '')
    EXECUTE FUNCTION auto_create_prompt_for_company();