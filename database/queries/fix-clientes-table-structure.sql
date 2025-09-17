-- ================================================
-- Fix clientes table structure - Add missing columns
-- ================================================

-- Add missing columns to clientes table
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS dias_sem_comprar INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_pedidos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS saldo DECIMAL(10,2) DEFAULT 0.00;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clientes_company_id ON public.clientes(company_id);
CREATE INDEX IF NOT EXISTS idx_clientes_data_nascimento ON public.clientes(data_nascimento);
CREATE INDEX IF NOT EXISTS idx_clientes_dias_sem_comprar ON public.clientes(dias_sem_comprar);
CREATE INDEX IF NOT EXISTS idx_clientes_total_pedidos ON public.clientes(total_pedidos);
CREATE INDEX IF NOT EXISTS idx_clientes_saldo ON public.clientes(saldo);

-- Create RLS policy for clientes table
DROP POLICY IF EXISTS "Users can only see their company's clients" ON public.clientes;
CREATE POLICY "Users can only see their company's clients" ON public.clientes
    FOR ALL USING (company_id = get_user_company_id());

-- Function to update client status by inactivity
CREATE OR REPLACE FUNCTION update_client_status_by_inactivity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update dias_sem_comprar for all clients
    UPDATE clientes 
    SET dias_sem_comprar = COALESCE(
        (
            SELECT EXTRACT(days FROM NOW() - MAX(p.created_at))::INTEGER
            FROM pedidos p 
            WHERE p.telefone = clientes.telefone 
            AND p.company_id = clientes.company_id
        ), 
        EXTRACT(days FROM NOW() - clientes.data_cadastro)::INTEGER
    );
    
    -- Update total_pedidos for all clients
    UPDATE clientes 
    SET total_pedidos = COALESCE(
        (
            SELECT COUNT(*)::INTEGER
            FROM pedidos p 
            WHERE p.telefone = clientes.telefone 
            AND p.company_id = clientes.company_id
        ), 
        0
    );
    
    -- Update status based on inactivity
    UPDATE clientes 
    SET status = CASE 
        WHEN dias_sem_comprar > 90 THEN 'inativo'
        WHEN total_pedidos = 0 THEN 'potencial'
        ELSE 'ativo'
    END;
    
    -- Update saldo from customer_cashback if exists
    UPDATE clientes 
    SET saldo = COALESCE(
        (
            SELECT cc.saldo_disponivel
            FROM customer_cashback cc 
            WHERE cc.customer_phone = clientes.telefone 
            AND cc.company_id = clientes.company_id
        ), 
        0.00
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_client_status_by_inactivity() TO authenticated;

-- Update existing clients with company_id from user's current company (if needed)
-- This is a one-time update for existing data
DO $$
DECLARE
    default_company_id UUID;
BEGIN
    -- Get the first active company as default (you may need to adjust this logic)
    SELECT id INTO default_company_id 
    FROM companies 
    WHERE status = 'active' 
    LIMIT 1;
    
    -- Update clients without company_id
    IF default_company_id IS NOT NULL THEN
        UPDATE clientes 
        SET company_id = default_company_id 
        WHERE company_id IS NULL;
    END IF;
END;
$$;

-- Run the update function once to populate the new fields
SELECT update_client_status_by_inactivity();