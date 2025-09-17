-- =====================================================
-- ADICIONAR COLUNA FORMA_PAGAMENTO À TABELA PEDIDOS
-- =====================================================

-- 1. ADICIONAR COLUNA FORMA_PAGAMENTO
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(50);

-- 2. VERIFICAR SE A COLUNA FOI ADICIONADA
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
AND column_name = 'forma_pagamento';

-- 3. ATUALIZAR PEDIDOS EXISTENTES COM VALOR PADRÃO (OPCIONAL)
-- UPDATE pedidos SET forma_pagamento = 'Não informado' WHERE forma_pagamento IS NULL;

-- 4. VERIFICAR ESTRUTURA ATUALIZADA
SELECT 
    'Coluna forma_pagamento adicionada com sucesso!' as status,
    'Agora você pode atualizar a função WhatsApp para incluir forma de pagamento' as proximo_passo;
