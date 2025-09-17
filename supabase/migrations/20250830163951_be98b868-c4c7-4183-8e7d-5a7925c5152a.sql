-- DESABILITAR TRIGGER AUTOMÁTICO DE CASHBACK
DROP TRIGGER IF EXISTS process_order_cashback ON pedidos;

-- VERIFICAR SE A FUNÇÃO ESTÁ SENDO USADA EM OUTROS LUGARES
SELECT 'Trigger removido com sucesso. O cashback agora será processado apenas pelo OrderCreationService.' as status;