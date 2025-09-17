-- Criar tabela de turnos
CREATE TABLE public.turnos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    numero_turno INTEGER NOT NULL,
    data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_fechamento TIMESTAMP WITH TIME ZONE,
    usuario_abertura TEXT,
    usuario_fechamento TEXT,
    status CHARACTER VARYING NOT NULL DEFAULT 'aberto',
    observacoes TEXT,
    caixa_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_company_turno_aberto UNIQUE (company_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Habilitar RLS
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para turnos
CREATE POLICY "Authenticated users can view turnos"
ON public.turnos FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert turnos"
ON public.turnos FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update turnos"
ON public.turnos FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Função para obter próximo número do turno para empresa
CREATE OR REPLACE FUNCTION get_next_turno_number_for_company(company_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
    today_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Início do dia atual
    today_start := date_trunc('day', CURRENT_TIMESTAMP);
    
    -- Buscar último número de turno do dia
    SELECT COALESCE(MAX(numero_turno), 0) + 1
    INTO next_number
    FROM public.turnos
    WHERE company_id = company_uuid
    AND data_abertura >= today_start;
    
    RETURN next_number;
END;
$$;

-- Função para obter turno ativo da empresa
CREATE OR REPLACE FUNCTION get_active_turno_for_company(company_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    turno_id UUID;
BEGIN
    SELECT id INTO turno_id
    FROM public.turnos
    WHERE company_id = company_uuid
    AND status = 'aberto'
    ORDER BY data_abertura DESC
    LIMIT 1;
    
    RETURN turno_id;
END;
$$;

-- Modificar função de numeração de pedidos para considerar turnos
CREATE OR REPLACE FUNCTION public.get_next_pedido_number_for_company_today(company_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    sequence_name TEXT;
    next_number INTEGER;
    turno_id UUID;
    turno_numero INTEGER;
BEGIN
    -- Verificar se há turno ativo
    SELECT get_active_turno_for_company(company_uuid) INTO turno_id;
    
    IF turno_id IS NULL THEN
        -- Se não há turno ativo, usar numeração diária como antes
        DECLARE
            today_date TEXT;
            sequence_exists BOOLEAN := FALSE;
        BEGIN
            today_date := to_char(CURRENT_DATE, 'YYYY_MM_DD');
            sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_' || today_date || '_seq';
            
            SELECT EXISTS (
                SELECT 1 FROM pg_sequences 
                WHERE sequencename = sequence_name AND schemaname = 'public'
            ) INTO sequence_exists;
            
            IF sequence_exists THEN
                EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            ELSE
                EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
                EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            END IF;
        END;
    ELSE
        -- Usar numeração por turno
        SELECT numero_turno INTO turno_numero FROM public.turnos WHERE id = turno_id;
        
        sequence_name := 'pedidos_' || replace(company_uuid::text, '-', '_') || '_turno_' || turno_numero || '_' || to_char(CURRENT_DATE, 'YYYY_MM_DD') || '_seq';
        
        -- Verificar se a sequência do turno existe
        DECLARE
            sequence_exists BOOLEAN := FALSE;
        BEGIN
            SELECT EXISTS (
                SELECT 1 FROM pg_sequences 
                WHERE sequencename = sequence_name AND schemaname = 'public'
            ) INTO sequence_exists;
            
            IF sequence_exists THEN
                EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            ELSE
                EXECUTE format('CREATE SEQUENCE %I START WITH 1', sequence_name);
                EXECUTE format('SELECT nextval(%L)', sequence_name) INTO next_number;
            END IF;
        END;
    END IF;
    
    RETURN next_number;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_turnos_updated_at
    BEFORE UPDATE ON public.turnos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Permissões para execução pública das funções
GRANT EXECUTE ON FUNCTION public.get_next_turno_number_for_company(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_next_turno_number_for_company(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_turno_for_company(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_active_turno_for_company(UUID) TO authenticated;