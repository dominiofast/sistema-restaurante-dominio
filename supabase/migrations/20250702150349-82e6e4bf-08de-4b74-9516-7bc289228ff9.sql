-- Atualizar função para criar usuário admin automaticamente via SQL direto
CREATE OR REPLACE FUNCTION public.create_default_branding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_email text;
  admin_password text;
  new_user_id uuid;
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

    -- Criar usuário admin automaticamente
    -- Apenas se a empresa tiver um domínio válido
    IF NEW.domain IS NOT NULL AND NEW.domain != '' THEN
        BEGIN
            -- Definir email e senha do admin
            admin_email := NEW.domain || '@dominiopizzas.com.br';
            admin_password := 'admin' || NEW.domain || '123';
            
            -- Gerar UUID para o novo usuário
            new_user_id := gen_random_uuid();
            
            -- Inserir usuário diretamente na tabela auth.users
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                invited_at,
                confirmation_token,
                confirmation_sent_at,
                recovery_token,
                recovery_sent_at,
                email_change_token_new,
                email_change,
                email_change_sent_at,
                last_sign_in_at,
                raw_app_meta_data,
                raw_user_meta_data,
                is_super_admin,
                created_at,
                updated_at,
                phone,
                phone_confirmed_at,
                phone_change,
                phone_change_token,
                phone_change_sent_at,
                email_change_token_current,
                email_change_confirm_status,
                banned_until,
                reauthentication_token,
                reauthentication_sent_at,
                is_sso_user,
                deleted_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                new_user_id,
                'authenticated',
                'authenticated', 
                admin_email,
                crypt(admin_password, gen_salt('bf')),
                NOW(),
                NULL,
                '',
                NULL,
                '',
                NULL,
                '',
                '',
                NULL,
                NULL,
                '{"provider": "email", "providers": ["email"]}',
                json_build_object(
                    'company_domain', NEW.domain,
                    'company_id', NEW.id,
                    'name', 'Admin ' || NEW.name,
                    'role', 'admin'
                ),
                false,
                NOW(),
                NOW(),
                NULL,
                NULL,
                '',
                '',
                NULL,
                '',
                0,
                NULL,
                '',
                NULL,
                false,
                NULL
            );
            
            -- Inserir credenciais na tabela company_credentials para referência
            INSERT INTO public.company_credentials (
                company_id,
                email,
                password_hash
            ) VALUES (
                NEW.id,
                admin_email,
                'managed_by_auth'
            ) ON CONFLICT (company_id) DO UPDATE SET
                email = EXCLUDED.email;

            -- Log de sucesso
            INSERT INTO public.import_logs (
                company_id,
                status,
                source_url,
                items_imported,
                error_message
            ) VALUES (
                NEW.id,
                'auto_admin_created',
                'sql_trigger',
                1,
                'Usuário admin criado automaticamente: ' || admin_email || ' | Senha: ' || admin_password
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
                'auto_admin_creation_failed',
                'sql_trigger',
                0,
                'Erro ao criar usuário admin automaticamente: ' || SQLERRM
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$;