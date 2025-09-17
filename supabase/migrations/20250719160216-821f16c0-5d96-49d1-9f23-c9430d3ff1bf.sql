-- Atualizar email do super admin
UPDATE auth.users 
SET email = 'contato@dominio.tech'
WHERE email = 'contato@dominiopizzas.com.br' 
AND is_super_admin = true;

-- Atualizar também a identidade correspondente
UPDATE auth.identities 
SET provider_id = 'contato@dominio.tech',
    identity_data = jsonb_set(
      identity_data,
      '{email}',
      '"contato@dominio.tech"'
    )
WHERE provider_id = 'contato@dominiopizzas.com.br'
AND provider = 'email';