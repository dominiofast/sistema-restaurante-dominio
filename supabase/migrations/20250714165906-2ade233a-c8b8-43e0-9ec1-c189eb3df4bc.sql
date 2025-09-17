-- Remover temporariamente o trigger de cashback
DROP TRIGGER IF EXISTS process_order_cashback ON public.pedidos;

-- Aumentar o tamanho das colunas
ALTER TABLE public.pedidos 
ALTER COLUMN telefone TYPE VARCHAR(50),
ALTER COLUMN horario TYPE VARCHAR(50),
ALTER COLUMN pagamento TYPE VARCHAR(50),
ALTER COLUMN tipo TYPE VARCHAR(50),
ALTER COLUMN origem TYPE VARCHAR(50);

-- Recriar o trigger de cashback
CREATE TRIGGER process_order_cashback
    AFTER INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION process_cashback_for_order();