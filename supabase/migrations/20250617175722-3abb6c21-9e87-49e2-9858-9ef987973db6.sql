
-- Atualizar as senhas dos usuários de teste para hash correto de '123456'
-- O hash correto para '123456' no bcrypt é:
UPDATE auth.users 
SET encrypted_password = '$2a$10$GBXHrdt7HFiSM2CFBOOcXuKNjTJM1hhELI7O7Ht2oJqoIeWJXTMJG'
WHERE email IN ('admin@sistema.com', 'joao@pizzaria.com');

-- Garantir que os usuários estão confirmados e ativos
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmation_sent_at = NOW(),
  last_sign_in_at = NOW()
WHERE email IN ('admin@sistema.com', 'joao@pizzaria.com');
