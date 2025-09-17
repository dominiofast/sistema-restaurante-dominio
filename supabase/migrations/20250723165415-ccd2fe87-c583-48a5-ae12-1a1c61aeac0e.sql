-- Limpar todas as sequências problemáticas do turno 3
DROP SEQUENCE IF EXISTS pedidos_1b24dbf6_f7bd_406e_bd8f_71d2fce1bf91_turno_3_2025_07_23_seq CASCADE;

-- Recriar o trigger 
DROP TRIGGER IF EXISTS trigger_set_numero_pedido ON public.pedidos;
CREATE TRIGGER trigger_set_numero_pedido
    BEFORE INSERT ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION set_numero_pedido();