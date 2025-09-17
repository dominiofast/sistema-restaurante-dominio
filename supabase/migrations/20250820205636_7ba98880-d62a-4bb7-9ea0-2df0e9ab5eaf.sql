-- Resetar clientes apenas da empresa Domínio Pizzas
-- Primeiro verificamos o ID da empresa Domínio Pizzas
DO $$
DECLARE
    dominio_company_id UUID;
BEGIN
    -- Buscar ID da empresa Domínio Pizzas
    SELECT id INTO dominio_company_id 
    FROM companies 
    WHERE LOWER(name) LIKE '%dominio%' 
       OR LOWER(name) LIKE '%domínio%'
       OR LOWER(slug) LIKE '%dominio%'
    LIMIT 1;
    
    -- Se encontrou a empresa, deletar apenas seus clientes
    IF dominio_company_id IS NOT NULL THEN
        DELETE FROM clientes 
        WHERE company_id = dominio_company_id;
        
        -- Log da operação
        INSERT INTO ai_conversation_logs (
            company_id,
            customer_phone,
            customer_name,
            message_content,
            message_type,
            created_at
        ) VALUES (
            dominio_company_id,
            'SYSTEM',
            'ADMIN',
            'RESET CLIENTES: Todos os clientes da Domínio Pizzas foram removidos do sistema',
            'system_reset',
            now()
        );
        
        RAISE NOTICE 'Clientes da empresa Domínio Pizzas (ID: %) foram resetados', dominio_company_id;
    ELSE
        RAISE NOTICE 'Empresa Domínio Pizzas não encontrada';
    END IF;
END $$;