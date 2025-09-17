-- Descrição: Adiciona a coluna 'curriculo_nome' na tabela 'rh_inscricoes'.
-- Esta coluna estava sendo enviada pelo formulário de candidatura, mas não existia no banco de dados,
-- causando uma falha silenciosa na inserção.

ALTER TABLE public.rh_inscricoes
ADD COLUMN curriculo_nome TEXT;
