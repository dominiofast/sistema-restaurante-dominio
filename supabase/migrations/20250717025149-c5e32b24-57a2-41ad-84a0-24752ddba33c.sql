-- Criar função para impressão automática de pedidos
CREATE OR REPLACE FUNCTION public.auto_print_pedido_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Registrar o trigger
    INSERT INTO public.ai_conversation_logs (
        company_id,
        customer_phone,
        customer_name,
        message_content,
        message_type,
        created_at
    ) VALUES (
        NEW.company_id,
        NEW.telefone,
        NEW.nome,
        'TRIGGER: Pedido #' || NEW.id || ' criado, iniciando impressão automática',
        'auto_print_trigger',
        now()
    );

    -- Chamar a edge function para impressão automática
    PERFORM
        net.http_post(
            url := 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/auto-print-pedido',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
            ),
            body := jsonb_build_object(
                'pedido_id', NEW.id,
                'company_id', NEW.company_id
            )
        );

    RETURN NEW;
END;
$$;

-- Criar trigger que executa a função quando um pedido é inserido
DROP TRIGGER IF EXISTS trigger_auto_print_pedido ON public.pedidos;
CREATE TRIGGER trigger_auto_print_pedido
    AFTER INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_print_pedido_on_insert();