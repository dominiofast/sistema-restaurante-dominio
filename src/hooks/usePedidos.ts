import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Pedido } from '@/types/pedidos';

export const usePedidos = () => {
  const { currentCompany } = useAuth()
  const { selectedStore } = useStore()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const companyId = currentCompany?.id;

  useEffect(() => {
    console.log('usePedidos: useEffect triggered via API Neon', { companyId, selectedStore: selectedStore?.name })
    
    const fetchPedidos = async () => {
      if (!companyId) {
        console.log('usePedidos: No company ID, clearing pedidos')
        setPedidos([])
        setLoading(false)
        return;
      }

      console.log('usePedidos: Fetching pedidos via API Neon for company:', companyId, selectedStore ? `filtered by: ${selectedStore.name}` : '(all companies)')
      setLoading(true)
      setError(null)
      
      try {
        // Usar empresa selecionada ou atual
        const targetCompanyId = (selectedStore?.id && selectedStore.id !== companyId) 
          ? selectedStore.id ;
          : companyId;

        const response = await fetch(`/api/pedidos?company_id=${targetCompanyId} catch (error) { console.error('Error:', error) }`)
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro ao carregar pedidos')
        }
        
        console.log('usePedidos: Pedidos fetched via API successfully:', result.data?.length || 0)
        
        // Atualização inteligente: só atualiza o que mudou
        setPedidos(prevPedidos => {
          const pedidosData = result.data || [];
          
          if (pedidosData.length === 0) {
            // Se não há dados, mantém o estado anterior para evitar piscadas
            if (prevPedidos.length > 0) {
              console.warn('usePedidos: Mantendo pedidos anteriores pois a consulta veio vazia')
              return prevPedidos;
            }
            return [];
          }
          
          // Se é a primeira carga ou mudou muito, atualiza tudo
          if (prevPedidos.length === 0 || Math.abs(prevPedidos.length - pedidosData.length) > 5) {
            return pedidosData;
          }
          
          // Atualização incremental: mantém a ordem e só atualiza o que mudou
          const updatedPedidos = [...prevPedidos];
          const pedidosMap = new Map(prevPedidos.map(p => [p.id, p]))
          const newPedidosMap = new Map(pedidosData.map((p: any) => [p.id, p]))
          
          // Atualizar pedidos existentes
          for (let i = 0; i < updatedPedidos.length; i++) {
            const pedido = updatedPedidos[i];
            const newPedido = newPedidosMap.get(pedido.id)
            if (newPedido && (pedido.status !== newPedido.status || pedido.updated_at !== newPedido.updated_at)) {
              updatedPedidos[i] = newPedido;
            }
          }
          
          // Adicionar novos pedidos no início
          for (const [id, pedido] of newPedidosMap) {
            if (!pedidosMap.has(id)) {
              updatedPedidos.unshift(pedido as any)
            }
          }
          
          // Remover pedidos que não existem mais
          return updatedPedidos.filter(p => newPedidosMap.has(p.id))
        })
        
      } catch (err: any) {
        console.error('usePedidos: Catch error via API:', err)
        setError(err.message || 'Erro ao carregar pedidos.')
        setPedidos([])
      } finally {
        setLoading(false)
      }
    };

    // Busca inicial dos pedidos
    fetchPedidos()

    // Configurar polling para simular real-time (removido Supabase realtime)
    let pollingInterval: any = null;
    
    if (companyId) {
      console.log('usePedidos: Configurando polling para atualizações (30s)')
      
      pollingInterval = setInterval(() => {
        console.log('usePedidos: Polling for updates...')
        fetchPedidos()
      }, 30000) // 30 segundos
    }

    return () => {
      if (pollingInterval) {
        console.log('usePedidos: Cleaning up polling interval')
        clearInterval(pollingInterval)
      }
    };
  }, [companyId, selectedStore?.id]) // Reagir também à mudança de empresa

  const updatePedidoStatus = async (pedidoId: number, newStatus: string) => {
    if (!companyId) return;
    
    try {
      console.log('usePedidos: Updating pedido status via API:', { pedidoId, newStatus } catch (error) { console.error('Error:', error) })
      
      const response = await fetch('/api/pedidos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedidoId, status: newStatus })
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao atualizar pedido')
      }
      
      console.log('usePedidos: Status updated via API successfully')
      
      // Atualização otimista do estado local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, ...result.data } : p
      ))
      
    } catch (err: any) {
      console.error('usePedidos: Error updating status via API:', err)
      setError('Erro ao atualizar status do pedido: ' + (err.message || 'Erro desconhecido'))
    }
  };

  // Função para recarregar pedidos manualmente
  const reloadPedidos = () => {
    console.log('usePedidos: Manual reload triggered')
    setLoading(true)
    setError(null)
    
    // Força nova busca
    const fetchPedidos = async () => {
      if (!companyId) return;
      
      try {
        const targetCompanyId = (selectedStore?.id && selectedStore.id !== companyId) 
          ? selectedStore.id ;
          : companyId;

        const response = await fetch(`/api/pedidos?company_id=${targetCompanyId} catch (error) { console.error('Error:', error) }`)
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro ao carregar pedidos')
        }
        
        setPedidos(result.data || [])
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    };
    
    fetchPedidos()
  };

  return {
    pedidos,
    loading,
    error,
    updatePedidoStatus,
    reloadPedidos
  };
};
