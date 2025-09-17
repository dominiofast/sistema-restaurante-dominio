-- Verificar se a função criar_pedido_pdv_completo existe
SELECT proname, proargnames, prosrc 
FROM pg_proc 
WHERE proname = 'criar_pedido_pdv_completo';