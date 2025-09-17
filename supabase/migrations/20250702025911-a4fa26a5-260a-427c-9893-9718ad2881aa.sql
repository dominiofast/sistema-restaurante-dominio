-- Atualizar a função create_default_branding para criar usuário admin automaticamente
-- Versão simplificada sem ALTER SYSTEM
CREATE OR REPLACE FUNCTION public.create_default_branding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

    -- Log da criação da empresa (o usuário admin será criado manualmente por enquanto)
    INSERT INTO public.import_logs (
        company_id,
        status,
        source_url,
        items_imported,
        error_message
    ) VALUES (
        NEW.id,
        'company_created',
        'auto_setup',
        1,
        'Empresa criada - Configurações automáticas aplicadas. Criar usuário admin: ' || NEW.domain || '@dominiopizzas.com.br'
    );
    
    RETURN NEW;
END;
$$;

-- Verificar que o trigger ainda está ativo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'create_default_branding_trigger';