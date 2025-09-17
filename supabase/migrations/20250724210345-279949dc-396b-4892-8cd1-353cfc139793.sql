-- Verificar estrutura da tabela pedido_itens
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pedido_itens' AND table_schema = 'public'
ORDER BY ordinal_position;