
import React from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { PedidosKanbanBoard } from './PedidosKanbanBoard';
import { Pedido } from '@/types/pedidos';

interface PedidosBoardProps {
  pedidosPorStatus: Record<string, Pedido[]>;
  intervaloHorasEntregue: 1 | 6 | 24;
  setIntervaloHorasEntregue: (horas: 1 | 6 | 24) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onUpdateStatus: (pedidoId: number, status: string) => void;
  onSelectPedido: (pedidoId: number) => void;
  campainhaInfo?: {
    tocando: boolean;
    pedidosEmAnalise: number;
    pararCampainha: () => void;
  };


export const PedidosBoard: React.FC<PedidosBoardProps> = ({
  pedidosPorStatus,
  intervaloHorasEntregue,
  setIntervaloHorasEntregue,
  onDragEnd,
  onUpdateStatus,
  onSelectPedido,
  campainhaInfo
}) => {
  return (
    <div className="h-full">
      <PedidosKanbanBoard
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
