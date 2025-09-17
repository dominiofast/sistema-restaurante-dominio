-- Verificar extensões disponíveis e corrigir a função
SELECT * FROM pg_available_extensions WHERE name LIKE '%http%';