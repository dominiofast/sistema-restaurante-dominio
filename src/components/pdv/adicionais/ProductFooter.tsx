import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Produto } from '@/types/cardapio';

interface ProductFooterProps {
  produto: Produto;
  quantidade: number;
  precoTotal: number;
  isAddToCartEnabled: boolean;
  hasRequiredCategories: boolean;
  onQuantidadeChange: (quantidade: number) => void;
  onSave: () => void;
  onClose: () => void;
}

export const ProductFooter: React.FC<ProductFooterProps> = ({
  produto,
  quantidade,
  precoTotal,
  isAddToCartEnabled,
  hasRequiredCategories,
  onQuantidadeChange,
  onSave,
  onClose
}) => {
  return (
    <div className="border-t bg-gray-50 p-4">
      {!isAddToCartEnabled && hasRequiredCategories && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center gap-1">
          <span>⚠️</span>
          <span>Selecione itens obrigatórios</span>
        </div>
      )}

      {/* Informações do produto na parte inferior */}
      <div className="bg-white rounded-lg p-3 border-2 border-gray-200 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{produto.name}</h3>
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onQuantidadeChange(Math.max(1, quantidade - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors font-bold"
                >
                  -
                </button>
                <span className="font-bold text-xl w-10 text-center text-gray-800">{quantidade}</span>
                <button
                  onClick={() => onQuantidadeChange(quantidade + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              R$ {precoTotal.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Botões de ação - nos cantos */}
      <div className="flex justify-between items-end">
        <button
          onClick={onClose}
          className="py-3 px-6 rounded-lg font-bold text-base transition-all duration-200 bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
        >
          VOLTAR
        </button>
        
        <button
          onClick={onSave}
          disabled={!isAddToCartEnabled}
          className={`py-3 px-6 rounded-lg font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg ${
            isAddToCartEnabled 
              ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]' 
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          SALVAR
        </button>
      </div>
    </div>
  );
};