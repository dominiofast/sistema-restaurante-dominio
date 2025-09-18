
import React, { useState } from 'react';
import { 
  Timer, 
  Hash, 
  ChevronRight, 
  ChevronLeft, 
  Utensils,
  Settings2
} from 'lucide-react';
import { PedidoKDS } from '@/hooks/usePedidosRealTime';
import { ItemCard } from './ItemCard';
import { ItemStatus } from '@/hooks/useItemStatus';

interface PedidoCardProps {
  pedido: PedidoKDS;
  onAvancar: (id: number) => void;
  onVoltar: (id: number) => void;
  canGoBack: boolean;
  canAdvance: boolean;
  nextActionLabel: string;
}

export const PedidoCard: React.FC<PedidoCardProps> = ({
  pedido,
  onAvancar,
  onVoltar,
  canGoBack,
  canAdvance,
  nextActionLabel
}) => {
  const [individualMode, setIndividualMode] = useState(false);
  // Determinar cor do tempo
  const getTempoColor = (tempo: number) => {;
    if (tempo > 30) return 'text-red-600 bg-red-100';
    if (tempo > 20) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };


  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header compacto */}
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-gray-500" />
          <span className="text-gray-900 font-bold text-base">
            {pedido.numero_pedido || pedido.numero || pedido.id}
          </span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold uppercase">
            {pedido.tipo}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão modo individual */}
          <button
            onClick={() => setIndividualMode(!individualMode)}
            className={`flex items-center justify-center w-6 h-6 rounded text-xs transition-all ${
              individualMode 
                ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={individualMode ? "Modo individual ativo" : "Ativar modo individual"}
          >
            <Settings2 size={12} />
          </button>

          {/* Tempo */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${getTempoColor(pedido.tempo)}`}>
            <Timer size={10} />
            <span>{pedido.tempo < 10 ? `0:0${pedido.tempo}` : `0:${pedido.tempo}`}</span>
          </div>
          
          {/* Botões de ação compactos */}
          <div className="flex items-center gap-1">
            {canGoBack && (
              <button
                onClick={() => onVoltar(pedido.id)}
                className="flex items-center justify-center w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition-all"
                title="Voltar status"
              >
                <ChevronLeft size={12} />
              </button>
            )}
            
            {canAdvance && (
              <button
                onClick={() => onAvancar(pedido.id)}
                className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold transition-all"
                title={nextActionLabel}
              >
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal que aproveita todo o espaço disponível */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {individualMode ? (
            // Modo individual - itens clicáveis com controle de status
            pedido.itens.map((item, idx) => (
              <ItemCard
                key={item.id || idx}
                item={item}
                itemId={item.id}
                isClickable={true}
                onStatusChange={(itemId, newStatus) => {
                  console.log('Status alterado:', itemId, newStatus);
                }}
              />
            ))
          ) : (
            // Modo tradicional - exibição simples
            pedido.itens.map((item, idx) => (
              <ItemCard
                key={item.id || idx}
                item={item}
                itemId={item.id}
                isClickable={false}
              />
            ))
          )}
        </div>
        {/* Observações gerais do pedido fixas na base do card */}
        {pedido.observacoes && pedido.observacoes.trim() && (
          <div className="mt-2 px-3 pb-2">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1.5">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-sm font-bold text-yellow-800">📝 OBS:</span>
              </div>
              <p className="text-sm text-yellow-900 font-medium leading-tight">{pedido.observacoes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
