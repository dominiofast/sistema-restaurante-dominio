-- Criar função para automaticamente criar branding padrão para novas empresas
CREATE OR REPLACE FUNCTION public.create_default_branding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Inserir configuração de branding padrão para a nova empresa
    INSERT INTO public.cardapio_branding (
        company_id,
        show_logo,
        show_banner,
        primary_color,
        secondary_color,
        accent_color,
        text_color,
        background_color,
        header_style,
        is_active
    ) VALUES (
        NEW.id,
        true,                    -- show_logo
        true,                    -- show_banner  
        '#3B82F6',              -- primary_color (azul)
        '#1E40AF',              -- secondary_color (azul escuro)
        '#F59E0B',              -- accent_color (laranja)
        '#1F2937',              -- text_color (cinza escuro)
        '#FFFFFF',              -- background_color (branco)
        'modern',               -- header_style
        true                    -- is_active
    );
    
    -- Criar métodos de entrega padrão
    INSERT INTO public.delivery_methods (
        company_id,
        delivery,
        pickup,
        eat_in
    ) VALUES (
        NEW.id,
        true,   -- delivery habilitado
        true,   -- pickup habilitado  
        false   -- eat_in desabilitado por padrão
    );
    
    -- Criar configuração de pagamento padrão
    INSERT INTO public.payment_delivery_config (
        company_id,
        accept_cash,
        accept_pix,
        accept_card,
        ask_card_brand
    ) VALUES (
        NEW.id,
        true,   -- aceita dinheiro
        true,   -- aceita pix
        true,   -- aceita cartão
        true    -- pergunta bandeira do cartão
    );
    
    RETURN NEW;
END;
$$;

-- Criar trigger que executa a função após inserir nova empresa
DROP TRIGGER IF EXISTS create_default_branding_trigger ON companies;
CREATE TRIGGER create_default_branding_trigger
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_branding();

-- Criar branding padrão para empresas existentes que não têm
INSERT INTO public.cardapio_branding (
    company_id,
    show_logo,
    show_banner,
    primary_color,
    secondary_color,
    accent_color,
    text_color,
    background_color,
    header_style,
    is_active
)
SELECT 
    c.id,
    true,                    -- show_logo
    true,                    -- show_banner  
    '#3B82F6',              -- primary_color (azul)
    '#1E40AF',              -- secondary_color (azul escuro)
    '#F59E0B',              -- accent_color (laranja)
    '#1F2937',              -- text_color (cinza escuro)
    '#FFFFFF',              -- background_color (branco)
    'modern',               -- header_style
    true                    -- is_active
FROM companies c
WHERE c.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM cardapio_branding cb 
    WHERE cb.company_id = c.id AND cb.is_active = true
);

-- Criar métodos de entrega para empresas existentes sem configuração
INSERT INTO public.delivery_methods (
    company_id,
    delivery,
    pickup,
    eat_in
)
SELECT 
    c.id,
    true,   -- delivery habilitado
    true,   -- pickup habilitado  
    false   -- eat_in desabilitado por padrão
FROM companies c
WHERE c.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM delivery_methods dm 
    WHERE dm.company_id = c.id
);

-- Criar configuração de pagamento para empresas existentes sem configuração
INSERT INTO public.payment_delivery_config (
    company_id,
    accept_cash,
    accept_pix,
    accept_card,
    ask_card_brand
)
SELECT 
    c.id,
    true,   -- aceita dinheiro
    true,   -- aceita pix
    true,   -- aceita cartão
    true    -- pergunta bandeira do cartão
FROM companies c
WHERE c.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM payment_delivery_config pdc 
    WHERE pdc.company_id = c.id
);

-- Verificar o resultado
SELECT 
    c.name as empresa,
    CASE WHEN cb.id IS NOT NULL THEN 'Configurado' ELSE 'Sem branding' END as branding_status,
    CASE WHEN dm.id IS NOT NULL THEN 'Configurado' ELSE 'Sem entrega' END as delivery_status,
    CASE WHEN pdc.id IS NOT NULL THEN 'Configurado' ELSE 'Sem pagamento' END as payment_status
FROM companies c
LEFT JOIN cardapio_branding cb ON c.id = cb.company_id AND cb.is_active = true
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
LEFT JOIN payment_delivery_config pdc ON c.id = pdc.company_id
WHERE c.status = 'active'
ORDER BY c.name;