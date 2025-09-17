-- ========================================
-- CRIAR CONFIRMAÇÃO LIMPA NO FORMATO SOLICITADO
-- ========================================

-- FUNÇÃO PARA ENVIAR CONFIRMAÇÃO NO FORMATO LIMPO
CREATE OR REPLACE FUNCTION enviar_confirmacao_formatada()
RETURNS TRIGGER AS $$
DECLARE
    msg TEXT := '';
    itens_texto TEXT := '';
    item RECORD;
    adicional RECORD;
    whatsapp_config RECORD;
    taxa_entrega DECIMAL := 0;
BEGIN
    -- Buscar configuração WhatsApp
    SELECT * INTO whatsapp_config 
    FROM whatsapp_integrations 
    WHERE company_id = NEW.company_id AND is_active = true
    LIMIT 1;
    
    -- Se não tem WhatsApp configurado, sair
    IF whatsapp_config IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar taxa de entrega
    SELECT COALESCE(valor_total, 0) INTO taxa_entrega
    FROM pedido_itens 
    WHERE pedido_id = NEW.id 
    AND (nome_produto ILIKE '%taxa%' OR nome_produto ILIKE '%entrega%')
    LIMIT 1;
    
    -- Processar itens principais (sem taxa de entrega)
    FOR item IN
        SELECT pi.id, pi.nome_produto, pi.quantidade, pi.observacoes
        FROM pedido_itens pi
        WHERE pi.pedido_id = NEW.id
        AND NOT (pi.nome_produto ILIKE '%taxa%' OR pi.nome_produto ILIKE '%entrega%')
        ORDER BY pi.created_at
    LOOP
        -- Nome do item
        itens_texto := itens_texto || '➡ ' || item.quantidade || 'x ' || item.nome_produto || E'\n';
        
        -- ADICIONAIS ORGANIZADOS POR CATEGORIA
        DECLARE
            sabores_encontrados TEXT := '';
            bordas_encontradas TEXT := '';
            outros_encontrados TEXT := '';
            condimentos_encontrados TEXT := '';
        BEGIN
            -- 1. SABORES DE PIZZAS
            FOR adicional IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id
                AND (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                     OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%'
                     OR nome_adicional ILIKE '%presunto%' OR nome_adicional ILIKE '%atum%'
                     OR nome_adicional ILIKE '%mussarela%' OR nome_adicional ILIKE '%carne%'
                     OR nome_adicional ILIKE '%portuguesa%' OR nome_adicional ILIKE '%margherita%')
                ORDER BY nome_adicional
            LOOP
                sabores_encontrados := sabores_encontrados || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || E'\n';
            END LOOP;
            
            IF sabores_encontrados != '' THEN
                itens_texto := itens_texto || '      Sabores Pizzas' || E'\n' || sabores_encontrados;
            END IF;
            
            -- 2. MASSAS E BORDAS
            FOR adicional IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id
                AND (nome_adicional ILIKE '%borda%' OR nome_adicional ILIKE '%massa%')
                ORDER BY nome_adicional
            LOOP
                bordas_encontradas := bordas_encontradas || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || E'\n';
            END LOOP;
            
            IF bordas_encontradas != '' THEN
                itens_texto := itens_texto || '      Massas e Bordas' || E'\n' || bordas_encontradas;
            END IF;
            
            -- 3. OUTROS ADICIONAIS (que não são sabores nem bordas nem condimentos)
            FOR adicional IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id
                AND NOT (nome_adicional ILIKE '%queijo%' OR nome_adicional ILIKE '%calabresa%' 
                         OR nome_adicional ILIKE '%frango%' OR nome_adicional ILIKE '%bacon%'
                         OR nome_adicional ILIKE '%presunto%' OR nome_adicional ILIKE '%atum%'
                         OR nome_adicional ILIKE '%mussarela%' OR nome_adicional ILIKE '%carne%'
                         OR nome_adicional ILIKE '%portuguesa%' OR nome_adicional ILIKE '%margherita%')
                AND NOT (nome_adicional ILIKE '%borda%' OR nome_adicional ILIKE '%massa%')
                AND NOT (nome_adicional ILIKE '%ketchup%' OR nome_adicional ILIKE '%maionese%' 
                         OR nome_adicional ILIKE '%não enviar%' OR nome_adicional ILIKE '%molho%')
                ORDER BY nome_adicional
            LOOP
                outros_encontrados := outros_encontrados || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || ' - adicional' || E'\n';
            END LOOP;
            
            IF outros_encontrados != '' THEN
                itens_texto := itens_texto || '      Adicionais:' || E'\n' || outros_encontrados;
            END IF;
            
            -- 4. CONDIMENTOS E OBSERVAÇÕES ESPECIAIS
            FOR adicional IN
                SELECT nome_adicional, quantidade
                FROM pedido_item_adicionais
                WHERE pedido_item_id = item.id
                AND (nome_adicional ILIKE '%ketchup%' OR nome_adicional ILIKE '%maionese%' 
                     OR nome_adicional ILIKE '%não enviar%' OR nome_adicional ILIKE '%molho%')
                ORDER BY nome_adicional
            LOOP
                condimentos_encontrados := condimentos_encontrados || '          ' || adicional.quantidade || 'x ' || adicional.nome_adicional || E'\n';
            END LOOP;
            
            IF condimentos_encontrados != '' THEN
                itens_texto := itens_texto || '      Deseja ketchup, maionese?' || E'\n' || condimentos_encontrados;
            END IF;
        END;
        
        -- Observações do item
        IF item.observacoes IS NOT NULL AND item.observacoes != '' THEN
            itens_texto := itens_texto || '      Obs: ' || item.observacoes || E'\n';
        END IF;
        
        -- Espaço entre itens
        itens_texto := itens_texto || E'\n';
    END LOOP;
    
    -- MONTAR MENSAGEM FINAL NO FORMATO SOLICITADO
    msg := '*Pedido nº ' || COALESCE(NEW.numero_pedido, NEW.id) || '*' || E'\n\n' ||
           '*Itens:*' || E'\n' ||
           itens_texto;
    
    -- PAGAMENTO
    IF NEW.pagamento ILIKE '%dinheiro%' THEN
        IF NEW.pagamento ILIKE '%troco%' THEN
            msg := msg || '💵 ' || NEW.pagamento || E'\n\n';
        ELSE
            msg := msg || '💵 Dinheiro (não precisa de troco)' || E'\n\n';
        END IF;
    ELSIF NEW.pagamento ILIKE '%cartao%' OR NEW.pagamento ILIKE '%cartão%' THEN
        msg := msg || '💳 Cartão' || E'\n\n';
    ELSIF NEW.pagamento ILIKE '%pix%' THEN
        msg := msg || '📱 PIX' || E'\n\n';
    ELSE
        msg := msg || '💳 ' || NEW.pagamento || E'\n\n';
    END IF;
    
    -- ENTREGA
    IF NEW.tipo = 'delivery' THEN
        msg := msg || '🛵 Delivery';
        IF taxa_entrega > 0 THEN
            msg := msg || ' (taxa de: R$ ' || REPLACE(taxa_entrega::text, '.', ',') || ')';
        END IF;
        msg := msg || E'\n';
        
        IF NEW.endereco IS NOT NULL THEN
            msg := msg || '🏠 ' || NEW.endereco || E'\n';
        END IF;
        
        msg := msg || '(Estimativa: entre 25~35 minutos)' || E'\n\n';
    ELSE
        msg := msg || '🏪 Retirada no balcão' || E'\n' ||
               '(Estimativa: entre 20~30 minutos)' || E'\n\n';
    END IF;
    
    -- TOTAL
    msg := msg || '*Total: R$ ' || REPLACE(NEW.total::text, '.', ',') || '*' || E'\n\n' ||
           'Obrigado pela preferência, se precisar de algo é só chamar! 😊';
    
    -- ENVIAR WHATSAPP
    BEGIN
        PERFORM http_post(
            'https://apinocode01.megaapi.com.br/rest/sendMessage/' || whatsapp_config.instance_key || '/text',
            json_build_object(
                'messageData', json_build_object(
                    'to', NEW.telefone,
                    'text', msg
                )
            )::text,
            'application/json',
            ARRAY[
                http_header('Authorization', 'Bearer ' || whatsapp_config.token),
                http_header('Content-Type', 'application/json')
            ]
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Log erro mas não quebrar
            RAISE WARNING 'Erro WhatsApp: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CRIAR TRIGGER NA MUDANÇA DE STATUS PARA CONFIRMADO
CREATE TRIGGER trigger_confirmacao_limpa_final
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmado')
    EXECUTE FUNCTION enviar_confirmacao_formatada();

-- VERIFICAR RESULTADO FINAL
SELECT 'NOVO TRIGGER CRIADO:' as status;
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'pedidos' 
AND trigger_name = 'trigger_confirmacao_limpa_final';
```

## **🎯 EXECUTE ESSE SQL ACIMA:**

1. **Cole** no SQL Editor
2. **Execute**
3. **Teste** um pedido confirmando o status
4. **Deve chegar** confirmação no formato limpo!

**Agora vai funcionar com o formato que você pediu!** 🚀
