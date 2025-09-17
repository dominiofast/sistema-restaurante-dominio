-- Criar função para garantir consistência entre max_selection e selection_type
CREATE OR REPLACE FUNCTION public.ensure_selection_type_consistency()
RETURNS TRIGGER AS $$
BEGIN
    -- Se max_selection > 1, forçar selection_type = 'multiple'
    IF NEW.max_selection > 1 THEN
        NEW.selection_type := 'multiple';
    -- Se max_selection = 1, pode ser 'single' ou 'multiple' (manter a escolha do usuário)
    -- Se max_selection = 0 ou NULL, manter como está
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para aplicar a função antes de INSERT e UPDATE
CREATE OR REPLACE TRIGGER trigger_ensure_selection_type_consistency
    BEFORE INSERT OR UPDATE ON public.categorias_adicionais
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_selection_type_consistency();