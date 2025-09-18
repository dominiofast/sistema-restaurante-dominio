
import React from 'react';
import { PedidosFilters } from './PedidosFilters';
import { PedidosBoard } from './PedidosBoard';
import { Pedido } from '@/types/pedidos';
import { DragEndEvent } from '@dnd-kit/core';

interface PedidosContainerProps {
  pedidos: Pedido[];
  pedidosPorStatus: Record<string, Pedido[]>;
  busca: string;
  setBusca: (value: string) => void;
  tipoSelecionado: string;
  setTipoSelecionado: (tipo: string) => void;
  intervaloHorasEntregue: 1 | 6 | 24;
  setIntervaloHorasEntregue: (horas: 1 | 6 | 24) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onUpdateStatus: (pedidoId: number, status: string) => void;
  onSelectPedido: (pedidoId: number) => void;
  onShowFilters: () => void;
  filtrosAtivos: boolean;
  campainhaInfo?: {
    tocando: boolean;
    pedidosEmAnalise: number;
    pararCampainha: () => void;
  };


export const PedidosContainer: React.FC<PedidosContainerProps> = ({
  pedidos,
  pedidosPorStatus,
  busca,
  setBusca,
  tipoSelecionado,
  setTipoSelecionado,
  intervaloHorasEntregue,
  setIntervaloHorasEntregue,
  onDragEnd,
  onUpdateStatus,
  onSelectPedido,
  onShowFilters,
  filtrosAtivos,
  campainhaInfo
}) => {
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum pedido encontrado</h3>
          <p className="text-gray-500">Não há pedidos para esta empresa ainda.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4">
      <PedidosBoard
        pedidosPorStatus={pedidosPorStatus}
        intervaloHorasEntregue={intervaloHorasEntregue}
        setIntervaloHorasEntregue={setIntervaloHorasEntregue}
        onDragEnd={onDragEnd}
        onUpdateStatus={onUpdateStatus}
        onSelectPedido={onSelectPedido}
        campainhaInfo={campainhaInfo}
      />
    </div>
  )
};
