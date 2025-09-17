
-- Atualizar os emails dos usuários existentes para usar .com.br
UPDATE auth.users SET email = 'dominiopizzas@dominiopizzas.com.br' WHERE email = 'dominiopizzas@dominiopizzas.com';
UPDATE auth.users SET email = 'dominioburger@dominiopizzas.com.br' WHERE email = 'dominioburger@dominiopizzas.com';
UPDATE auth.users SET email = 'dominiodistribuidora@dominiopizzas.com.br' WHERE email = 'dominiodistribuidora@dominiopizzas.com';

-- Atualizar as identidades também
UPDATE auth.identities SET provider_id = 'dominiopizzas@dominiopizzas.com.br' WHERE provider_id = 'dominiopizzas@dominiopizzas.com';
UPDATE auth.identities SET provider_id = 'dominioburger@dominiopizzas.com.br' WHERE provider_id = 'dominioburger@dominiopizzas.com';
UPDATE auth.identities SET provider_id = 'dominiodistribuidora@dominiopizzas.com.br' WHERE provider_id = 'dominiodistribuidora@dominiopizzas.com';

-- Atualizar o identity_data também
UPDATE auth.identities 
SET identity_data = jsonb_set(identity_data, '{email}', '"dominiopizzas@dominiopizzas.com.br"')
WHERE provider_id = 'dominiopizzas@dominiopizzas.com.br';

UPDATE auth.identities 
SET identity_data = jsonb_set(identity_data, '{email}', '"dominioburger@dominiopizzas.com.br"')
WHERE provider_id = 'dominioburger@dominiopizzas.com.br';

UPDATE auth.identities 
SET identity_data = jsonb_set(identity_data, '{email}', '"dominiodistribuidora@dominiopizzas.com.br"')
WHERE provider_id = 'dominiodistribuidora@dominiopizzas.com.br';
