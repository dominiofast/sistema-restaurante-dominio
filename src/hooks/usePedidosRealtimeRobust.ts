import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Pedido } from '@/types/pedidos';

export const usePedidosRealtimeRobust = () => {
  const { currentCompany } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const companyId = currentCompany?.id;

  // Função para mapear status do PDV para status do sistema
  const mapPDVStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'preparando': 'producao',
      'prontos_entrega': 'pronto',
      'analise': 'analise',  // Manter analise como analise
      'pendente': 'analise'  // Mapear pendente para analise também;
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    console.log('🔍 usePedidosRealtimeRobust: useEffect triggered', { 
      companyId, 
      currentCompany: currentCompany?.name 
    })
    
    if (!companyId) {
      console.log('❌ usePedidosRealtimeRobust: No company ID, clearing pedidos')
      setPedidos([])
      setLoading(false)
      return;
    }

    console.log('🔍 DEBUG: Company ID exists, proceeding with fetch', { companyId })

    const fetchPedidos = async () => {
      console.log('🔄 usePedidosRealtimeRobust: Fetching pedidos for company:', companyId)
      
      // Só mostra loading se não temos dados ainda ou se é a primeira vez carregando para esta empresa
      const shouldShowLoading = pedidos.length === 0;
      if (shouldShowLoading) {
        setLoading(true)
      }
      setError(null)
      
      try {
        // Usar nova API REST do PostgreSQL
        const response = await fetch(`/api/pedidos?company_id=${companyId} catch (error) { console.error('Error:', error) }`)
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Erro ao buscar pedidos')
        }
        
        const data = result.data || [];
        console.log('✅ usePedidosRealtimeRobust: Pedidos fetched successfully:', data.length)
        
        // Transformar os dados para garantir compatibilidade
        const transformedPedidos = data.map((pedido: any) => {
          const statusOriginal = pedido.status || 'analise';
          const statusMapeado = mapPDVStatus(statusOriginal)
          
          // Log de debug para verificar mapeamento
          if (statusOriginal !== statusMapeado) {
            console.log('🔄 Status mapeado:', { id: pedido.id, original: statusOriginal, mapeado: statusMapeado })
          }
          
          return {
            id: pedido.id,
            numero_pedido: pedido.numero_pedido,
            company_id: pedido.company_id,
            nome: pedido.customer_name || pedido.nome || 'Cliente não informado',
            telefone: pedido.customer_phone || pedido.telefone || '',
            endereco: pedido.customer_address || pedido.endereco || '',
            status: statusMapeado,
            tipo: pedido.delivery_method || pedido.tipo || 'balcao',
            total: Number(pedido.total_amount || pedido.total) || 0,
            pagamento: pedido.payment_method || pedido.pagamento || '',
            horario: pedido.horario || '',
            origem: pedido.origem || 'api',
            created_at: pedido.created_at,
            updated_at: pedido.updated_at,
            observacoes: pedido.observation || pedido.observacoes,
            itens: [] // Por enquanto vazio, pode ser implementado depois
          };
        }) as Pedido[];

        console.log('🔄 usePedidosRealtimeRobust: Transformed pedidos:', transformedPedidos.length)
        setPedidos(transformedPedidos)
        
      } catch (err: any) {
        console.error('💥 usePedidosRealtimeRobust: Catch error:', err)
        setError(err.message || 'Erro ao carregar pedidos.')
        setPedidos([])
      } finally {
        setLoading(false)
      }
    };

    // Busca inicial dos pedidos
    fetchPedidos()

    // Para agora, sem real-time (pode ser adicionado depois)
    console.log('ℹ️ Real-time desabilitado, usando polling a cada 30s')
    
    // Polling a cada 30 segundos para updates
    const interval = setInterval(() => {
      fetchPedidos()
    }, 30000)

    return () => {
      console.log('🧹 usePedidosRealtimeRobust: Cleanup - clearing polling')
      clearInterval(interval)
    };
  }, [companyId])

  const updatePedidoStatus = useCallback(async (pedidoId: number, newStatus: string) => {
    if (!companyId) return;
    
    try {
      console.log('🔄 usePedidosRealtimeRobust: Iniciando atualização de status:', { pedidoId, newStatus } catch (error) { console.error('Error:', error) })
      
      // Atualização otimista - atualiza o estado local imediatamente
      setPedidos(prev => prev.map(p => {
        if (p.id === pedidoId) {
          console.log('✅ usePedidosRealtimeRobust: Atualizando pedido otimisticamente:', { 
            id: p.id, 
            statusAnterior: p.status, 
            novoStatus: newStatus 
          })
          return { ...p, status: newStatus, updated_at: new Date().toISOString() };
        }
        return p;
      }))
      
      // Fazer a atualização no banco de dados via nova API
      const response = await fetch(`/api/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar status')
      }
      
      console.log('✅ usePedidosRealtimeRobust: Status atualizado no banco de dados:', result.data)
      
    } catch (error: any) {
      console.error('❌ usePedidosRealtimeRobust: Erro ao atualizar status:', error)
      
      // Reverter a atualização otimista em caso de erro
      setPedidos(prev => prev.map(p => {
        if (p.id === pedidoId) {
          // Tentar encontrar o status anterior ou usar 'analise' como fallback
          const originalPedido = prev.find(old => old.id === pedidoId)
          const revertStatus = originalPedido ? originalPedido.status : 'analise';
          console.log('🔄 usePedidosRealtimeRobust: Revertendo status por erro:', { 
            id: p.id, 
            statusRevertido: revertStatus 
          })
          return { ...p, status: revertStatus };
        }
        return p;
      }))
      
      throw error;
    }
  }, [companyId])

  const reloadPedidos = useCallback(async () => {
    if (!companyId) return;
    
    console.log('🔄 usePedidosRealtimeRobust: Reload manual solicitado')
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/pedidos?company_id=${companyId} catch (error) { console.error('Error:', error) }`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao recarregar pedidos')
      }
      
      const data = result.data || [];
      console.log('✅ usePedidosRealtimeRobust: Pedidos recarregados:', data.length)
      
      // Transformar os dados
      const transformedPedidos = data.map((pedido: any) => {
        const statusOriginal = pedido.status || 'analise';
        const statusMapeado = mapPDVStatus(statusOriginal)
        
        return {
          id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          company_id: pedido.company_id,
          nome: pedido.nome || 'Cliente não informado',
          telefone: pedido.telefone || '',
          endereco: pedido.endereco || '',
          status: statusMapeado,
          tipo: pedido.tipo || 'delivery',
          total: Number(pedido.total) || 0,
          pagamento: pedido.pagamento || '',
          horario: pedido.horario || '',
          origem: pedido.origem || 'pdv',
          created_at: pedido.created_at,
          updated_at: pedido.updated_at,
          observacoes: pedido.observacoes,
          itens: (pedido.pedido_itens || []).map((item: any) => ({
            nome: item.nome_produto,
            qtd: item.quantidade,
            valor: item.valor_unitario,
            adicionais: (item.pedido_item_adicionais || []).reduce((acc: any, adicional: any) => {
              const categoria = adicional.categoria_nome || 'Outros';
              if (!acc[categoria]) acc[categoria] = [];
              acc[categoria].push({
                nome: adicional.nome_adicional,
                quantidade: adicional.quantidade,
                valor: adicional.valor_unitario
              })
              return acc;
            }, {})
          }))
        };
      }) as Pedido[];

      setPedidos(transformedPedidos)
      
    } catch (error: any) {
      console.error('❌ usePedidosRealtimeRobust: Erro no reload:', error)
      setError(error.message || 'Erro ao recarregar pedidos.')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  return {
    pedidos,
    loading,
    error,
    updatePedidoStatus,
    reloadPedidos
  };
};
