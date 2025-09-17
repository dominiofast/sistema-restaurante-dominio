
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
}

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
}

export const usePedidosRealTime = () => {
  const { currentCompany } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoKDS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🚀 usePedidosRealTime: Hook iniciado');
  console.log('🏢 usePedidosRealTime: currentCompany:', currentCompany);
  console.log('🏢 usePedidosRealTime: currentCompany.id:', currentCompany?.id);

  // Função para calcular tempo decorrido
  const calculateElapsedTime = (createdAt: string): number => {
    const now = new Date();
    const created = new Date(createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60)); // em minutos
  };

  // Função para buscar itens reais do pedido com adicionais
  const fetchPedidoItens = async (pedidoId: number): Promise<ItemPedido[]> => {
    try {
      console.log('🔍 Buscando itens do pedido:', pedidoId);
      
      // Buscar itens do pedido
      const { data: itens, error: itensError } = await supabase
        .from('pedido_itens')
        .select('*')
        .eq('pedido_id', pedidoId);
      
      if (itensError) {
        console.error('❌ Erro ao buscar itens:', itensError);
        throw itensError;
      }

      if (!itens || itens.length === 0) {
        console.log('⚠️ Nenhum item encontrado para o pedido:', pedidoId);
        // Retorna um item genérico para pedidos sem itens específicos
        return [{
          nome: `Pedido #${pedidoId}`,
          qtd: 1,
          valor: 0,
          observacoes: undefined,
          adicionais: []
        }];
      }

      console.log('📦 KDS DEBUG - Itens encontrados:', itens.length);
      console.log('📦 KDS DEBUG - Dados completos dos itens:', itens);

      // Para cada item, buscar seus adicionais com categorias reais
      const itensComAdicionais = await Promise.all(
        itens.map(async (item) => {
          console.log('🔍 KDS DEBUG - Buscando adicionais para item:', item.id, item.nome_produto);
          
          // Buscar adicionais do item sem JOIN já que adicional_id está null
          const { data: adicionaisData, error: adicionaisError } = await supabase
            .from('pedido_item_adicionais')
            .select('*')
            .eq('pedido_item_id', item.id);

          if (adicionaisError) {
            console.error('❌ KDS DEBUG - Erro ao buscar adicionais:', adicionaisError);
          } else {
            console.log('📋 KDS DEBUG - Adicionais brutos encontrados:', adicionaisData);
          }

          // Para cada adicional, buscar a categoria real pelo nome
          const adicionaisFormatados = (adicionaisData || []).map((adicional) => {
            // Usar categoria_nome que já vem salva corretamente do banco
            const categoria = adicional.categoria_nome || 'Ingredientes';
            
            return {
              nome: adicional.nome_adicional,
              qtd: adicional.quantidade,
              valor: adicional.valor_unitario,
              categoria: categoria
            };
          });

          console.log('🔍 KDS DEBUG - Adicionais formatados para item:', item.nome_produto, adicionaisFormatados);

          console.log('✅ KDS DEBUG - Item final processado:', {
            nome: item.nome_produto,
            qtd: item.quantidade,
            adicionais: adicionaisFormatados.length,
            adicionaisDetalhes: adicionaisFormatados
          });

          return {
            id: item.id, // Incluir ID do banco para controle de status
            nome: item.nome_produto,
            qtd: item.quantidade,
            valor: item.valor_unitario,
            observacoes: item.observacoes || undefined,
            adicionais: adicionaisFormatados.length > 0 ? adicionaisFormatados : undefined
          };
        })
      );

      console.log('🍽️ Itens finais processados:', itensComAdicionais.length);
      return itensComAdicionais;
      
    } catch (error) {
      console.error('💥 Erro ao buscar itens do pedido:', error);
      // Em caso de erro, retorna um item genérico
      return [
        {
          nome: `Erro ao carregar itens - Pedido #${pedidoId}`,
          qtd: 1,
          valor: 0,
          observacoes: undefined,
          adicionais: []
        }
      ];
    }
  };

  // Função para converter pedido do banco para formato KDS
  const convertToKDSFormat = async (pedidoDB: any): Promise<PedidoKDS> => {
    const itens = await fetchPedidoItens(pedidoDB.id);
    
    // Se temos apenas um item genérico, atualiza o valor com o total do pedido
    if (itens.length === 1 && itens[0].nome.includes('Pedido #')) {
      itens[0].valor = pedidoDB.total || 0;
    }
    
    // Buscar observações dos itens se não há observação geral
    let observacoesFinal = pedidoDB.observacoes;
    
    if (!observacoesFinal || observacoesFinal.trim() === '') {
      // Verificar se há observações nos itens
      const observacoesItens = itens
        .map(item => item.observacoes)
        .filter(obs => obs && obs.trim() !== '')
        .join('; ');
      
      if (observacoesItens) {
        observacoesFinal = observacoesItens;
      }
    }
    
    return {
      id: pedidoDB.id,
      numero: `#${pedidoDB.numero_pedido || pedidoDB.id}`,
      numero_pedido: pedidoDB.numero_pedido,
      nome: pedidoDB.nome || 'Cliente não informado',
      telefone: pedidoDB.telefone || '',
      tempo: calculateElapsedTime(pedidoDB.created_at),
      status: pedidoDB.status || 'novo',
      tipo: pedidoDB.tipo || 'delivery',
      total: pedidoDB.total || 0,
      pagamento: pedidoDB.pagamento || 'N/A',
      endereco: pedidoDB.endereco || '',
      created_at: pedidoDB.created_at,
      itens: itens,
      observacoes: observacoesFinal || undefined,
      fonte: pedidoDB.tipo === 'delivery' ? 'DELIVERY' : 
             pedidoDB.tipo === 'balcao' ? 'BALCÃO' : 
             pedidoDB.tipo === 'mesa' ? 'MESA' : 'PDV'
    };
  };

  // Buscar pedidos iniciais
  const fetchPedidos = async () => {
    if (!currentCompany?.id) {
      setPedidos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 KDS: Buscando pedidos para empresa:', currentCompany.id);
      console.log('🔍 KDS: currentCompany completo:', currentCompany);

      // BUSCAR TODOS OS PEDIDOS PRIMEIRO PARA DEBUGAR
      const { data: allPedidos, error: allError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });
        
      console.log('🔍 KDS: TODOS OS PEDIDOS encontrados:', allPedidos?.length || 0);
      console.log('🔍 KDS: TODOS OS PEDIDOS - dados:', allPedidos);
      
      // Agora filtrar por status
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('company_id', currentCompany.id)
        .in('status', ['analise', 'producao', 'pronto']) // Apenas pedidos ativos no KDS
        .order('created_at', { ascending: true });
        
      console.log('🔍 KDS: Query executada - company_id:', currentCompany.id);
      console.log('🔍 KDS: Resultado da query - pedidos encontrados:', data?.length || 0);
      console.log('🔍 KDS: Dados completos da query:', data);

      if (error) throw error;

      console.log('📋 KDS: Pedidos encontrados no banco:', data?.length || 0);

      const pedidosKDS = await Promise.all(
        (data || []).map(pedido => convertToKDSFormat(pedido))
      );
      
      setPedidos(pedidosKDS);
      
      console.log('🍽️ KDS: Pedidos processados e carregados:', pedidosKDS.length);
    } catch (err: any) {
      console.error('❌ KDS: Erro ao carregar pedidos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Configurar real-time subscription
  useEffect(() => {
    if (!currentCompany?.id) return;

    fetchPedidos();

    // Subscription para mudanças em tempo real nos pedidos
    const pedidosChannel = supabase
      .channel(`pedidos-kds-${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `company_id=eq.${currentCompany.id}`
        },
        async (payload) => {
          console.log('🔄 KDS: Mudança detectada em pedidos:', payload);
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ KDS: Novo pedido detectado, aguardando itens...');
            
            // Aguardar um pouco para garantir que os itens sejam inseridos primeiro
            setTimeout(async () => {
              const novoPedido = await convertToKDSFormat(payload.new);
              if (['analise', 'producao', 'pronto'].includes(novoPedido.status)) {
                setPedidos(prev => {
                  // Evitar duplicatas
                  const existe = prev.find(p => p.id === novoPedido.id);
                  if (existe) {
                    return prev.map(p => p.id === novoPedido.id ? novoPedido : p);
                  }
                  return [...prev, novoPedido];
                });
                console.log('➕ KDS: Novo pedido adicionado com dados completos:', novoPedido.numero);
              }
            }, 2000); // Aguarda 2 segundos para itens serem inseridos
          } else if (payload.eventType === 'UPDATE') {
            const pedidoAtualizado = await convertToKDSFormat(payload.new);
            if (['analise', 'producao', 'pronto'].includes(pedidoAtualizado.status)) {
              setPedidos(prev => 
                prev.map(p => p.id === pedidoAtualizado.id ? pedidoAtualizado : p)
              );
              console.log('🔄 KDS: Pedido atualizado:', pedidoAtualizado.numero);
            } else {
              // Remove pedido que mudou para status fora do KDS
              setPedidos(prev => prev.filter(p => p.id !== pedidoAtualizado.id));
              console.log('❌ KDS: Pedido removido do KDS:', pedidoAtualizado.numero);
            }
          } else if (payload.eventType === 'DELETE') {
            setPedidos(prev => prev.filter(p => p.id !== payload.old.id));
            console.log('❌ KDS: Pedido removido:', payload.old.id);
          }
        }
      )
      .subscribe();

    // Subscription para mudanças em itens dos pedidos
    const itensChannel = supabase
      .channel(`pedido-itens-kds-${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedido_itens'
        },
        async (payload) => {
          console.log('🔄 KDS: Mudança detectada em itens:', payload);
          
          // Atualizar apenas o pedido específico afetado
          const pedidoId = (payload.new as any)?.pedido_id || (payload.old as any)?.pedido_id;
          if (pedidoId) {
            // Buscar o pedido completo no banco
            const { data: pedidoData } = await supabase
              .from('pedidos')
              .select('*')
              .eq('id', pedidoId)
              .eq('company_id', currentCompany.id)
              .single();
            
            if (pedidoData && ['analise', 'producao', 'pronto'].includes(pedidoData.status)) {
              const pedidoAtualizado = await convertToKDSFormat(pedidoData);
              setPedidos(prev => {
                const exists = prev.find(p => p.id === pedidoId);
                if (exists) {
                  return prev.map(p => p.id === pedidoId ? pedidoAtualizado : p);
                } else {
                  return [...prev, pedidoAtualizado];
                }
              });
              console.log('🔄 KDS: Pedido atualizado por mudança nos itens:', pedidoAtualizado.numero);
            }
          }
        }
      )
      .subscribe();

    // Subscription para mudanças em adicionais dos itens
    const adicionaisChannel = supabase
      .channel(`pedido-adicionais-kds-${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedido_item_adicionais'
        },
        async (payload) => {
          console.log('🔄 KDS: Mudança detectada em adicionais:', payload);
          
          // Atualizar apenas o pedido específico afetado
          const itemId = (payload.new as any)?.pedido_item_id || (payload.old as any)?.pedido_item_id;
          if (itemId) {
            // Buscar o pedido através do item
            const { data: itemData } = await supabase
              .from('pedido_itens')
              .select('pedido_id')
              .eq('id', itemId)
              .single();
            
            if (itemData?.pedido_id) {
              const { data: pedidoData } = await supabase
                .from('pedidos')
                .select('*')
                .eq('id', itemData.pedido_id)
                .eq('company_id', currentCompany.id)
                .single();
              
              if (pedidoData && ['analise', 'producao', 'pronto'].includes(pedidoData.status)) {
                const pedidoAtualizado = await convertToKDSFormat(pedidoData);
                setPedidos(prev => {
                  const exists = prev.find(p => p.id === itemData.pedido_id);
                  if (exists) {
                    return prev.map(p => p.id === itemData.pedido_id ? pedidoAtualizado : p);
                  } else {
                    return [...prev, pedidoAtualizado];
                  }
                });
                console.log('🔄 KDS: Pedido atualizado por mudança nos adicionais:', pedidoAtualizado.numero);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pedidosChannel);
      supabase.removeChannel(itensChannel);
      supabase.removeChannel(adicionaisChannel);
    };
  }, [currentCompany?.id]);

  // Atualizar tempos a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setPedidos(prev => 
        prev.map(pedido => ({
          ...pedido,
          tempo: calculateElapsedTime(pedido.created_at)
        }))
      );
    }, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, []);

  // Função para atualizar status do pedido
  const atualizarStatus = async (pedidoId: number, novoStatus: string) => {
    if (!currentCompany?.id) return;

    try {
      console.log('🔄 KDS: Iniciando atualização de status:', { pedidoId, novoStatus });
      
      // Se o novo status for 'entregue', na verdade vamos marcar como 'prontos_entrega'
      // para que apareça nos pedidos como "Prontos para entrega"
      const statusFinal = novoStatus === 'entregue' ? 'prontos_entrega' : novoStatus;
      
      // Primeiro, atualizar otimisticamente o estado local
      setPedidos(prev => {
        if (statusFinal === 'prontos_entrega') {
          // Remove do KDS se foi marcado como pronto para entrega
          return prev.filter(p => p.id !== pedidoId);
        } else {
          // Atualiza o status localmente
          return prev.map(p => 
            p.id === pedidoId 
              ? { ...p, status: statusFinal }
              : p
          );
        }
      });
      
      const { error } = await supabase
        .from('pedidos')
        .update({ status: statusFinal })
        .eq('id', pedidoId)
        .eq('company_id', currentCompany.id);

      if (error) {
        console.error('❌ KDS: Erro ao atualizar status:', error);
        // Reverter o estado local em caso de erro
        fetchPedidos();
        throw error;
      }

      console.log('✅ KDS: Status atualizado com sucesso:', { pedidoId, novoStatus: statusFinal });
    } catch (err: any) {
      console.error('❌ KDS: Erro ao atualizar status:', err);
      throw err;
    }
  };

  return {
    pedidos,
    loading,
    error,
    atualizarStatus,
    refetch: fetchPedidos
  };
};
