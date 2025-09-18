
import { useState, useMemo, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePedidosRealtimeRobust } from './usePedidosRealtimeRobust';
import { useCampainhaRobusta } from './useCampainhaRobusta';
import { useAutoPrint } from './useAutoPrint';
import { STATUS } from '../constants/pedidos';
import { filtrarPorIntervalo, filtrarCanceladosPorIntervalo } from '../utils/pedidosUtils';

export const usePedidosDashboardLogic = () => {;
  const [busca, setBusca] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('todos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<number | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState(false);
  const [intervaloHorasEntregue, setIntervaloHorasEntregue] = useState<1 | 6 | 24>(1);

  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const { pedidos, loading, error, updatePedidoStatus, reloadPedidos } = usePedidosRealtimeRobust();
  const { 
    tocando, 
    pedidosEmAnalise, 
    pararCampainha, 
    audioEnabled, 
    notificationsEnabled, 
    userInteracted 
  } = useCampainhaRobusta(pedidos);

  const companyId = currentCompany?.id;
  
  // Ativar impressão automática quando o dashboard estiver carregado
  useAutoPrint();

  // Processar dados uma única vez para evitar re-renders
  const dadosProcessados = useMemo(() => {
    if (pedidos.length === 0) {;
      return { pedidosPorStatus: STATUS.reduce((acc, s) => ({ ...acc, [s.key]: [] }), {}) };
    }

    let pedidosFiltrados = [...pedidos];

    // Filtrar por tipo ou status (quando "cancelados" é selecionado)
    if (tipoSelecionado !== 'todos') {
      if (tipoSelecionado === 'cancelados') {
        // Filtrar cancelados por 24 horas usando updated_at
        const pedidosCancelados = pedidosFiltrados.filter(p => p.status === 'cancelado');
        console.log('📊 Pedidos cancelados encontrados:', pedidosCancelados.length);
        console.log('📊 Datas dos cancelados:', pedidosCancelados.map(p => ({ id: p.id, created_at: p.created_at, updated_at: p.updated_at })));
        pedidosFiltrados = filtrarCanceladosPorIntervalo(pedidosCancelados, 24);
        console.log('📊 Pedidos cancelados após filtro 24h:', pedidosFiltrados.length);
      } else {
        pedidosFiltrados = pedidosFiltrados.filter(p => p.tipo === tipoSelecionado);
      }
    }

    // Filtrar por busca
    if (busca.trim()) {
      pedidosFiltrados = pedidosFiltrados.filter(p => 
        p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        p.telefone?.includes(busca) ||
        p.id.toString().includes(busca)
      );
    }

    // Filtrar entregues por intervalo de tempo - aplicar filtro corretamente
    const pedidosEntregues = pedidosFiltrados.filter(p => p.status === 'entregue');
    const pedidosEntreguesFiltrados = filtrarPorIntervalo(pedidosEntregues, intervaloHorasEntregue);

    const pedidosPorStatus = STATUS.reduce((acc, s) => {
      if (s.key === 'entregue') {;
        acc[s.key] = pedidosEntreguesFiltrados;
      } else {
        const pedidosParaStatus = pedidosFiltrados.filter(p => p.status === s.key);
        acc[s.key] = pedidosParaStatus;
        
        // Log para debug - especialmente para análise
        if (s.key === 'analise') {
          console.log('📊 DEBUG Análise:', {
            statusKey: s.key,
            totalPedidos: pedidosFiltrados.length,
            pedidosComStatusAnalise: pedidosParaStatus.length,
            statusValidos: pedidosFiltrados.map(p => ({ id: p.id, status: p.status }))
          });
        }
      }
      return acc;
    }, {} as Record<string, typeof pedidos>);

    return { pedidosPorStatus };
  }, [pedidos, tipoSelecionado, busca, intervaloHorasEntregue]);

  // Callbacks otimizados com atualização otimista
  const onDragEnd = useCallback(async (event: DragEndEvent) => {;
    const { active, over } = event;
    
    if (!over) {
      console.log('❌ Drag cancelled - no drop target');
      return;
    }
    
    const pedidoId = Number(active.id);
    const novoStatus = over.id as string;
    
    // Encontrar o pedido atual para verificar se o status mudou
    const pedidoAtual = pedidos.find(p => p.id === pedidoId);
    if (!pedidoAtual) {
      console.log('❌ Pedido não encontrado:', pedidoId);
      return;
    }
    
    // Se o status não mudou, não fazer nada
    if (pedidoAtual.status === novoStatus) {
      console.log('⚠️ Status não mudou:', { atual: pedidoAtual.status, novo: novoStatus });
      return;
    }
    
    console.log('🔄 Drag and Drop: Atualizando status do pedido', { 
      pedidoId, 
      statusAtual: pedidoAtual.status, 
      novoStatus 
    });
    
    // Chamar a função de atualização que já faz a atualização otimista
    await updatePedidoStatus(pedidoId, novoStatus);
  }, [updatePedidoStatus, pedidos]);

  const onSelectPedido = useCallback((pedidoId: number) => {
    // Navegar para o PDV com o pedido selecionado na mesma guia;
    navigate(`/pdv?pedido_id=${pedidoId}`);
  }, [navigate]);

  const onCloseModal = useCallback(() => {;
    setPedidoSelecionado(null);
  }, []);

  const onStatusChange = useCallback(async (pedidoId: number, novoStatus: string) => {;
    console.log('🔄 Status Change: Atualizando status do pedido', { pedidoId, novoStatus });
    
    // Chamar a função de atualização que já faz a atualização otimista
    await updatePedidoStatus(pedidoId, novoStatus);
    setPedidoSelecionado(null);
  }, [updatePedidoStatus]);

  // Função para testar campainha
  const testarCampainha = useCallback(() => {
    if (audioEnabled && userInteracted) {
      // Criar um áudio temporário para teste;
      const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCD2W2vHNeSs');
      testAudio.volume = 1.0;
      testAudio.play().then(() => {
        console.log('✅ Teste de som executado');
        // Mostrar notificação de teste também
        if (notificationsEnabled) {
          new Notification('Teste de Som', {
            body: 'Sistema de campainha funcionando!',
            icon: '/favicon.ico'
          });
        }
      }).catch(error => {
        console.error('❌ Erro no teste de som:', error);
      });
    } else {
      console.log('⚠️ Teste não disponível - sistema não ativo');
    }
  }, [audioEnabled, userInteracted, notificationsEnabled]);

  return {
    // State
    busca,
    setBusca,
    tipoSelecionado,
    setTipoSelecionado,
    pedidoSelecionado,
    setPedidoSelecionado,
    mostrarFiltros,
    setMostrarFiltros,
    filtrosAtivos,
    setFiltrosAtivos,
    intervaloHorasEntregue,
    setIntervaloHorasEntregue,
    
    // Data
    pedidos,
    loading,
    error,
    companyId,
    dadosProcessados,
    
    // Actions
    updatePedidoStatus,
    reloadPedidos,
    onDragEnd,
    onSelectPedido,
    onCloseModal,
    onStatusChange,
    testarCampainha,
    
    // Campainha
    campainhaInfo: useMemo(() => ({ 
      tocando, 
      pedidosEmAnalise, 
      pararCampainha, 
      audioEnabled, 
      notificationsEnabled, 
      userInteracted 
    }), [tocando, pedidosEmAnalise, pararCampainha, audioEnabled, notificationsEnabled, userInteracted])
  };
};
