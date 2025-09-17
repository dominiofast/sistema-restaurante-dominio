
-- Garantir que o usuário super admin tenha o email confirmado
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmation_sent_at = NOW(),
  confirmation_token = '',
  email_change_confirm_status = 1
WHERE email = 'contato@dominiopizzas.com.br';

-- Verificar se existe alguma configuração que possa estar bloqueando
SELECT email, email_confirmed_at, confirmation_token, email_change_confirm_status
FROM auth.users 
WHERE email = 'contato@dominiopizzas.com.br';

-- Atualizar todos os usuários de teste para ter emails confirmados
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmation_sent_at = COALESCE(confirmation_sent_at, NOW()),
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 1)
WHERE email IN (
  'contato@dominiopizzas.com.br',
  'dominiopizzas@dominiopizzas.com.br', 
  'dominioburger@dominiopizzas.com.br',
  'dominiodistribuidora@dominiopizzas.com.br'
);
