
-- Corrigir campos NULL que estão causando erro de autenticação
UPDATE auth.users 
SET 
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change = ''
WHERE email IN ('admin@sistema.com', 'joao@pizzaria.com');

-- Garantir que todos os campos obrigatórios estão preenchidos
UPDATE auth.users 
SET 
  phone = NULL,
  phone_change = '',
  phone_change_token = '',
  email_change_token_current = '',
  email_change_confirm_status = 0,
  banned_until = NULL,
  reauthentication_token = '',
  reauthentication_sent_at = NULL
WHERE email IN ('admin@sistema.com', 'joao@pizzaria.com');
