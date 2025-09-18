-- Criar usuário superadmin contato@dominio.tech
-- Este usuário terá acesso total ao sistema

-- Primeiro, verificar se o usuário já existe e deletar se necessário
DELETE FROM auth.users WHERE email = 'contato@dominio.tech';

-- Criar o usuário superadmin
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'contato@dominio.tech',
  crypt('SuperAdmin2024!', gen_salt('bf')), -- Senha forte para produção
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NOW(),
  '',
  '',
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  json_build_object(
    'name', 'Super Admin',
    'role', 'super_admin',
    'company_domain', 'sistema',
    'company_id', null -- Superadmin não está vinculado a uma empresa específica
  ),
  true, -- is_super_admin = true
  NOW(),
  NOW(),
  null,
  null,
  '',
  '',
  NOW(),
  '',
  0,
  null,
  '',
  NOW(),
  false,
  null
);

-- Inserir identidade para o super admin
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
) 
SELECT 
  'contato@dominio.tech',
  u.id,
  jsonb_build_object(
    'sub', u.id,
    'email', 'contato@dominio.tech',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
FROM auth.users u 
WHERE u.email = 'contato@dominio.tech';

-- Verificar se o usuário foi criado corretamente
SELECT 
  email, 
  raw_user_meta_data, 
  is_super_admin, 
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'contato@dominio.tech';
