-- Atualizar o metadata do usuário Fernando para incluir company_domain
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"company_domain": "cookielab"}'::jsonb
WHERE email = 'fernandofreire5878@gmail.com';