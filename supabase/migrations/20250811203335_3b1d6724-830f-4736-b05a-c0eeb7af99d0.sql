-- Corrigir o tipo de seleção da categoria "Escolha o sabor" para o Combo N1 Esfihas
-- Mudar de 'multiple' para 'quantity' para permitir múltiplas unidades do mesmo sabor

UPDATE categorias_adicionais 
SET selection_type = 'quantity'
WHERE name = 'Escolha o sabor';