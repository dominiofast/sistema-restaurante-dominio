-- Limpar sequências problemáticas e resetar numeração por turno
DROP SEQUENCE IF EXISTS pedidos_1b24dbf6_f7bd_406e_bd8f_71d2fce1bf91_turno_2_2025_07_23_seq;

-- Garantir que o próximo pedido do turno atual comece do 1
-- Não precisamos recriar, a função já vai criar automaticamente