
import React from 'react';
import { TIPO_PEDIDO } from '@/constants/pedidos';

interface TipoPedidoFilterProps {
  tipoSelecionado: string;
  setTipoSelecionado: (tipo: string) => void;
}

export const TipoPedidoFilter: React.FC<TipoPedidoFilterProps> = ({
  tipoSelecionado,
  setTipoSelecionado
}) => {
  return (
    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
      {TIPO_PEDIDO.map(tipo => {
        const Icon = tipo.icon;
        return (
          <button
            key={tipo.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
              ${tipoSelecionado === tipo.key
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
            onClick={() => setTipoSelecionado(tipo.key)}
          >
            <Icon size={16} />
            {tipo.label}
          </button>
        )
      })}
    </div>
  )
};
