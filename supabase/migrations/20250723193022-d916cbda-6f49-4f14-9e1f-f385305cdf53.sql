-- Função para definir order_position automático para categorias de adicionais
CREATE OR REPLACE FUNCTION set_categoria_adicional_order_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_position IS NULL THEN
    SELECT COALESCE(MAX(order_position), 0) + 1
    INTO NEW.order_position
    FROM categorias_adicionais
    WHERE company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para definir order_position automático para adicionais
CREATE OR REPLACE FUNCTION set_adicional_order_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_position IS NULL THEN
    SELECT COALESCE(MAX(order_position), 0) + 1
    INTO NEW.order_position
    FROM adicionais
    WHERE categoria_adicional_id = NEW.categoria_adicional_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para definir order_position automaticamente
DROP TRIGGER IF EXISTS trigger_set_categoria_adicional_order_position ON categorias_adicionais;
CREATE TRIGGER trigger_set_categoria_adicional_order_position
  BEFORE INSERT ON categorias_adicionais
  FOR EACH ROW
  EXECUTE FUNCTION set_categoria_adicional_order_position();

DROP TRIGGER IF EXISTS trigger_set_adicional_order_position ON adicionais;
CREATE TRIGGER trigger_set_adicional_order_position
  BEFORE INSERT ON adicionais
  FOR EACH ROW
  EXECUTE FUNCTION set_adicional_order_position();