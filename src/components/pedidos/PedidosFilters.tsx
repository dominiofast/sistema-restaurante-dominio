
import React from 'react';
import { Search, Filter } from 'lucide-react';

interface PedidosFiltersProps {
  busca: string;
  setBusca: (value: string) => void;
  tipoSelecionado: string;
  setTipoSelecionado: (tipo: string) => void;
  onShowFilters: () => void;
  filtrosAtivos: boolean;
}

export const PedidosFilters: React.FC<PedidosFiltersProps> = ({
  busca,
  setBusca,
  tipoSelecionado,
  setTipoSelecionado,
  onShowFilters,
  filtrosAtivos
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou ID do pedido..."
            className="w-full pl-3 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder:text-gray-400"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        
        <button
          onClick={onShowFilters}
          className={`relative flex items-center justify-center gap-1 px-2 py-1.5 bg-white border text-gray-700 rounded-md hover:bg-gray-50 transition-all text-sm ${
            filtrosAtivos 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300'
          }`}
        >
          <Filter size={14} className={filtrosAtivos ? 'text-blue-600' : ''} />
          <span className="hidden sm:inline text-sm">Filtros</span>
          {filtrosAtivos && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
          )}
        </button>
      </div>
    </div>
  )
};
