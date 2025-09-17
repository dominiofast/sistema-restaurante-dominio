-- Atualizar programas para começar com "Domínio" em vez de "Saipos"
UPDATE public.programas_saipos 
SET nome = REPLACE(nome, 'Saipos', 'Domínio')
WHERE nome LIKE 'Saipos%';

-- Atualizar descrições que mencionam Saipos
UPDATE public.programas_saipos 
SET descricao = REPLACE(descricao, 'Saipos', 'Domínio')
WHERE descricao LIKE '%Saipos%';