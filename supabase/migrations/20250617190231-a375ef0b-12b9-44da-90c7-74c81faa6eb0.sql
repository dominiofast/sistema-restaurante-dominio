
-- Primeiro, vamos verificar se os usuários existem
SELECT email, encrypted_password, email_confirmed_at 
FROM auth.users 
WHERE email LIKE '%dominiopizzas.com.br%';

-- Limpar usuários existentes se houver problemas
DELETE FROM auth.identities WHERE provider_id LIKE '%@dominiopizzas.com.br%';
DELETE FROM auth.users WHERE email LIKE '%@dominiopizzas.com.br%';

-- Recriar os usuários com hash bcrypt correto para senha '123456'
-- Hash: $2a$10$N9qo8uLOickgx2ZMRt/M3OHSCi80qji6uIL75xPaELGqn7mFbP4mS

-- Usuário Domínio Pizzas
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
  '550e8400-e29b-41d4-a716-446655441001',
  'authenticated',
  'authenticated',
  'dominiopizzas@dominiopizzas.com.br',
  '$2a$10$N9qo8uLOickgx2ZMRt/M3OHSCi80qji6uIL75xPaELGqn7mFbP4mS',
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
  '{"name": "Admin Domínio Pizzas"}',
  false,
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

-- Usuário Domínio Burger
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
  '550e8400-e29b-41d4-a716-446655441002',
  'authenticated',
  'authenticated',
  'dominioburger@dominiopizzas.com.br',
  '$2a$10$N9qo8uLOickgx2ZMRt/M3OHSCi80qji6uIL75xPaELGqn7mFbP4mS',
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
  '{"name": "Admin Domínio Burger"}',
  false,
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

-- Usuário Domínio Distribuidora
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
  '550e8400-e29b-41d4-a716-446655441003',
  'authenticated',
  'authenticated',
  'dominiodistribuidora@dominiopizzas.com.br',
  '$2a$10$N9qo8uLOickgx2ZMRt/M3OHSCi80qji6uIL75xPaELGqn7mFbP4mS',
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
  '{"name": "Admin Domínio Distribuidora"}',
  false,
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

-- Inserir identidades para os usuários
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
) VALUES 
(
  'dominiopizzas@dominiopizzas.com.br',
  '550e8400-e29b-41d4-a716-446655441001',
  jsonb_build_object(
    'sub', '550e8400-e29b-41d4-a716-446655441001',
    'email', 'dominiopizzas@dominiopizzas.com.br',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
),
(
  'dominioburger@dominiopizzas.com.br',
  '550e8400-e29b-41d4-a716-446655441002',
  jsonb_build_object(
    'sub', '550e8400-e29b-41d4-a716-446655441002',
    'email', 'dominioburger@dominiopizzas.com.br',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
),
(
  'dominiodistribuidora@dominiopizzas.com.br',
  '550e8400-e29b-41d4-a716-446655441003',
  jsonb_build_object(
    'sub', '550e8400-e29b-41d4-a716-446655441003',
    'email', 'dominiodistribuidora@dominiopizzas.com.br',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
);

-- Verificar se os usuários foram criados corretamente
SELECT email, encrypted_password, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE '%@dominiopizzas.com.br%'
ORDER BY email;
