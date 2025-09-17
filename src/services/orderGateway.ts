/**
 * 🎯 ORDER GATEWAY - SOLUÇÃO DEFINITIVA
 * 
 * Centraliza TODAS as criações de pedidos através do endpoint /api/orders
 * que usa SERVICE ROLE - SEM MAIS ERROS 401/42501!
 */

// Tipo interno do OrderGateway
interface PedidoData {
  companyId: string;
  cliente: {
    nome: string;
    telefone?: string;
  };
  endereco?: string;
  itens: any[];
  total: number;
  forma_pagamento?: string;
  tipo?: string;
  observacoes?: string | null;
}

interface OrderResponse {
  success: boolean;
  pedido: {
    id: string;
    numero_pedido: number;
    status: string;
    total: number;
  };
  itens_salvos: number;
  total_itens: number;
  error?: string;
  details?: string;
}

/**
 * 🚀 FUNÇÃO PRINCIPAL - Cria pedido com garantia de salvar itens
 */
export async function createOrder(pedidoData: PedidoData): Promise<OrderResponse> {
  console.log('🚀 OrderGateway - Criando pedido via endpoint seguro');
  console.log('📦 Dados:', {
    companyId: pedidoData.companyId,
    cliente: pedidoData.cliente?.nome,
    itens: pedidoData.itens?.length || 0,
    total: pedidoData.total
  });

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro na resposta do servidor:', result);
      throw new Error(result.error || `Erro HTTP: ${response.status}`);
    }

    console.log('✅ OrderGateway - Pedido criado com sucesso:', {
      pedido_id: result.pedido?.id,
      numero: result.pedido?.numero_pedido,
      itens_salvos: result.itens_salvos,
      total_itens: result.total_itens
    });

    return result;

  } catch (error) {
    console.error('💥 OrderGateway - Erro ao criar pedido:', error);
    
    // Retorna erro estruturado
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      pedido: {
        id: '',
        numero_pedido: 0,
        status: 'error',
        total: 0
      },
      itens_salvos: 0,
      total_itens: 0
    };
  }
}

/**
 * 🔄 FUNÇÃO DE MIGRAÇÃO - Para substituir chamadas antigas
 * Use esta para substituir rapidamente qualquer createOrder existente
 */
export const criarPedidoViaGateway = createOrder;

/**
 * 🛡️ FUNÇÃO WRAPPER - Para compatibilidade com código legado
 * Detecta e converte diferentes formatos de entrada
 */
export async function createOrderLegacyCompat(data: any): Promise<OrderResponse> {
  console.log('🔄 OrderGateway - Convertendo dados legados');
  
  // Normaliza dados de diferentes origens
  const normalizedData: PedidoData = {
    companyId: data.companyId || data.company_id,
    cliente: {
      nome: data.cliente?.nome || data.nome || data.customer_name || '',
      telefone: data.cliente?.telefone || data.telefone || data.phone || ''
    },
    endereco: data.endereco || data.address || '',
    itens: data.itens || data.items || [],
    total: data.total || 0,
    forma_pagamento: data.forma_pagamento || data.payment_method || 'dinheiro',
    tipo: data.tipo || data.type || 'delivery',
    observacoes: data.observacoes || data.notes || null
  };

  return createOrder(normalizedData);
}

export default {
  createOrder,
  criarPedidoViaGateway,
  createOrderLegacyCompat
};