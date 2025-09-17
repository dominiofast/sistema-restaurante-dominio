-- Verificar se trigger existe e recriar se necessário
DROP TRIGGER IF EXISTS trigger_set_numero_pedido ON public.pedidos;

-- Recriar o trigger para definir numero_pedido automaticamente
CREATE TRIGGER trigger_set_numero_pedido
    BEFORE INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION set_numero_pedido();

-- Testar a função diretamente
SELECT get_next_pedido_number_by_turno('1b24dbf6-f7bd-406e-bd8f-71d2fce1bf91'::uuid) as proximo_numero;