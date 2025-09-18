import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client'; // DESABILITADO - Sistema migrado para PostgreSQL
import { toast } from 'sonner';

interface PedidoNotification {
  id: number;
  numero_pedido: number;
  nome: string;
  telefone: string;
  tipo: string;
  pagamento: string;
  total: number;
  status: string;
  created_at: string;
}

export const useRealtimePedidosNotification = (companyId?: string) => {
  const [novoPedido, setNovoPedido] = useState<PedidoNotification | null>(null);
  const [pedidosPendentes, setPedidosPendentes] = useState<number>(0);

  useEffect(() => {
    console.log('⚠️ Hook desabilitado - sistema usa PostgreSQL');
    return;
    if (!companyId) return;

    // Buscar pedidos pendentes iniciais
    const fetchPedidosPendentes = async () => {
      try {
        const { data, error } = await supabase
          // .from( // DESABILITADO'pedidos')
          .select('id')
          .eq('company_id', companyId)
          .in('status', ['analise', 'aceito']);

        if (!error && data) {
          setPedidosPendentes(data.length);
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos pendentes:', error);
      }
    };

    fetchPedidosPendentes();

    // Configurar listener em tempo real para novos pedidos
    const channel = supabase
      // .channel( // DESABILITADO'pedidos-realtime')
      // // .on( // DESABILITADO // DESABILITADO
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pedidos',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => {
          const novoPedidoData = payload.new as PedidoNotification;
          
          // Atualizar contador
          setPedidosPendentes(prev => prev + 1);
          
          // Definir o novo pedido para notificação
          setNovoPedido(novoPedidoData);

          // Mostrar notificação baseada no tipo
          let mensagem = '';
          let icone = '📋';
          
          switch (novoPedidoData.tipo) {
            case 'autoatendimento':
              mensagem = `Novo pedido do Kiosk #${novoPedidoData.numero_pedido || novoPedidoData.id} - ${novoPedidoData.nome}`;
              icone = '🏪';
              break;
            case 'delivery':
              mensagem = `Novo pedido Delivery #${novoPedidoData.numero_pedido || novoPedidoData.id} - ${novoPedidoData.nome}`;
              icone = '🚚';
              break;
            case 'retirada':
              mensagem = `Novo pedido para Retirada #${novoPedidoData.numero_pedido || novoPedidoData.id} - ${novoPedidoData.nome}`;
              icone = '🏃‍♂️';
              break;
            default:
              mensagem = `Novo pedido #${novoPedidoData.numero_pedido || novoPedidoData.id} - ${novoPedidoData.nome}`;
          }

          // Toast com som
          toast.success(mensagem, {
            description: `${icone} Total: R$ ${novoPedidoData.total.toFixed(2)} | ${novoPedidoData.pagamento}`,
            duration: 8000,
          });

          // Som de notificação
          try {
            // Criar áudio sintético simples
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
          } catch (error) {
            console.log('🔔 Novo pedido recebido!');
          }

          console.log('🔔 Novo pedido recebido:', novoPedidoData);
        }
      )
      // // .on( // DESABILITADO // DESABILITADO
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => {
          const pedidoAtualizado = payload.new as PedidoNotification;
          
          // Se o pedido foi finalizado ou cancelado, diminuir contador
          if (['finalizado', 'cancelado', 'entregue'].includes(pedidoAtualizado.status)) {
            setPedidosPendentes(prev => Math.max(0, prev - 1));
          }
          
          // Se mudou para aceito/em preparo, manter no contador mas notificar
          if (pedidoAtualizado.status === 'aceito') {
            toast.info(`Pedido #${pedidoAtualizado.numero_pedido || pedidoAtualizado.id} aceito e em preparo`, {
              description: `${pedidoAtualizado.nome} - R$ ${pedidoAtualizado.total.toFixed(2)}`,
              duration: 5000,
            });
          }
        }
      )
      // // .subscribe( // DESABILITADO // DESABILITADO);

    // Cleanup
    return () => {
      // supabase. // DESABILITADO - removeChannel(channel);
    };
  }, [companyId]);

  const marcarPedidoComoVisto = () => {
    setNovoPedido(null);
  };

  const resetarContador = () => {
    setPedidosPendentes(0);
  };

  return {
    novoPedido,
    pedidosPendentes,
    marcarPedidoComoVisto,
    resetarContador
  };
};