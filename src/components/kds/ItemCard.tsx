import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, PlayCircle, Package } from 'lucide-react';
import { useItemStatus, ItemStatus } from '@/hooks/useItemStatus';
import { ItemPedido } from '@/hooks/usePedidosRealTime';
import { Button } from '@/components/ui/button';

interface ItemCardProps {
  item: ItemPedido & { id?: string };
  itemId?: string;
  isClickable?: boolean;
  onStatusChange?: (itemId: string, newStatus: ItemStatus) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  itemId,
  isClickable = false,
  onStatusChange
}) => {
  const { updateItemStatus, getItemStatus, loading } = useItemStatus();
  const [currentStatus, setCurrentStatus] = useState<ItemStatus>('pendente');
  const [isExpanded, setIsExpanded] = useState(false);

  // Buscar status atual do item ao montar o componente
  useEffect(() => {
    if (itemId && isClickable) {
      loadItemStatus();
    }
  }, [itemId, isClickable]);

  const loadItemStatus = async () => {
    if (!itemId) return;
    
    try {
      const status = await getItemStatus(itemId);
      setCurrentStatus(status || 'pendente');
    } catch (error) {
      console.error('Erro ao carregar status do item:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: ItemStatus) => {
    if (!itemId || !isClickable) return;

    try {
      await updateItemStatus(itemId, newStatus);
      setCurrentStatus(newStatus);
      onStatusChange?.(itemId, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusIcon = (status: ItemStatus) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'em_producao':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'pronto':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'entregue':
        return <Package className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case 'pendente':
        return 'border-l-orange-400 bg-orange-50';
      case 'em_producao':
        return 'border-l-blue-400 bg-blue-50';
      case 'pronto':
        return 'border-l-green-400 bg-green-50';
      case 'entregue':
        return 'border-l-gray-400 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getNextStatus = (current: ItemStatus): ItemStatus | null => {
    switch (current) {
      case 'pendente':
        return 'em_producao';
      case 'em_producao':
        return 'pronto';
      case 'pronto':
        return 'entregue';
      default:
        return null;
    }
  };

  const getStatusLabel = (status: ItemStatus) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_producao':
        return 'Produzindo';
      case 'pronto':
        return 'Pronto';
      case 'entregue':
        return 'Entregue';
      default:
        return 'Desconhecido';
    }
  };

  // Função para agrupar adicionais por categoria
  const groupAdicionaisByCategory = (adicionais: Array<{nome: string; qtd?: number; valor: number; categoria?: string}>) => {
    const grouped = adicionais.reduce((acc, adicional) => {
      // Usar nome real da categoria, apenas com limpeza básica
      let categoria = adicional.categoria || 'Outros';
      
      // Remove apenas emojis comuns, mantendo o nome original
      categoria = categoria.replace(/📁|📂|🗂️|🍕|🧀|🥩|🍅/g, '').trim();
      
      // REMOVIDO: Normalização automática que sobrescrevia nomes reais
      // Agora preserva o nome original da categoria criada no gestor
      
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push(adicional);
      return acc;
    }, {} as Record<string, Array<{nome: string; qtd?: number; valor: number; categoria?: string}>>);

    return grouped;
  };

  return (
    <div 
      className={`
        border-l-4 rounded-r-lg p-3 mb-2 transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}
        ${getStatusColor(currentStatus)}
      `}
      onClick={isClickable ? () => setIsExpanded(!isExpanded) : undefined}
    >
      {/* Header do Item */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-sm font-bold">{item.qtd}</span>
          <span className="text-sm">·</span>
          <span className="text-sm font-bold text-gray-900 uppercase">{item.nome}</span>
        </div>
        
        {isClickable && (
          <div className="flex items-center gap-2">
            {getStatusIcon(currentStatus)}
            <span className="text-xs font-medium text-gray-600">
              {getStatusLabel(currentStatus)}
            </span>
          </div>
        )}
      </div>

      {/* Adicionais */}
      {item.adicionais && item.adicionais.length > 0 && (
        <div className="ml-4 mt-1 space-y-1">
          {Object.entries(groupAdicionaisByCategory(item.adicionais)).map(([categoria, adicionaisCategoria]) => (
            <div key={categoria} className="border-l-2 border-orange-200 pl-2 bg-orange-50/30 rounded-r">
              <div className="text-xs font-bold text-orange-700 uppercase">
                {categoria}:
              </div>
              {adicionaisCategoria.map((adc, i) => (
                <div key={i} className="text-xs font-semibold text-gray-700 uppercase">
                  + {adc.qtd ? `${adc.qtd} ` : ''}{adc.nome}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Observações do item */}
      {item.observacoes && item.observacoes.trim() && (
        <div className="ml-4 mt-1">
          <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1">
            <span className="text-xs font-bold text-orange-800">🗒️ {item.observacoes}</span>
          </div>
        </div>
      )}

      {/* Controles expandidos */}
      {isClickable && isExpanded && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {['pendente', 'em_producao', 'pronto', 'entregue'].map((status) => (
              <Button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusUpdate(status as ItemStatus);
                }}
                disabled={loading || currentStatus === status}
                size="sm"
                variant={currentStatus === status ? "default" : "outline"}
                className="text-xs"
              >
                {getStatusIcon(status as ItemStatus)}
                <span className="ml-1">{getStatusLabel(status as ItemStatus)}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Botão de próximo status (quando não expandido) */}
      {isClickable && !isExpanded && getNextStatus(currentStatus) && (
        <div className="mt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              const nextStatus = getNextStatus(currentStatus);
              if (nextStatus) {
                handleStatusUpdate(nextStatus);
              }
            }}
            disabled={loading}
            size="sm"
            className="text-xs w-full"
          >
            {loading ? 'Atualizando...' : `Marcar como ${getStatusLabel(getNextStatus(currentStatus)!)}`}
          </Button>
        </div>
      )}
    </div>
  );
};