
-- Restaurar o super admin contato@dominiopizzas.com.br
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
  '66f77734-a25e-44ab-90c1-db6e0c6f27bd',
  'authenticated',
  'authenticated',
  'contato@dominiopizzas.com.br',
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
  '{"name": "Super Admin", "role": "super_admin"}',
  true,
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
) VALUES (
  'contato@dominiopizzas.com.br',
  '66f77734-a25e-44ab-90c1-db6e0c6f27bd',
  jsonb_build_object(
    'sub', '66f77734-a25e-44ab-90c1-db6e0c6f27bd',
    'email', 'contato@dominiopizzas.com.br',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
);

-- Verificar todos os usuários
SELECT email, raw_user_meta_data, is_super_admin, created_at 
FROM auth.users 
ORDER BY email;
