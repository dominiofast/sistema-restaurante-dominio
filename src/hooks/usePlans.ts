import { useQuery } from '@tanstack/react-query';

export interface Plan {
  id: string;
  name: string;
  type: 'trial' | 'subscription';
  price_monthly: number;
  price_yearly: number;
  duration_days: number;
  description: string;
  badge: string | null;
  auto_renew: boolean;
  active: boolean;
  plan_features?: PlanFeature[];


export interface PlanFeature {
  feature_id: string;
  included: boolean;
  features: {
    id: string;
    name: string;
    description: string;
    category: string;
  };


// Mock data based on the database structure until types are updated
const mockPlansData: Plan[] = [
  {
    id: 'trial',
    name: 'Teste Grátis',
    type: 'trial',
    price_monthly: 0,
    price_yearly: 0,
    duration_days: 14,
    description: 'Experimente gratuitamente todas as funcionalidades do plano Start',
    badge: null,
    auto_renew: false,
    active: true,
    plan_features: [
      { feature_id: 'ai_bot_social_media', included: true, features: { id: 'ai_bot_social_media', name: 'Robô com IA para WhatsApp, Facebook e Instagram', description: '', category: 'ai' } },
      { feature_id: 'whatsapp_audio_support', included: true, features: { id: 'whatsapp_audio_support', name: 'Suporte a áudios do WhatsApp com nosso robô', description: '', category: 'ai' } },
      { feature_id: 'digital_menu', included: true, features: { id: 'digital_menu', name: 'Cardápio Digital', description: '', category: 'menu' } },
      { feature_id: 'pos_system', included: true, features: { id: 'pos_system', name: 'Pedidos em Balcão (PDV)', description: '', category: 'pos' } },
      { feature_id: 'qr_code_tables', included: true, features: { id: 'qr_code_tables', name: 'QR Code para mesas', description: '', category: 'menu' } },
      { feature_id: 'waiter_app', included: true, features: { id: 'waiter_app', name: 'Aplicativo para Garçom com Comanda Digital', description: '', category: 'pos' } },
      { feature_id: 'online_payment', included: true, features: { id: 'online_payment', name: 'Pagamento Online (Rápido e Seguro)', description: '', category: 'payment' } },
      { feature_id: '24_7_support', included: true, features: { id: '24_7_support', name: 'Suporte todos os dias, inclusive feriados e finais de semana', description: '', category: 'support' } },
      { feature_id: 'loyalty_program', included: true, features: { id: 'loyalty_program', name: 'Cupons, Cashback e Fidelização automatizada', description: '', category: 'marketing' } },
      { feature_id: 'sales_recovery', included: true, features: { id: 'sales_recovery', name: 'Recuperador de Vendas', description: '', category: 'marketing' } },
      { feature_id: 'order_scheduling', included: true, features: { id: 'order_scheduling', name: 'Agendamento de Pedidos', description: '', category: 'orders' } },
      { feature_id: 'delivery_management', included: true, features: { id: 'delivery_management', name: 'Cadastro de Entregadores', description: '', category: 'delivery' } },
      { feature_id: 'cashier_front', included: true, features: { id: 'cashier_front', name: 'Frente de Caixa', description: '', category: 'pos' } },
    ]
  },
  {
    id: 'start',
    name: 'Start',
    type: 'subscription',
    price_monthly: 279.99,
    price_yearly: 209.99,
    duration_days: 30,
    description: 'Para quem busca uma solução eficiente para gestão de pedidos e atendimento',
    badge: null,
    auto_renew: true,
    active: true,
    plan_features: [
      { feature_id: 'ai_bot_social_media', included: true, features: { id: 'ai_bot_social_media', name: 'Robô com IA para WhatsApp, Facebook e Instagram', description: '', category: 'ai' } },
      { feature_id: 'whatsapp_audio_support', included: true, features: { id: 'whatsapp_audio_support', name: 'Suporte a áudios do WhatsApp com nosso robô', description: '', category: 'ai' } },
      { feature_id: 'digital_menu', included: true, features: { id: 'digital_menu', name: 'Cardápio Digital', description: '', category: 'menu' } },
      { feature_id: 'pos_system', included: true, features: { id: 'pos_system', name: 'Pedidos em Balcão (PDV)', description: '', category: 'pos' } },
      { feature_id: 'qr_code_tables', included: true, features: { id: 'qr_code_tables', name: 'QR Code para mesas', description: '', category: 'menu' } },
      { feature_id: 'waiter_app', included: true, features: { id: 'waiter_app', name: 'Aplicativo para Garçom com Comanda Digital', description: '', category: 'pos' } },
      { feature_id: 'online_payment', included: true, features: { id: 'online_payment', name: 'Pagamento Online (Rápido e Seguro)', description: '', category: 'payment' } },
      { feature_id: '24_7_support', included: true, features: { id: '24_7_support', name: 'Suporte todos os dias, inclusive feriados e finais de semana', description: '', category: 'support' } },
      { feature_id: 'loyalty_program', included: true, features: { id: 'loyalty_program', name: 'Cupons, Cashback e Fidelização automatizada', description: '', category: 'marketing' } },
      { feature_id: 'sales_recovery', included: true, features: { id: 'sales_recovery', name: 'Recuperador de Vendas', description: '', category: 'marketing' } },
      { feature_id: 'order_scheduling', included: true, features: { id: 'order_scheduling', name: 'Agendamento de Pedidos', description: '', category: 'orders' } },
      { feature_id: 'delivery_management', included: true, features: { id: 'delivery_management', name: 'Cadastro de Entregadores', description: '', category: 'delivery' } },
      { feature_id: 'cashier_front', included: true, features: { id: 'cashier_front', name: 'Frente de Caixa', description: '', category: 'pos' } },
      { feature_id: 'kitchen_display_system', included: false, features: { id: 'kitchen_display_system', name: 'Display para pedidos de cozinha (KDS)', description: '', category: 'kitchen' } },
      { feature_id: 'ads_platform_integration', included: false, features: { id: 'ads_platform_integration', name: 'Integração com plataformas de anúncios', description: '', category: 'marketing' } },
      { feature_id: 'inventory_management', included: false, features: { id: 'inventory_management', name: 'Gestor de Estoque', description: '', category: 'inventory' } },
      { feature_id: 'automated_invoice', included: false, features: { id: 'automated_invoice', name: 'NF Automatizada', description: '', category: 'fiscal' } },
    ]
  },
  {
    id: 'advanced',
    name: 'Gestão Avançada',
    type: 'subscription',
    price_monthly: 399.99,
    price_yearly: 299.99,
    duration_days: 30,
    description: 'Para quem precisa de uma gestão completa e integrada do estabelecimento',
    badge: 'Mais Popular',
    auto_renew: true,
    active: true,
    plan_features: [
      { feature_id: 'ai_bot_social_media', included: true, features: { id: 'ai_bot_social_media', name: 'Robô com IA para WhatsApp, Facebook e Instagram', description: '', category: 'ai' } },
      { feature_id: 'whatsapp_audio_support', included: true, features: { id: 'whatsapp_audio_support', name: 'Suporte a áudios do WhatsApp com nosso robô', description: '', category: 'ai' } },
      { feature_id: 'digital_menu', included: true, features: { id: 'digital_menu', name: 'Cardápio Digital', description: '', category: 'menu' } },
      { feature_id: 'pos_system', included: true, features: { id: 'pos_system', name: 'Pedidos em Balcão (PDV)', description: '', category: 'pos' } },
      { feature_id: 'qr_code_tables', included: true, features: { id: 'qr_code_tables', name: 'QR Code para mesas', description: '', category: 'menu' } },
      { feature_id: 'waiter_app', included: true, features: { id: 'waiter_app', name: 'Aplicativo para Garçom com Comanda Digital', description: '', category: 'pos' } },
      { feature_id: 'online_payment', included: true, features: { id: 'online_payment', name: 'Pagamento Online (Rápido e Seguro)', description: '', category: 'payment' } },
      { feature_id: '24_7_support', included: true, features: { id: '24_7_support', name: 'Suporte todos os dias, inclusive feriados e finais de semana', description: '', category: 'support' } },
      { feature_id: 'loyalty_program', included: true, features: { id: 'loyalty_program', name: 'Cupons, Cashback e Fidelização automatizada', description: '', category: 'marketing' } },
      { feature_id: 'sales_recovery', included: true, features: { id: 'sales_recovery', name: 'Recuperador de Vendas', description: '', category: 'marketing' } },
      { feature_id: 'order_scheduling', included: true, features: { id: 'order_scheduling', name: 'Agendamento de Pedidos', description: '', category: 'orders' } },
      { feature_id: 'delivery_management', included: true, features: { id: 'delivery_management', name: 'Cadastro de Entregadores', description: '', category: 'delivery' } },
      { feature_id: 'cashier_front', included: true, features: { id: 'cashier_front', name: 'Frente de Caixa', description: '', category: 'pos' } },
      { feature_id: 'kitchen_display_system', included: true, features: { id: 'kitchen_display_system', name: 'Display para pedidos de cozinha (KDS)', description: '', category: 'kitchen' } },
      { feature_id: 'ads_platform_integration', included: true, features: { id: 'ads_platform_integration', name: 'Integração com plataformas de anúncios', description: '', category: 'marketing' } },
      { feature_id: 'inventory_management', included: true, features: { id: 'inventory_management', name: 'Gestor de Estoque', description: '', category: 'inventory' } },
      { feature_id: 'automated_invoice', included: true, features: { id: 'automated_invoice', name: 'NF Automatizada', description: '', category: 'fiscal' } },
      { feature_id: 'advanced_reports', included: true, features: { id: 'advanced_reports', name: 'Relatórios avançados', description: '', category: 'reports' } },
      { feature_id: 'priority_support', included: true, features: { id: 'priority_support', name: 'Suporte prioritário', description: '', category: 'support' } },
      { feature_id: 'dedicated_training', included: true, features: { id: 'dedicated_training', name: 'Treinamento dedicado', description: '', category: 'support' } },
    ]

];

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      // Return mock data for now until database types are synced;
      return mockPlansData;
    },
  })
};
