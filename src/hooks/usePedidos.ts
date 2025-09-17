import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Pedido } from '@/types/pedidos';

export const usePedidos = () => {
  const { currentCompany } = useAuth();
  const { selectedStore } = useStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = currentCompany?.id;

  useEffect(() => {
    console.log('usePedidos: useEffect triggered', { companyId, selectedStore: selectedStore?.name });
    
    const fetchPedidos = async () => {
      if (!companyId) {
        console.log('usePedidos: No company ID, clearing pedidos');
        setPedidos([]);
        setLoading(false);
        return;
      }

      console.log('usePedidos: Fetching pedidos for company:', companyId, selectedStore ? `filtered by: ${selectedStore.name}` : '(all companies)');
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('pedidos')
          .select('*, numero_pedido')
          .eq('company_id', companyId);

        // Se há uma empresa específica selecionada, usar apenas ela
        if (selectedStore?.id && selectedStore.id !== companyId) {
          query = query.eq('company_id', selectedStore.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
          
        if (error) {
          console.error('usePedidos: Error fetching pedidos:', error);
          throw error;
        }
        
        console.log('usePedidos: Pedidos fetched successfully:', data?.length || 0);
        
        // Atualização inteligente: só atualiza o que mudou
        setPedidos(prevPedidos => {
          const pedidosData = data as Pedido[] | null;
          
          if (!pedidosData || pedidosData.length === 0) {
            // Se não há dados, mantém o estado anterior para evitar piscadas
            if (prevPedidos.length > 0) {
              console.warn('usePedidos: Mantendo pedidos anteriores pois a consulta veio vazia');
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
          const pedidosMap = new Map(prevPedidos.map(p => [p.id, p]));
          const newPedidosMap = new Map(pedidosData.map((p) => [p.id, p]));
          
          // Atualizar pedidos existentes
          for (let i = 0; i < updatedPedidos.length; i++) {
            const pedido = updatedPedidos[i];
            const newPedido = newPedidosMap.get(pedido.id);
            if (newPedido && (pedido.status !== newPedido.status || pedido.updated_at !== newPedido.updated_at)) {
              updatedPedidos[i] = newPedido;
            }
          }
          
          // Adicionar novos pedidos no início
          for (const [id, pedido] of newPedidosMap) {
            if (!pedidosMap.has(id)) {
              updatedPedidos.unshift(pedido);
            }
          }
          
          // Remover pedidos que não existem mais
          return updatedPedidos.filter(p => newPedidosMap.has(p.id));
        });
        
      } catch (err: any) {
        console.error('usePedidos: Catch error:', err);
        setError(err.message || 'Erro ao carregar pedidos.');
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };

    // Busca inicial dos pedidos
    fetchPedidos();

    // Configurar real-time subscription com canal único
    let channel: any = null;
    let pollingInterval: any = null;
    let realtimeWorking = false;
    
    if (companyId) {
      const channelName = `pedidos_realtime_${companyId}`;
      console.log('usePedidos: Creating subscription channel:', channelName);
      
      channel = supabase.channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pedidos',
            filter: `company_id=eq.${companyId}`
          },
          (payload: any) => {
            console.log('usePedidos: Evento realtime recebido:', payload);
            realtimeWorking = true; // Marca que o realtime está funcionando
            
            if (payload.eventType === 'INSERT') {
              console.log('usePedidos: Novo pedido inserido:', payload.new);
              setPedidos(prev => {
                // Evitar duplicatas
                const exists = prev.find(p => p.id === payload.new.id);
                if (exists) return prev;
                return [payload.new, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              console.log('usePedidos: Pedido atualizado:', payload.new);
              setPedidos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
            } else if (payload.eventType === 'DELETE') {
              console.log('usePedidos: Pedido deletado:', payload.old);
              setPedidos(prev => prev.filter(p => p.id !== payload.old.id));
            }
          }
        )
        .subscribe((status: any) => {
          console.log('usePedidos: Canal realtime status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('usePedidos: Successfully subscribed to realtime updates');
            realtimeWorking = true;
          } else if (status === 'CHANNEL_ERROR') {
            console.error('usePedidos: Error subscribing to realtime updates');
            realtimeWorking = false;
            // Ativar polling suave como fallback
            if (!pollingInterval) {
              console.log('usePedidos: Ativando polling de fallback (30s)');
              pollingInterval = setInterval(() => {
                fetchPedidos();
              }, 30000); // 30 segundos
            }
          }
        });
    }

    return () => {
      if (channel) {
        console.log('usePedidos: Cleaning up subscription');
        supabase.removeChannel(channel);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [companyId, selectedStore?.id]); // Reagir também à mudança de empresa

  const updatePedidoStatus = async (pedidoId: number, newStatus: string) => {
    if (!companyId) return;
    
    try {
      console.log('usePedidos: Updating pedido status:', { pedidoId, newStatus });
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', pedidoId)
        .eq('company_id', companyId);
        
      if (error) throw error;
      
      console.log('usePedidos: Status updated successfully');
    } catch (err: any) {
      console.error('usePedidos: Error updating status:', err);
      setError('Erro ao atualizar status do pedido: ' + (err.message || 'Erro desconhecido'));
    }
  };

  return {
    pedidos,
    loading,
    error,
    updatePedidoStatus
  };
};
