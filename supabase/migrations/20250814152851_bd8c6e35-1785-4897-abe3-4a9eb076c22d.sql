-- Remover o trigger problemático
DROP TRIGGER IF EXISTS trigger_auto_update_cliente_inactivity ON public.clientes;
DROP FUNCTION IF EXISTS public.auto_update_cliente_inactivity();

-- Função corrigida para atualizar status baseado no campo dias_sem_comprar já existente
CREATE OR REPLACE FUNCTION public.update_client_status_by_inactivity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atualizar apenas clientes que já tem o campo dias_sem_comprar preenchido
    -- e marcar como inativo apenas aqueles com mais de 30 dias SEM COMPRAR (não cadastro)
    UPDATE public.clientes 
    SET status = 'inativo'
    WHERE 
        dias_sem_comprar > 30 
        AND status != 'inativo'
        AND dias_sem_comprar IS NOT NULL;
    
    -- Marcar como ativo clientes recém cadastrados ou com poucos dias sem comprar
    UPDATE public.clientes 
    SET status = 'ativo'
    WHERE 
        (dias_sem_comprar <= 30 OR dias_sem_comprar IS NULL)
        AND status = 'inativo';
    
    RAISE NOTICE 'Status dos clientes atualizado baseado em dias sem comprar';
END;
$$;

-- Executar correção para os clientes existentes
SELECT public.update_client_status_by_inactivity();