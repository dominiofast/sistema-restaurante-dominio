-- 🔍 DEBUG EXTREMO: Investigar dados sendo enviados

-- Remover política atual
DROP POLICY IF EXISTS "Simple public insert - only company_id required" ON public.customer_addresses;

-- Política COMPLETAMENTE SEM VALIDAÇÃO para capturar dados
CREATE POLICY "Zero validation debug policy"
ON public.customer_addresses
FOR INSERT 
TO anon
WITH CHECK (true);

-- Criar função para capturar tentativas de inserção
CREATE OR REPLACE FUNCTION public.debug_customer_address_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Log todos os dados sendo inseridos
    RAISE NOTICE '🔍 DEBUG INSERT customer_addresses:';
    RAISE NOTICE '  - id: %', NEW.id;
    RAISE NOTICE '  - company_id: % (type: %)', NEW.company_id, pg_typeof(NEW.company_id);
    RAISE NOTICE '  - customer_name: %', NEW.customer_name;
    RAISE NOTICE '  - customer_phone: %', NEW.customer_phone;
    RAISE NOTICE '  - logradouro: %', NEW.logradouro;
    RAISE NOTICE '  - numero: %', NEW.numero;
    RAISE NOTICE '  - cidade: %', NEW.cidade;
    RAISE NOTICE '  - cep: %', NEW.cep;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para debug
CREATE TRIGGER debug_customer_address_trigger
    BEFORE INSERT ON public.customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.debug_customer_address_insert();

DO $$
BEGIN
    RAISE NOTICE '🔍 DEBUG MÁXIMO ATIVADO:';
    RAISE NOTICE '✅ Política: Sem validações (true)';
    RAISE NOTICE '✅ Trigger: Capturar todos os dados enviados';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 TESTE: Salvar endereço agora';
    RAISE NOTICE '📋 Vou ver exatamente que dados estão sendo enviados';
    RAISE NOTICE '📋 Trigger vai mostrar nos logs do Supabase';
END $$;