-- Corrigir pedido #9 (ID 480) com endereço malformado
UPDATE pedidos 
SET endereco = 'Avenida Porto Velho, 4044, Centro, Cacoal/RO'
WHERE id = 480;