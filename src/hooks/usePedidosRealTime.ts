import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ItemPedido {
  id?: string; // ID do item no banco para controle de status individual
  nome: string;
  qtd: number;
  valor: number;
  observacoes?: string;
  adicionais?: Array<{
    nome: string;
    qtd?: number;
    valor: number;
    categoria?: string;
  }>;


export interface PedidoKDS {
  id: number;
  numero: string;
  numero_pedido?: number;
  nome: string;
  telefone: string;
  tempo: number;
  status: string;
  tipo: string;
  total: number;
  pagamento: string;
  endereco?: string;
  created_at: string;
  itens: ItemPedido[];
  observacoes?: string;
  fonte?: string;


export const usePedidosRealTime = () => {
  const { currentCompany } = useAuth()
  const [pedidos, setPedidos] = useState<PedidoKDS[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('🚀 usePedidosRealTime: Hook iniciado via API Neon')
  console.log('🏢 usePedidosRealTime: currentCompany:', currentCompany)
  console.log('🏢 usePedidosRealTime: currentCompany.id:', currentCompany?.id)

  // Função para calcular tempo decorrido
  const calculateElapsedTime = (createdAt: string): number => {
    const now = new Date()
    const created = new Date(createdAt)
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60)) // em minutos
  };

  // Função para buscar itens reais do pedido com adicionais via API
  const fetchPedidoItens = async (pedidoId: number): Promise<ItemPedido[]> => {
    try {
      console.log('🔍 Buscando itens do pedido via API:', pedidoId)
      
      // Para simplicidade inicial, retornar item genérico
      // TODO: Implementar API de pedido_itens quando necessário
      return [{
        nome: `Pedido #${pedidoId} catch (error) { console.error('Error:', error) }`,
        qtd: 1,
        valor: 0,
        observacoes: undefined,
        adicionais: []
      }];
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar itens via API:', error)
      return [{
        nome: `Pedido #${pedidoId} (erro ao carregar itens)`,
        qtd: 1,
        valor: 0,
        observacoes: 'Erro ao carregar detalhes',
        adicionais: []
      }];

  };

  // Função para converter dados do banco para formato KDS
  const convertToKDSFormat = async (pedidoDB: any): Promise<PedidoKDS> => {
    console.log('🔄 KDS: Convertendo pedido para formato KDS via API:', pedidoDB)
    
    const itens = await fetchPedidoItens(pedidoDB.id)
    
    const pedidoKDS: PedidoKDS = {
      id: pedidoDB.id,
      numero: `#${pedidoDB.numero_pedido || pedidoDB.id}`,
      numero_pedido: pedidoDB.numero_pedido,
      nome: pedidoDB.customer_name || 'Cliente',
      telefone: pedidoDB.customer_phone || '',
      tempo: calculateElapsedTime(pedidoDB.created_at),
      status: pedidoDB.status || 'pendente',
      tipo: pedidoDB.delivery_method === 'delivery' ? 'DELIVERY' : 
            pedidoDB.delivery_method === 'takeaway' ? 'RETIRADA' : 'BALCÃO',
      total: parseFloat(pedidoDB.total_amount || '0'),
      pagamento: pedidoDB.payment_method || 'dinheiro',
      endereco: pedidoDB.customer_address || undefined,
      created_at: pedidoDB.created_at,
      itens: itens,
      observacoes: pedidoDB.observation || undefined,
      fonte: pedidoDB.delivery_method === 'delivery' ? 'DELIVERY' : 
             pedidoDB.delivery_method === 'takeaway' ? 'RETIRADA' : 'PDV'
    };
    
    console.log('✅ KDS: Pedido convertido via API:', pedidoKDS)
    return pedidoKDS;
  };

  // Buscar pedidos iniciais via API Neon
  const fetchPedidos = async () => {
    if (!currentCompany?.id) {
      setPedidos([])
      setLoading(false)
      return;


    try {
      setLoading(true)
      setError(null)

      console.log('🔍 KDS: Buscando pedidos via API Neon para empresa:', currentCompany.id)

      // Buscar todos os pedidos primeiro para debugar
      const allResponse = await fetch(`/api/pedidos?company_id=${currentCompany.id} catch (error) { console.error('Error:', error) }`)
      const allResult = await allResponse.json()
      
      if (allResponse.ok && allResult.success) {
        console.log('🔍 KDS: TODOS OS PEDIDOS encontrados via API:', allResult.data?.length || 0)
        console.log('🔍 KDS: TODOS OS PEDIDOS - dados:', allResult.data)
      } else {
        throw new Error(allResult.error || 'Erro ao buscar pedidos')
      }
      
      // Agora filtrar por status (analise, producao, pronto)
      const activeStatuses = ['analise', 'producao', 'pronto'];
      const filteredPedidos = (allResult.data || []).filter((pedido: any) => 
        activeStatuses.includes(pedido.status)
      )
      
      console.log('🔍 KDS: Pedidos filtrados por status ativo:', filteredPedidos.length)
      console.log('🔍 KDS: Status filtrados:', activeStatuses)

      console.log('📋 KDS: Pedidos encontrados no banco via API:', filteredPedidos.length)

      const pedidosKDS = await Promise.all(
        filteredPedidos.map((pedido: any) => convertToKDSFormat(pedido))
      )
      
      setPedidos(pedidosKDS)
      
      console.log('🍽️ KDS: Pedidos processados e carregados via API:', pedidosKDS.length)
    } catch (err: any) {
      console.error('❌ KDS: Erro ao carregar pedidos via API:', err)
      setError(err.message)
    } finally {
      setLoading(false)

  };

  // Configurar polling para simular real-time (removido Supabase)
  useEffect(() => {
    if (!currentCompany?.id) return;

    console.log('🔔 KDS: Configurando polling para empresa via API Neon:', currentCompany.id)
    
    fetchPedidos()

    // Polling para simular real-time
    const pollingInterval = setInterval(() => {
      console.log('🔄 KDS: Polling para atualizações...')
      fetchPedidos()
    }, 15000) // 15 segundos para KDS (mais frequente)

    return () => {
      console.log('🧹 KDS: Limpando polling interval')
      clearInterval(pollingInterval)
    };
  }, [currentCompany?.id])

  const updatePedidoStatus = async (pedidoId: number, novoStatus: string) => {
    console.log('🔄 KDS: Atualizando status do pedido via API:', pedidoId, '->', novoStatus)
    
    try {
      const response = await fetch('/api/pedidos', {
        method: 'PUT',;
        headers: { 'Content-Type': 'application/json' } catch (error) { console.error('Error:', error) },
        body: JSON.stringify({ 
          id: pedidoId, 
          status: novoStatus
        })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao atualizar pedido')
      }
      
      console.log('✅ KDS: Status atualizado via API com sucesso')
      
      // Atualização otimista do estado local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, status: novoStatus, updated_at: new Date().toISOString() } : p
      ))
      
    } catch (error: any) {
      console.error('❌ KDS: Erro ao atualizar status via API:', error)
      setError(error.message)

  };

  const marcarPronto = async (pedidoId: number) => {
    await updatePedidoStatus(pedidoId, 'pronto')
  };

  const iniciarProducao = async (pedidoId: number) => {
    await updatePedidoStatus(pedidoId, 'producao')
  };

  const cancelarPedido = async (pedidoId: number) => {
    await updatePedidoStatus(pedidoId, 'cancelado')
  };

  const entregarPedido = async (pedidoId: number) => {
    await updatePedidoStatus(pedidoId, 'entregue')
  };

  const rejeitarPedido = async (pedidoId: number) => {
    await updatePedidoStatus(pedidoId, 'rejeitado')
  };

  const aceitarPedido = async (pedidoId: number) => {
    await updatePedidoStatus(pedidoId, 'producao')
  };

  return {
    pedidos,
    loading,
    error,
    updatePedidoStatus,
    marcarPronto,
    iniciarProducao,
    cancelarPedido,
    entregarPedido,
    rejeitarPedido,
    aceitarPedido,
    fetchPedidos // Expor para recarregamento manual
  };
};
