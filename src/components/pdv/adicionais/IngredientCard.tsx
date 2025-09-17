import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface IngredientCardProps {
  adicional: any;
  categoria: any;
  selectedQuantity: number;
  onClick: () => void;
  onQuantityChange?: (adicionalId: string, categoria: any, quantidade: number) => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  adicional,
  categoria,
  selectedQuantity,
  onClick,
  onQuantityChange
}) => {
  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuantityChange && selectedQuantity > 0) {
      onQuantityChange(adicional.id, categoria, selectedQuantity - 1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuantityChange) {
      onQuantityChange(adicional.id, categoria, selectedQuantity + 1);
    }
  };

  const isQuantitySelection = categoria.selection_type === 'quantity' || 
                             (categoria.selection_type === 'multiple' && categoria.max_selection > 1);

  return (
    <div
      className={`border-2 rounded-lg p-2 bg-white transition-all duration-200 h-20 w-full relative ${
        selectedQuantity > 0
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <div className="flex flex-col h-full justify-between" onClick={onClick}>
        <div className="font-semibold text-xs text-gray-800 overflow-hidden leading-tight mb-1">
          <div className="line-clamp-2 break-words">{adicional.name}</div>
        </div>
        {adicional.price > 0 && (
          <div className="text-green-600 text-xs font-bold mt-1">
            + R$ {adicional.price.toFixed(2)}
          </div>
        )}
        {selectedQuantity > 0 && (
          <div className="text-blue-600 text-xs font-bold mt-1">
            Qtd: {selectedQuantity}
          </div>
        )}
      </div>

      {/* Botões de quantidade para seleção múltipla/quantity */}
      {isQuantitySelection && onQuantityChange && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-white rounded-full shadow-md border border-gray-200 p-1">
          <button
            onClick={handleDecrease}
            disabled={selectedQuantity <= 0}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-xs font-bold min-w-[16px] text-center">{selectedQuantity}</span>
          <button
            onClick={handleIncrease}
            className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};