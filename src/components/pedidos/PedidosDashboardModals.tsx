
import React, { useMemo } from 'react';
import PedidoDetalhesModal from './PedidoDetalhesModal';
import FiltrosAvancados from './FiltrosAvancados';
import { getPedidoWithItens } from '@/utils/pedidosUtils';
import { Pedido } from '@/types/pedidos';

interface PedidosDashboardModalsProps {
  pedidos: Pedido[];
  pedidoSelecionado: number | null;
  onCloseModal: () => void;
  onStatusChange: (pedidoId: number, novoStatus: string) => void;
  mostrarFiltros: boolean;
  setMostrarFiltros: (show: boolean) => void;
  setFiltrosAtivos: (active: boolean) => void;
}

export const PedidosDashboardModals: React.FC<PedidosDashboardModalsProps> = ({
  pedidos,
  pedidoSelecionado,
  onCloseModal,
  onStatusChange,
  mostrarFiltros,
  setMostrarFiltros,
  setFiltrosAtivos
}) => {
  const pedidoSelecionadoData = useMemo(() => {
    if (!pedidoSelecionado) return null;
    const pedido = pedidos.find(p => p.id === pedidoSelecionado);
    return pedido ? getPedidoWithItens(pedido) : null;
  }, [pedidoSelecionado, pedidos]);

  return (
    <>
      {/* Modal de detalhes do pedido */}
      <PedidoDetalhesModal 
        pedido={pedidoSelecionadoData}
        onClose={onCloseModal}
        onStatusChange={onStatusChange}
      />
      
      {/* Modal de filtros avançados */}
      {mostrarFiltros && (
        <FiltrosAvancados 
          onClose={() => setMostrarFiltros(false)}
          onApplyFilters={(filters) => {
            setFiltrosAtivos(true);
          }}
        />
      )}
    </>
  );
};
