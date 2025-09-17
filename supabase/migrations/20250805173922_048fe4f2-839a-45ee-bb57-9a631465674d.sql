-- Corrigir o trigger que está causando erro ao tentar usar net.http_post
-- Vamos usar a extensão http correta

DROP FUNCTION IF EXISTS public.trigger_auto_print_pedido() CASCADE;

CREATE OR REPLACE FUNCTION public.trigger_auto_print_pedido()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    print_config RECORD;
    company_info RECORD;
    company_address RECORD;
    pedido_data JSONB;
BEGIN
    -- Buscar configuração da impressora para a empresa
    SELECT * INTO print_config 
    FROM public.company_settings 
    WHERE company_id = NEW.company_id;
    
    -- Se não há configuração de impressora, não fazer nada
    IF NOT FOUND OR print_config.dominio_printer_name IS NULL THEN
        INSERT INTO public.ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'IMPRESSÃO AUTO: Configuração de impressora não encontrada para pedido #' || COALESCE(NEW.numero_pedido, NEW.id),
            'auto_print_config_missing', now()
        );
        RETURN NEW;
    END IF;
    
    -- Buscar dados da empresa
    SELECT * INTO company_info
    FROM public.company_info
    WHERE company_id = NEW.company_id;
    
    -- Buscar endereço principal da empresa
    SELECT * INTO company_address
    FROM public.company_addresses
    WHERE company_id = NEW.company_id AND is_principal = true;
    
    -- Preparar dados do pedido para envio
    pedido_data := jsonb_build_object(
        'pedido_id', NEW.id,
        'numero_pedido', NEW.numero_pedido,
        'company_id', NEW.company_id,
        'printer_name', print_config.dominio_printer_name,
        'company_info', jsonb_build_object(
            'nome_estabelecimento', COALESCE(company_info.nome_estabelecimento, 'ESTABELECIMENTO'),
            'endereco', COALESCE(company_info.endereco, ''),
            'contato', COALESCE(company_info.contato, ''),
            'cnpj_cpf', COALESCE(company_info.cnpj_cpf, '')
        ),
        'company_address', CASE 
            WHEN company_address.id IS NOT NULL THEN
                jsonb_build_object(
                    'logradouro', company_address.logradouro,
                    'numero', company_address.numero,
                    'complemento', company_address.complemento,
                    'bairro', company_address.bairro,
                    'cidade', company_address.cidade,
                    'estado', company_address.estado,
                    'cep', company_address.cep
                )
            ELSE NULL
        END,
        'pedido', jsonb_build_object(
            'nome', NEW.nome,
            'telefone', NEW.telefone,
            'endereco', NEW.endereco,
            'tipo', NEW.tipo,
            'pagamento', NEW.pagamento,
            'total', NEW.total,
            'observacoes', NEW.observacoes
        )
    );
    
    -- Chamar a edge function para processar a impressão usando a extensão http correta
    BEGIN
        PERFORM
            public.http_post(
                'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/auto-print-pedido',
                pedido_data::text,
                'application/json'
            );
    EXCEPTION WHEN OTHERS THEN
        -- Log do erro se a chamada falhar
        INSERT INTO public.ai_conversation_logs (
            company_id, customer_phone, customer_name, message_content, message_type, created_at
        ) VALUES (
            NEW.company_id, NEW.telefone, NEW.nome,
            'ERRO IMPRESSÃO AUTO: ' || SQLERRM || ' - Pedido #' || COALESCE(NEW.numero_pedido, NEW.id),
            'auto_print_error', now()
        );
    END;
    
    -- Log de tentativa de impressão
    INSERT INTO public.ai_conversation_logs (
        company_id, customer_phone, customer_name, message_content, message_type, created_at
    ) VALUES (
        NEW.company_id, NEW.telefone, NEW.nome,
        'IMPRESSÃO AUTO: Enviado para processamento - Pedido #' || COALESCE(NEW.numero_pedido, NEW.id) || ' | Impressora: ' || print_config.dominio_printer_name,
        'auto_print_triggered', now()
    );
    
    RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER auto_print_pedido_trigger
    AFTER INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_auto_print_pedido();