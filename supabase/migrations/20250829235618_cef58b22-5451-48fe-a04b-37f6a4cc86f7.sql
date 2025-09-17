-- Atualizar a edge function get-maps-config para usar a chave correta
UPDATE app_settings 
SET value = 'AIzaSyDN-8GIOkty4M0Yj2UZi3iSnllDBcbE-GY'
WHERE key = 'GOOGLE_MAPS_API_KEY';