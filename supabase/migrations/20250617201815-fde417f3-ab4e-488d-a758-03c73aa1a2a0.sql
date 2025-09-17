
-- Atualizar usuário da Domínio Pizzas
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_build_object(
    'name', 'Admin Domínio Pizzas',
    'role', 'admin',
    'company_domain', 'dominiopizzas'
  ),
  updated_at = NOW()
WHERE email = 'dominiopizzas@dominiopizzas.com.br';

-- Atualizar usuário da Domínio Burger  
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_build_object(
    'name', 'Admin Domínio Burger',
    'role', 'admin', 
    'company_domain', 'dominioburger'
  ),
  updated_at = NOW()
WHERE email = 'dominioburger@dominiopizzas.com.br';

-- Atualizar usuário da Domínio Distribuidora
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_build_object(
    'name', 'Admin Domínio Distribuidora',
    'role', 'admin',
    'company_domain', 'dominiodistribuidora'
  ),
  updated_at = NOW()
WHERE email = 'dominiodistribuidora@dominiopizzas.com.br';

-- Verificar se as atualizações foram feitas corretamente
SELECT 
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'company_domain' as company_domain,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email IN (
  'dominiopizzas@dominiopizzas.com.br',
  'dominioburger@dominiopizzas.com.br', 
  'dominiodistribuidora@dominiopizzas.com.br'
)
ORDER BY email;
