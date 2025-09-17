
-- Atualizar o usuário contato@dominiopizzas.com.br para ser super admin
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_build_object(
    'name', 'Super Admin Domínio', 
    'role', 'super_admin'
  ),
  is_super_admin = true,
  updated_at = NOW()
WHERE email = 'contato@dominiopizzas.com.br';

-- Verificar se a atualização foi feita
SELECT 
  email, 
  is_super_admin, 
  raw_user_meta_data,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'contato@dominiopizzas.com.br';
