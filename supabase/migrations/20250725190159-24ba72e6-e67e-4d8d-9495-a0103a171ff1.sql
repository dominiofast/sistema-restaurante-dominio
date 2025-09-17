-- Migrar dados da tabela antiga agente_ia_config para a nova ai_agent_config
INSERT INTO public.ai_agent_config (
    company_id,
    agent_name,
    personality,
    language,
    welcome_message,
    away_message,
    goodbye_message,
    sales_phrases,
    response_speed,
    detail_level,
    sales_aggressiveness,
    working_hours,
    auto_suggestions,
    product_knowledge,
    promotion_knowledge,
    stock_knowledge,
    is_active,
    message_limit,
    order_reminders,
    data_collection,
    whatsapp_integration,
    manager_notifications
)
SELECT 
    company_id,
    nome as agent_name,
    personalidade as personality,
    idioma as language,
    mensagem_boas_vindas as welcome_message,
    mensagem_ausencia as away_message,
    mensagem_despedida as goodbye_message,
    frases_venda as sales_phrases,
    velocidade_resposta as response_speed,
    nivel_detalhamento as detail_level,
    agressividade_venda as sales_aggressiveness,
    horario_funcionamento as working_hours,
    auto_sugestoes as auto_suggestions,
    conhecimento_produtos as product_knowledge,
    conhecimento_promocoes as promotion_knowledge,
    conhecimento_estoque as stock_knowledge,
    ativo as is_active,
    limite_mensagens as message_limit,
    lembranca_pedidos as order_reminders,
    coleta_dados as data_collection,
    integracao_whatsapp as whatsapp_integration,
    notificacao_gerente as manager_notifications
FROM public.agente_ia_config
WHERE company_id NOT IN (
    SELECT company_id FROM public.ai_agent_config
);