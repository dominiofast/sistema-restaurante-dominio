-- Recriar o trigger para definir numero_pedido automaticamente
CREATE TRIGGER trigger_set_numero_pedido
    BEFORE INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION set_numero_pedido();