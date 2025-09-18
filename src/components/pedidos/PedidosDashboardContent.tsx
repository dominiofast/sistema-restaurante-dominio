
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PedidosKanbanBoard } from './PedidosKanbanBoard';
import { Pedido } from '@/types/pedidos';

interface PedidosDashboardContentProps {
  pedidos: Pedido[];
  tipoSelecionado: string;
  setTipoSelecionado: (tipo: string) => void;
  intervaloHorasEntregue: 1 | 6 | 24;
  setIntervaloHorasEntregue: (horas: 1 | 6 | 24) => void;
  pedidosPorStatus: Record<string, Pedido[]>;
  onDragEnd: any;
  updatePedidoStatus: (pedidoId: number, status: string) => void;
  onSelectPedido: (pedidoId: number) => void;
  campainhaInfo: {
    tocando: boolean;
    pedidosEmAnalise: number;
    pararCampainha: () => void;
  };
  reloadPedidos: () => void;


export const PedidosDashboardContent: React.FC<PedidosDashboardContentProps> = ({
  pedidos,
  tipoSelecionado,
  setTipoSelecionado,
  intervaloHorasEntregue,
  setIntervaloHorasEntregue,
  pedidosPorStatus,
  onDragEnd,
  updatePedidoStatus,
  onSelectPedido,
  campainhaInfo,
  reloadPedidos
}) => {
  return (
    <div className="px-2 md:px-3 py-2">
      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={reloadPedidos}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
            title="Recarregar pedidos"
          >
            <RefreshCw className="h-3 w-3" />
            Recarregar
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mb-3">Não há pedidos para esta empresa ainda.</p>
            <button 
              onClick={reloadPedidos}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mx-auto text-sm"
            >
              <RefreshCw className="h-3 w-3" />
              Recarregar Pedidos
            </button>
          </div>
        </div>
      ) : (
        <PedidosKanbanBoard
          pedidosPorStatus={pedidosPorStatus}
          intervaloHorasEntregue={intervaloHorasEntregue}
          setIntervaloHorasEntregue={setIntervaloHorasEntregue}
          onDragEnd={onDragEnd}
          onUpdateStatus={updatePedidoStatus}
          onSelectPedido={onSelectPedido}
          campainhaInfo={campainhaInfo}
        />
      )}
    </div>
  );
};
