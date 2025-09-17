-- Adicionar campo slug para identificação pública das empresas
ALTER TABLE public.companies ADD COLUMN slug TEXT UNIQUE;

-- Criar função para gerar slug a partir do nome
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            unaccent(input_text),
            '[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]', 
            '', 'g'
          ),
          '[^a-zA-Z0-9\s-]', 
          '', 'g'
        ),
        '\s+', 
        '-', 'g'
      ),
      '-+', 
      '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Gerar slugs para empresas existentes
UPDATE public.companies 
SET slug = generate_slug(name) || '-' || store_code
WHERE slug IS NULL;

-- Tornar o campo obrigatório após popular os dados existentes
ALTER TABLE public.companies ALTER COLUMN slug SET NOT NULL;

-- Criar função para auto-gerar slug em novos registros
CREATE OR REPLACE FUNCTION set_company_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Se slug não foi fornecido, gerar automaticamente
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_slug(NEW.name) || '-' || NEW.store_code;
  END IF;
  
  -- Garantir que o slug seja único
  WHILE EXISTS (SELECT 1 FROM companies WHERE slug = NEW.slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
    NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para auto-gerar slug
CREATE TRIGGER trigger_set_company_slug
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION set_company_slug();

-- Adicionar política RLS para permitir leitura pública do slug (necessário para cardápio público)
CREATE POLICY "Anyone can read company slug for public menu" 
  ON public.companies 
  FOR SELECT 
  USING (true);
