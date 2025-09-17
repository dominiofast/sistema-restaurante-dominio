-- Verificar se a coluna order_position existe na tabela produto_categorias_adicionais
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'produto_categorias_adicionais' 
        AND column_name = 'order_position'
    ) THEN
        -- Adicionar coluna order_position se não existir
        ALTER TABLE produto_categorias_adicionais 
        ADD COLUMN order_position INTEGER DEFAULT 0;
        
        -- Atualizar order_position baseado na ordem atual dos registros existentes
        WITH numbered_rows AS (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY produto_id ORDER BY created_at) as rn
            FROM produto_categorias_adicionais
        )
        UPDATE produto_categorias_adicionais 
        SET order_position = numbered_rows.rn
        FROM numbered_rows 
        WHERE produto_categorias_adicionais.id = numbered_rows.id;
    END IF;
END $$;