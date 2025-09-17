
-- Corrigir todos os usuários existentes das lojas
-- Usar hash bcrypt válido para a senha 'Admin123@@'
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRt/M3OHSCi80qji6uIL75xPaELGqn7mFbP4mS',
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmation_sent_at = COALESCE(confirmation_sent_at, NOW()),
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change = '',
  phone_change = '',
  phone_change_token = '',
  email_change_token_current = '',
  email_change_confirm_status = 1,
  reauthentication_token = '',
  last_sign_in_at = COALESCE(last_sign_in_at, NOW())
WHERE email IN (
  'contato@dominiopizzas.com.br',
  'dominiopizzas@dominiopizzas.com.br', 
  'dominioburger@dominiopizzas.com.br',
  'dominiodistribuidora@dominiopizzas.com.br'
);

-- Verificar se os usuários foram corrigidos
SELECT 
  email, 
  email_confirmed_at IS NOT NULL as email_confirmed,
  encrypted_password LIKE '$2a$%' as valid_password_hash,
  last_sign_in_at
FROM auth.users 
WHERE email IN (
  'contato@dominiopizzas.com.br',
  'dominiopizzas@dominiopizzas.com.br', 
  'dominioburger@dominiopizzas.com.br',
  'dominiodistribuidora@dominiopizzas.com.br'
);
