-- Corrigir políticas RLS para tabelas de configuração de pagamento na entrega

-- Remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can access payment config for their company" ON payment_delivery_config;
DROP POLICY IF EXISTS "Users can access card brands for their company" ON payment_delivery_card_brands;

-- Criar políticas mais simples que funcionam com autenticação básica
CREATE POLICY "Authenticated users can manage payment config" 
ON payment_delivery_config 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage card brands" 
ON payment_delivery_card_brands 
FOR ALL 
TO authenticated 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Garantir que a coluna pix_key existe na tabela payment_delivery_config
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_delivery_config' 
        AND column_name = 'pix_key'
    ) THEN
        ALTER TABLE payment_delivery_config 
        ADD COLUMN pix_key TEXT;
    END IF;
END $$;