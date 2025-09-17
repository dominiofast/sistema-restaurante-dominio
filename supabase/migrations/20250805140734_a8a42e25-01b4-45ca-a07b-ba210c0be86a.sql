-- Atualizar metadados do usuário Fernando para garantir acesso correto à empresa Cookielab
UPDATE auth.users 
SET raw_user_meta_data = jsonb_build_object(
  'company_domain', 'cookielab',
  'company_id', '39a85df3-7a23-4b10-b260-02f595a2ab06',
  'email_verified', true,
  'name', 'Fernando',
  'role', 'user'
)
WHERE email = 'fernandofreire5878@gmail.com';

-- Verificar se o usuário foi atualizado
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'fernandofreire5878@gmail.com';