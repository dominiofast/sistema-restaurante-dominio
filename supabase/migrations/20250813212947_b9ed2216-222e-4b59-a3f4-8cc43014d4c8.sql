-- Drop all existing triggers on horarios_dias that might be causing issues
DROP TRIGGER IF EXISTS trigger_update_prompts_on_horarios_dias_change ON public.horarios_dias;
DROP TRIGGER IF EXISTS update_ai_prompts_on_horarios_dias_change ON public.horarios_dias;

-- Drop the function too
DROP FUNCTION IF EXISTS public.update_ai_prompts_on_horarios_dias_change();

-- Recreate the function with correct logic (no company_id reference)
CREATE OR REPLACE FUNCTION public.update_ai_prompts_on_horarios_dias_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    company_rec RECORD;
    horario_funcionamento_rec RECORD;
BEGIN
    -- Buscar company_id através da tabela horario_funcionamento
    SELECT company_id INTO horario_funcionamento_rec
    FROM public.horario_funcionamento
    WHERE id = COALESCE(NEW.horario_funcionamento_id, OLD.horario_funcionamento_id);
    
    -- Buscar informações da empresa
    SELECT slug, name INTO company_rec
    FROM public.companies
    WHERE id = horario_funcionamento_rec.company_id;
    
    -- Log apenas para saber que houve mudança nos horários
    IF company_rec.slug IS NOT NULL THEN
        RAISE NOTICE 'Horário de dia alterado para empresa: %', company_rec.name;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the trigger correctly
CREATE TRIGGER update_ai_prompts_on_horarios_dias_change
    AFTER INSERT OR UPDATE OR DELETE ON public.horarios_dias
    FOR EACH ROW EXECUTE FUNCTION public.update_ai_prompts_on_horarios_dias_change();