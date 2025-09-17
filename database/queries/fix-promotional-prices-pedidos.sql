-- ========================================
-- CORREÇÃO DOS PREÇOS PROMOCIONAIS EM PEDIDOS
-- ========================================
-- Este script corrige os itens de pedidos que foram salvos com preço cheio
-- em vez do preço promocional, atualizando para mostrar o preço correto

-- Função para corrigir preços promocionais em pedidos existentes
CREATE OR REPLACE FUNCTION fix_promotional_prices_in_orders()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER := 0;
  v_item RECORD;
BEGIN
  -- Buscar todos os itens de pedidos que usam produtos promocionais
  -- mas estão com valor_unitario = price em vez de promotional_price
  FOR v_item IN 
    SELECT 
      pi.id as pedido_item_id,
      pi.valor_unitario as valor_atual,
      pi.quantidade,
      p.promotional_price as preco_promocional,
      p.price as preco_original,
      p.name as produto_nome
    FROM pedido_itens pi
    JOIN produtos p ON pi.produto_id = p.id
    WHERE p.is_promotional = true 
      AND p.promotional_price IS NOT NULL
      AND pi.valor_unitario = p.price  -- Item salvo com preço cheio
      AND p.promotional_price < p.price  -- Tem desconto real
  LOOP
    -- Atualizar valor_unitario e valor_total com preço promocional
    UPDATE pedido_itens 
    SET 
      valor_unitario = v_item.preco_promocional,
      valor_total = v_item.preco_promocional * v_item.quantidade
    WHERE id = v_item.pedido_item_id;
    
    v_updated_count := v_updated_count + 1;
    
    -- Log da correção
    RAISE NOTICE 'Corrigido item: % - De R$ % para R$ %', 
      v_item.produto_nome, 
      v_item.valor_atual, 
      v_item.preco_promocional;
  END LOOP;

  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'message', 'Preços promocionais corrigidos com sucesso',
    'items_updated', v_updated_count
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Erro ao corrigir preços: ' || SQLERRM
    );
END;
$$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION fix_promotional_prices_in_orders TO authenticated;

-- ========================================
-- QUERY PARA VERIFICAR ITENS COM PROBLEMA
-- ========================================

-- Consulta para ver quais itens precisam de correção
SELECT 
  pi.id as pedido_item_id,
  ped.numero_pedido,
  p.name as produto,
  pi.valor_unitario as preco_salvo,
  p.promotional_price as preco_promocional,
  p.price as preco_original,
  (p.price - p.promotional_price) as desconto_valor,
  ROUND(((p.price - p.promotional_price) / p.price * 100)::numeric, 1) || '%' as desconto_percentual
FROM pedido_itens pi
JOIN produtos p ON pi.produto_id = p.id
JOIN pedidos ped ON pi.pedido_id = ped.id
WHERE p.is_promotional = true 
  AND p.promotional_price IS NOT NULL
  AND pi.valor_unitario = p.price  -- Problema: salvo com preço cheio
  AND p.promotional_price < p.price
ORDER BY ped.numero_pedido DESC
LIMIT 10;

-- ========================================
-- CORREÇÃO PARA ATUALIZAR TOTAIS DOS PEDIDOS
-- ========================================

-- Após corrigir os itens, precisa atualizar o total dos pedidos
CREATE OR REPLACE FUNCTION fix_order_totals_after_promotional_fix()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_orders INTEGER := 0;
  v_pedido RECORD;
  v_novo_total DECIMAL;
BEGIN
  -- Para cada pedido que teve itens corrigidos, recalcular o total
  FOR v_pedido IN 
    SELECT DISTINCT pi.pedido_id, p.numero_pedido
    FROM pedido_itens pi
    JOIN produtos prod ON pi.produto_id = prod.id
    JOIN pedidos p ON pi.pedido_id = p.id
    WHERE prod.is_promotional = true 
      AND prod.promotional_price IS NOT NULL
      AND prod.promotional_price < prod.price
  LOOP
    -- Calcular novo total baseado nos itens corrigidos
    SELECT COALESCE(SUM(pi.valor_total), 0) INTO v_novo_total
    FROM pedido_itens pi
    WHERE pi.pedido_id = v_pedido.pedido_id;
    
    -- Atualizar total do pedido
    UPDATE pedidos 
    SET total = v_novo_total
    WHERE id = v_pedido.pedido_id;
    
    v_updated_orders := v_updated_orders + 1;
    
    RAISE NOTICE 'Pedido #% - Total atualizado para R$ %', 
      v_pedido.numero_pedido, 
      v_novo_total;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'message', 'Totais dos pedidos atualizados',
    'orders_updated', v_updated_orders
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Erro: ' || SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION fix_order_totals_after_promotional_fix TO authenticated;

-- ========================================
-- EXECUTAR CORREÇÕES COMPLETAS
-- ========================================

-- PASSO 1: Executar correção dos itens
-- SELECT fix_promotional_prices_in_orders();

-- PASSO 2: Executar correção dos totais
-- SELECT fix_order_totals_after_promotional_fix();

-- ========================================
-- VERIFICAR RESULTADOS
-- ========================================

-- Verificar se corrigiu corretamente
-- SELECT 
--   ped.numero_pedido,
--   pi.nome_produto,
--   pi.valor_unitario as preco_item,
--   p.promotional_price as preco_promocional_produto,
--   pi.valor_total as total_item,
--   ped.total as total_pedido
-- FROM pedido_itens pi
-- JOIN produtos p ON pi.produto_id = p.id
-- JOIN pedidos ped ON pi.pedido_id = ped.id
-- WHERE p.is_promotional = true 
--   AND p.promotional_price IS NOT NULL
-- ORDER BY ped.numero_pedido DESC
-- LIMIT 5;
