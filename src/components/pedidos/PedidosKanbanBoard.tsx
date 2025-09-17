import React, { useMemo, useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { STATUS } from '@/constants/pedidos';
import { Pedido } from '@/types/pedidos';
import { PedidoCard } from './PedidoCard';

interface PedidosKanbanBoardProps {
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
}

interface DroppableColumnProps {
  status: any;
  pedidos: Pedido[];
  onUpdateStatus: (pedidoId: number, status: string) => void;
  onSelectPedido: (pedidoId: number) => void;
  isMobile?: boolean;
  campainhaInfo?: any;
  intervaloHorasEntregue: 1 | 6 | 24;
  setIntervaloHorasEntregue: (horas: 1 | 6 | 24) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  status, 
  pedidos, 
  onUpdateStatus, 
  onSelectPedido, 
  isMobile = false,
  campainhaInfo,
  intervaloHorasEntregue,
  setIntervaloHorasEntregue
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status.key,
  });

  const Icon = status.icon;
  const pedidoIds = pedidos.map(pedido => String(pedido.id));

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden transition-all flex flex-col h-full ${
        isOver ? 'ring-2 ring-blue-400 shadow-lg' : ''
      }`}
    >
      {/* Header da coluna */}
      <div className={`bg-gradient-to-r ${status.gradient} p-${isMobile ? '3' : '2'} sticky top-0 z-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={status.textColor} size={isMobile ? 20 : 16} />
            <span className={`font-bold ${isMobile ? 'text-sm' : 'text-xs'} ${status.textColor}`}>
              {status.label}
            </span>
            {/* Filtro de tempo só para Entregue */}
            {status.key === 'entregue' && (
              <div className={`flex gap-${isMobile ? '1' : '0.5'} ml-${isMobile ? '2' : '1'}`}>
                {[1, 6, 24].map(horas => (
                  <button
                    key={horas}
                    className={`px-${isMobile ? '2' : '1.5'} py-${isMobile ? '1' : '0.5'} rounded-full border font-medium text-xs transition-all whitespace-nowrap ${
                      intervaloHorasEntregue === horas 
                        ? 'bg-white text-blue-700 border-blue-700' 
                        : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                    }`}
                    onClick={e => { 
                      e.stopPropagation(); 
                      setIntervaloHorasEntregue(horas as 1 | 6 | 24); 
                    }}
                  >
                    {horas === 1 ? '1h' : `${horas}h`}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className={`rounded-full px-${isMobile ? '2' : '1.5'} py-${isMobile ? '1' : '0.5'} ${isMobile ? 'text-sm' : 'text-xs'} font-bold ${status.textColor} bg-white bg-opacity-30`}>
            {pedidos.length}
          </span>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className={`p-${isMobile ? '3' : '1.5'} ${isMobile ? 'space-y-3' : 'space-y-1'} flex-1 overflow-y-auto min-h-0`}>
        <SortableContext items={pedidoIds} strategy={verticalListSortingStrategy}>
          {pedidos.length === 0 ? (
            <div className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-xs'} text-center py-${isMobile ? '8' : '6'}`}>
              <Icon className="mx-auto mb-2 text-gray-300" size={isMobile ? 32 : 24} />
              Nenhum pedido
            </div>
          ) : (
            pedidos.map((pedido, idx) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                index={idx}
                statusConfig={status}
                onUpdateStatus={onUpdateStatus}
                onSelectPedido={onSelectPedido}
                isCampainhaActive={status.key === 'analise' && campainhaInfo?.tocando}
                pararCampainha={campainhaInfo?.pararCampainha}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export const PedidosKanbanBoard: React.FC<PedidosKanbanBoardProps> = ({
  pedidosPorStatus,
  intervaloHorasEntregue,
  setIntervaloHorasEntregue,
  onDragEnd,
  onUpdateStatus,
  onSelectPedido,
  campainhaInfo
}) => {
  const [statusConfigsKey, setStatusConfigsKey] = useState(0);
  const [activePedido, setActivePedido] = useState<Pedido | null>(null);

  // Configurar sensores para touch e mouse com melhor tolerância
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduzido para melhor responsividade
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Filtrar status habilitados usando configurações salvas no localStorage
  const statusHabilitados = useMemo(() => {
    const savedConfigs = localStorage.getItem('statusConfigs');
    if (savedConfigs) {
      const configs = JSON.parse(savedConfigs);
      return STATUS.filter(status => {
        const config = configs.find((c: any) => c.key === status.key);
        return config ? config.enabled : status.enabled;
      });
    }
    return STATUS.filter(status => status.enabled);
  }, [statusConfigsKey]);

  // Listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => setStatusConfigsKey(prev => prev + 1);
    window.addEventListener('storage', handleStorageChange);
    
    // Listener para mudanças na mesma aba
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'statusConfigs') {
        handleStorageChange();
      }
    };
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const pedidoId = Number(active.id);
    
    console.log('🟡 Drag Start:', { pedidoId });
    
    // Encontrar o pedido ativo
    const pedido = Object.values(pedidosPorStatus)
      .flat()
      .find(p => p.id === pedidoId);
      
    setActivePedido(pedido || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('🔴 Drag End:', { 
      activeId: active.id, 
      overId: over?.id,
      hasOver: !!over 
    });
    
    setActivePedido(null);
    onDragEnd(event);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      {/* Layout para Desktop - Grid Vertical */}
      <div className="hidden lg:grid gap-1.5 h-[calc(100vh-80px)]" style={{gridTemplateColumns: `repeat(${statusHabilitados.length}, 1fr)`, alignItems: 'stretch'}}>
        {statusHabilitados.map(status => (
          <DroppableColumn
            key={status.key}
            status={status}
            pedidos={pedidosPorStatus[status.key] || []}
            onUpdateStatus={onUpdateStatus}
            onSelectPedido={onSelectPedido}
            campainhaInfo={campainhaInfo}
            intervaloHorasEntregue={intervaloHorasEntregue}
            setIntervaloHorasEntregue={setIntervaloHorasEntregue}
          />
        ))}
      </div>

      {/* Layout para Mobile/Tablet */}
      <div className="lg:hidden h-[calc(100vh-80px)] overflow-hidden">
        <div className="flex gap-3 h-full overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
          {statusHabilitados.map(status => (
            <div key={status.key} className="flex-shrink-0" style={{ width: 'calc(100vw - 24px)', minWidth: '320px' }}>
              <DroppableColumn
                status={status}
                pedidos={pedidosPorStatus[status.key] || []}
                onUpdateStatus={onUpdateStatus}
                onSelectPedido={onSelectPedido}
                isMobile={true}
                campainhaInfo={campainhaInfo}
                intervaloHorasEntregue={intervaloHorasEntregue}
                setIntervaloHorasEntregue={setIntervaloHorasEntregue}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay para mostrar o item sendo arrastado */}
      <DragOverlay>
        {activePedido ? (
          <div className="opacity-80 rotate-6 scale-105">
            <PedidoCard
              pedido={activePedido}
              index={0}
              statusConfig={statusHabilitados.find(s => pedidosPorStatus[s.key]?.some(p => p.id === activePedido.id)) || statusHabilitados[0]}
              onUpdateStatus={onUpdateStatus}
              onSelectPedido={onSelectPedido}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};