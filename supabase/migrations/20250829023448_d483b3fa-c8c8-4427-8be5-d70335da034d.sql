-- Corrigir pedido #479 com endereço malformado
UPDATE pedidos 
SET endereco = 'Avenida Porto Velho, 4044, Centro, Cacoal/RO'
WHERE id = 479;