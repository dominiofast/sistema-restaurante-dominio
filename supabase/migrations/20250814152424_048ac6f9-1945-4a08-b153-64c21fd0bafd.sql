-- Função para atualizar status dos clientes baseado em dias sem comprar
CREATE OR REPLACE FUNCTION public.update_client_status_by_inactivity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atualizar clientes com mais de 30 dias sem compra para inativo
    UPDATE public.clientes 
    SET 
        status = 'inativo',
        dias_sem_comprar = EXTRACT(DAY FROM NOW() - data_cadastro)::integer
    WHERE 
        dias_sem_comprar > 30 
        AND status != 'inativo';
    
    -- Atualizar dias_sem_comprar para todos os clientes
    UPDATE public.clientes 
    SET dias_sem_comprar = EXTRACT(DAY FROM NOW() - data_cadastro)::integer;
    
    RAISE NOTICE 'Status dos clientes atualizado baseado na inatividade';
END;
$$;

-- Trigger para atualizar automaticamente quando inserir/atualizar clientes
CREATE OR REPLACE FUNCTION public.auto_update_cliente_inactivity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Calcular dias sem comprar baseado na data de cadastro
    NEW.dias_sem_comprar = EXTRACT(DAY FROM NOW() - COALESCE(NEW.data_cadastro, NOW()))::integer;
    
    -- Se mais de 30 dias, marcar como inativo
    IF NEW.dias_sem_comprar > 30 THEN
        NEW.status = 'inativo';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger para novos registros e atualizações
DROP TRIGGER IF EXISTS trigger_auto_update_cliente_inactivity ON public.clientes;
CREATE TRIGGER trigger_auto_update_cliente_inactivity
    BEFORE INSERT OR UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_update_cliente_inactivity();

-- Executar a função uma vez para atualizar clientes existentes
SELECT public.update_client_status_by_inactivity();