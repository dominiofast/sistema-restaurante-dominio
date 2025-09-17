-- 1. VERIFICAR TRIGGERS ATIVOS
SELECT 
    'TRIGGERS ATIVOS' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'pedidos'
AND trigger_name LIKE '%notify%';
