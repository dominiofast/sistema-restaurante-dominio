-- Criar configuração padrão de autoatendimento para a empresa Domínio Pizzas
INSERT INTO autoatendimento_config (
    company_id,
    is_enabled,
    session_timeout_minutes,
    welcome_message,
    show_preparation_time,
    require_customer_data,
    allow_cash_payment,
    allow_card_payment,
    allow_pix_payment,
    kiosk_mode,
    auto_print_orders
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    true,
    10,
    'Bem-vindo! Faça seu pedido de forma rápida e fácil.',
    true,
    true,
    true,
    true,
    true,
    true,
    true
)
ON CONFLICT (company_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    session_timeout_minutes = EXCLUDED.session_timeout_minutes,
    welcome_message = EXCLUDED.welcome_message,
    show_preparation_time = EXCLUDED.show_preparation_time,
    require_customer_data = EXCLUDED.require_customer_data,
    allow_cash_payment = EXCLUDED.allow_cash_payment,
    allow_card_payment = EXCLUDED.allow_card_payment,
    allow_pix_payment = EXCLUDED.allow_pix_payment,
    kiosk_mode = EXCLUDED.kiosk_mode,
    auto_print_orders = EXCLUDED.auto_print_orders,
    updated_at = now();