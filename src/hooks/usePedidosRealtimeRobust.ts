
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Pedido } from '@/types/pedidos';

export const usePedidosRealtimeRobust = () => {
  const { currentCompany } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId = currentCompany?.id;

  // Função para mapear status do PDV para status do sistema
  const mapPDVStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'preparando': 'producao',
      'prontos_entrega': 'pronto',
      'analise': 'analise',  // Manter analise como analise
      'pendente': 'analise'  // Mapear pendente para analise também
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    console.log('🔍 usePedidosRealtimeRobust: useEffect triggered', { 
      companyId, 
      currentCompany: currentCompany?.name 
    });
    
    if (!companyId) {
      console.log('❌ usePedidosRealtimeRobust: No company ID, clearing pedidos');
      setPedidos([]);
      setLoading(false);
      return;
    }

    console.log('🔍 DEBUG: Company ID exists, proceeding with fetch', { companyId });

    const fetchPedidos = async () => {
      console.log('🔄 usePedidosRealtimeRobust: Fetching pedidos for company:', companyId);
      
      // Só mostra loading se não temos dados ainda ou se é a primeira vez carregando para esta empresa
      const shouldShowLoading = pedidos.length === 0;
      if (shouldShowLoading) {
        setLoading(true);
      }
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            *,
            pedido_itens(
              id,
              nome_produto,
              quantidade,
              valor_unitario,
              valor_total,
              observacoes,
              pedido_item_adicionais(
                nome_adicional,
                categoria_nome,
                quantidade,
                valor_unitario
              )
            )
          `)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('❌ usePedidosRealtimeRobust: Error fetching pedidos:', error);
          throw error;
        }
        
        console.log('✅ usePedidosRealtimeRobust: Pedidos fetched successfully:', data?.length || 0);
        
        // Transformar os dados para garantir compatibilidade
        const transformedPedidos = (data || []).map(pedido => {
          const statusOriginal = pedido.status || 'analise';
          const statusMapeado = mapPDVStatus(statusOriginal);
          
          // Log de debug para verificar mapeamento
          if (statusOriginal !== statusMapeado) {
            console.log('🔄 Status mapeado:', { id: pedido.id, original: statusOriginal, mapeado: statusMapeado });
          }
          
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
                });
                return acc;
              }, {})
            }))
          };
        }) as Pedido[];

        console.log('🔄 usePedidosRealtimeRobust: Transformed pedidos:', transformedPedidos.length);
        setPedidos(transformedPedidos);
        
      } catch (err: any) {
        console.error('💥 usePedidosRealtimeRobust: Catch error:', err);
        setError(err.message || 'Erro ao carregar pedidos.');
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    };

    // Busca inicial dos pedidos
    fetchPedidos();

    // Configurar real-time subscription
    let channel: any = null;
    
    const channelName = `pedidos_realtime_${companyId}`;
    console.log('🔔 usePedidosRealtimeRobust: Creating subscription channel:', channelName);
    console.log('🔔 usePedidosRealtimeRobust: Company ID for subscription:', companyId);
    
    channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos'
        },
        (payload: any) => {
          console.log('🔔 usePedidosRealtimeRobust: Evento realtime recebido:', payload);
          console.log('🔔 usePedidosRealtimeRobust: Payload company_id:', payload.new?.company_id);
          console.log('🔔 usePedidosRealtimeRobust: Expected company_id:', companyId);
          
          // Filtrar manualmente por company_id
          if (payload.new?.company_id !== companyId && payload.old?.company_id !== companyId) {
            console.log('⚠️ usePedidosRealtimeRobust: Pedido não é da empresa atual, ignorando');
            return;
          }
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ usePedidosRealtimeRobust: Novo pedido inserido:', payload.new);
            
            // Buscar o pedido completo com itens
            const fetchPedidoCompleto = async () => {
              try {
                const { data: pedidoCompleto } = await supabase
                  .from('pedidos')
                  .select(`
                    *,
                    pedido_itens(
                      id,
                      nome_produto,
                      quantidade,
                      valor_unitario,
                      valor_total,
                      observacoes,
                      pedido_item_adicionais(
                        nome_adicional,
                        categoria_nome,
                        quantidade,
                        valor_unitario
                      )
                    )
                  `)
                  .eq('id', payload.new.id)
                  .single();

                if (pedidoCompleto) {
                  setPedidos(prev => {
                    // Evitar duplicatas
                    const exists = prev.find(p => p.id === payload.new.id);
                    if (exists) {
                      console.log('⚠️ usePedidosRealtimeRobust: Pedido já existe, ignorando duplicata');
                      return prev;
                    }
                    
                    // Transformar novo pedido com itens
                    const newPedido = {
                      id: pedidoCompleto.id,
                      numero_pedido: pedidoCompleto.numero_pedido,
                      company_id: pedidoCompleto.company_id,
                      nome: pedidoCompleto.nome || 'Cliente não informado',
                      telefone: pedidoCompleto.telefone || '',
                      endereco: pedidoCompleto.endereco || '',
                      status: mapPDVStatus(pedidoCompleto.status || 'analise'),
                      tipo: pedidoCompleto.tipo || 'delivery',
                      total: Number(pedidoCompleto.total) || 0,
                      pagamento: pedidoCompleto.pagamento || '',
                      horario: pedidoCompleto.horario || '',
                      origem: pedidoCompleto.origem || 'pdv',
                      created_at: pedidoCompleto.created_at,
                      updated_at: pedidoCompleto.updated_at,
                      observacoes: pedidoCompleto.observacoes,
                      itens: (pedidoCompleto.pedido_itens || []).map((item: any) => ({
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
                          });
                          return acc;
                        }, {})
                      }))
                    } as Pedido;
                    
                    console.log('✅ usePedidosRealtimeRobust: Adicionando novo pedido com itens à lista');
                    return [newPedido, ...prev];
                  });
                }
              } catch (error) {
                console.error('❌ usePedidosRealtimeRobust: Erro ao buscar pedido completo:', error);
              }
            };

            fetchPedidoCompleto();
          } else if (payload.eventType === 'UPDATE') {
            console.log('🔄 usePedidosRealtimeRobust: Pedido atualizado via realtime:', payload.new);
            setPedidos(prev => prev.map(p => {
              if (p.id === payload.new.id) {
                // Definir precedência de status (analise < producao < pronto < entregue)
                const statusPrecedence: Record<string, number> = {
                  'analise': 1,
                  'producao': 2, 
                  'pronto': 3,
                  'entregue': 4,
                  'cancelado': 0  // Status especial
                };
                
                const currentTimestamp = new Date(p.updated_at || 0).getTime();
                const newTimestamp = new Date(payload.new.updated_at || 0).getTime();
                const timeDiff = Math.abs(newTimestamp - currentTimestamp);
                
                const currentPrecedence = statusPrecedence[p.status] || 0;
                const newStatus = mapPDVStatus(payload.new.status || 'analise');
                const newPrecedence = statusPrecedence[newStatus] || 0;
                
                // Se a atualização é mais antiga OU tem precedência menor em janela de 30s, ignorar
                if (newTimestamp < currentTimestamp || 
                   (timeDiff < 30000 && newPrecedence < currentPrecedence)) {
                  console.log('⚠️ usePedidosRealtimeRobust: Ignorando atualização de baixa precedência:', {
                    pedidoId: p.id,
                    statusAtual: p.status,
                    statusNovo: newStatus,
                    precedenciaAtual: currentPrecedence,
                    precedenciaNova: newPrecedence,
                    timeDiff,
                    timestampAtual: p.updated_at,
                    timestampNovo: payload.new.updated_at
                  });
                  return p; // Não atualizar
                }
                
                const updatedPedido = {
                  ...p,
                  numero_pedido: payload.new.numero_pedido,
                  nome: payload.new.nome || 'Cliente não informado',
                  telefone: payload.new.telefone || '',
                  endereco: payload.new.endereco || '',
                  status: newStatus,
                  tipo: payload.new.tipo || 'delivery',
                  total: Number(payload.new.total) || 0,
                  pagamento: payload.new.pagamento || '',
                  horario: payload.new.horario || '',
                  origem: payload.new.origem || 'pdv',
                  updated_at: payload.new.updated_at,
                  observacoes: payload.new.observacoes
                };
                console.log('✅ usePedidosRealtimeRobust: Pedido atualizado no estado:', updatedPedido);
                return updatedPedido;
              }
              return p;
            }));
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ usePedidosRealtimeRobust: Pedido deletado:', payload.old);
            setPedidos(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe((status: any) => {
        console.log('📡 usePedidosRealtimeRobust: Canal realtime status:', status);
      });

    return () => {
      if (channel) {
        console.log('🧹 usePedidosRealtimeRobust: Cleaning up subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [companyId]);

  const updatePedidoStatus = useCallback(async (pedidoId: number, newStatus: string) => {
    if (!companyId) return;
    
    try {
      console.log('🔄 usePedidosRealtimeRobust: Iniciando atualização de status:', { pedidoId, newStatus });
      
      // Atualização otimista - atualiza o estado local imediatamente
      setPedidos(prev => prev.map(p => {
        if (p.id === pedidoId) {
          console.log('✅ usePedidosRealtimeRobust: Atualizando pedido otimisticamente:', { 
            id: p.id, 
            statusAnterior: p.status, 
            novoStatus: newStatus 
          });
          return { ...p, status: newStatus, updated_at: new Date().toISOString() };
        }
        return p;
      }));
      
      // Fazer a atualização no banco de dados
      console.log('📤 usePedidosRealtimeRobust: Enviando update para o banco:', {
        pedidoId,
        companyId,
        newStatus,
        statusLength: newStatus.length,
        updateData: { status: newStatus }
      });
      
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', pedidoId)
        .eq('company_id', companyId);
        
      if (error) {
        console.error('❌ usePedidosRealtimeRobust: Erro ao atualizar no banco:', error);
        // Reverter a atualização otimista em caso de erro
        setPedidos(prev => prev.map(p => {
          if (p.id === pedidoId) {
            // Tentar encontrar o status anterior nos dados existentes
            const pedidoOriginal = prev.find(pedido => pedido.id === pedidoId);
            console.log('🔄 usePedidosRealtimeRobust: Revertendo atualização otimística');
            return pedidoOriginal || p;
          }
          return p;
        }));
        throw error;
      }
      
      console.log('✅ usePedidosRealtimeRobust: Status atualizado com sucesso no banco');
    } catch (err: any) {
      console.error('❌ usePedidosRealtimeRobust: Error updating status:', err);
      setError('Erro ao atualizar status do pedido: ' + (err.message || 'Erro desconhecido'));
    }
  }, [companyId]);

  const reloadPedidos = async () => {
    if (!companyId) {
      console.log('❌ reloadPedidos: No company ID');
      return;
    }
    
    console.log('🔄 usePedidosRealtimeRobust: Reloading pedidos manually for company:', companyId);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_itens(
            id,
            nome_produto,
            quantidade,
            valor_unitario,
            valor_total,
            observacoes,
            pedido_item_adicionais(
              nome_adicional,
              categoria_nome,
              quantidade,
              valor_unitario
            )
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log('✅ usePedidosRealtimeRobust: Manual reload successful:', data?.length || 0);
      
      const transformedPedidos = (data || []).map(pedido => ({
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        company_id: pedido.company_id,
        nome: pedido.nome || 'Cliente não informado',
        telefone: pedido.telefone || '',
        endereco: pedido.endereco || '',
        status: mapPDVStatus(pedido.status || 'analise'),
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
            });
            return acc;
          }, {})
        }))
      })) as Pedido[];
      
      console.log('🔄 usePedidosRealtimeRobust: Reload - setting pedidos:', transformedPedidos.length);
      setPedidos(transformedPedidos);
      setError(null);
    } catch (err: any) {
      console.error('❌ usePedidosRealtimeRobust: Error reloading:', err);
      setError(err.message || 'Erro ao recarregar pedidos.');
    } finally {
      setLoading(false);
    }
  };

  // Debug logs
  console.log('🔍 usePedidosRealtimeRobust: Current state:', {
    pedidosCount: pedidos.length,
    loading,
    error,
    companyId
  });

  return {
    pedidos,
    loading,
    error,
    updatePedidoStatus,
    reloadPedidos
  };
};
