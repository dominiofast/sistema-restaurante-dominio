-- Restaurar criação automática de usuário admin ao criar empresa
CREATE OR REPLACE FUNCTION public.create_default_branding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_response jsonb;
BEGIN
    -- Inserir configuração de branding padrão para a nova empresa
    INSERT INTO public.cardapio_branding (
        company_id,
        show_logo,
        show_banner,
        primary_color,
        secondary_color,
        accent_color,
        text_color,
        background_color,
        header_style,
        is_active
    ) VALUES (
        NEW.id,
        true,                    -- show_logo
        true,                    -- show_banner  
        '#3B82F6',              -- primary_color (azul)
        '#1E40AF',              -- secondary_color (azul escuro)
        '#F59E0B',              -- accent_color (laranja)
        '#1F2937',              -- text_color (cinza escuro)
        '#FFFFFF',              -- background_color (branco)
        'modern',               -- header_style
        true                    -- is_active
    );
    
    -- Criar métodos de entrega padrão
    INSERT INTO public.delivery_methods (
        company_id,
        delivery,
        pickup,
        eat_in
    ) VALUES (
        NEW.id,
        true,   -- delivery habilitado
        true,   -- pickup habilitado  
        false   -- eat_in desabilitado por padrão
    );
    
    -- Criar configuração de pagamento padrão
    INSERT INTO public.payment_delivery_config (
        company_id,
        accept_cash,
        accept_pix,
        accept_card,
        ask_card_brand
    ) VALUES (
        NEW.id,
        true,   -- aceita dinheiro
        true,   -- aceita pix
        true,   -- aceita cartão
        true    -- pergunta bandeira do cartão
    );

    -- Chamar Edge Function para criar usuário admin automaticamente
    -- Apenas se a empresa tiver um domínio válido
    IF NEW.domain IS NOT NULL AND NEW.domain != '' THEN
        BEGIN
            SELECT INTO function_response
            extensions.http_post(
                url := 'https://epqppxteicfuzdblbluq.supabase.co/functions/v1/create-company-admin',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NjA2MCwiZXhwIjoyMDY1NjcyMDYwfQ.lP4bx7GhWQaV6JXYq1U2r5g7xT9LGdYE8hXqQBLDJgM"}',
                body := json_build_object(
                    'company_id', NEW.id,
                    'company_domain', NEW.domain,
                    'company_name', NEW.name
                )::text
            );

            -- Log da resposta para debug
            INSERT INTO public.import_logs (
                company_id,
                status,
                source_url,
                items_imported,
                error_message
            ) VALUES (
                NEW.id,
                'admin_user_creation_attempt',
                'create-company-admin',
                1,
                'Edge function chamada para: ' || NEW.domain || '@dominiopizzas.com.br'
            );
            
        EXCEPTION WHEN OTHERS THEN
            -- Se der erro na criação do usuário, apenas loga mas não falha a criação da empresa
            INSERT INTO public.import_logs (
                company_id,
                status,
                source_url,
                items_imported,
                error_message
            ) VALUES (
                NEW.id,
                'admin_user_creation_failed',
                'create-company-admin',
                0,
                'Erro ao criar usuário admin: ' || SQLERRM
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$;