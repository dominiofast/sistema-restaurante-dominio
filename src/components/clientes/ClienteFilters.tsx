import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type PedidosRange = 'todos' | 'nenhum' | '1-5' | '5+';

interface FilterState {
  // Período de cadastro
  cadastroDateFrom: string;
  cadastroDateTo: string;
  
  // Status de atividade (múltipla seleção)
  statusAtivos: boolean;
  statusInativos: boolean;
  statusPotenciais: boolean;
  
  // Período de nascimento
  nascimentoDateFrom: string;
  nascimentoDateTo: string;
  
  // Saldos negativos
  apenasNegativos: boolean;
  
  // Quantidade de pedidos
  pedidosRange: PedidosRange;
}

interface ClienteFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export const ClienteFilters: React.FC<ClienteFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  // Validação de data - garantir que "de" não seja posterior a "até"
  const handleCadastroDateFromChange = (value: string) => {
    const newFilters = { ...filters, cadastroDateFrom: value };
    // Se a data "até" já está preenchida e é anterior à nova data "de", limpar "até"
    if (filters.cadastroDateTo && value && value > filters.cadastroDateTo) {
      newFilters.cadastroDateTo = '';
    }
    onFiltersChange(newFilters);
  };

  const handleCadastroDateToChange = (value: string) => {
    // Se a data "de" está preenchida e é posterior à nova data "até", não permitir
    if (filters.cadastroDateFrom && value && value < filters.cadastroDateFrom) {
      return;
    }
    onFiltersChange({ ...filters, cadastroDateTo: value });
  };

  // Validação para data de nascimento
  const handleNascimentoDateFromChange = (value: string) => {
    const newFilters = { ...filters, nascimentoDateFrom: value };
    // Se a data "até" já está preenchida e é anterior à nova data "de", limpar "até"
    if (filters.nascimentoDateTo && value && value > filters.nascimentoDateTo) {
      newFilters.nascimentoDateTo = '';
    }
    onFiltersChange(newFilters);
  };

  const handleNascimentoDateToChange = (value: string) => {
    // Se a data "de" está preenchida e é posterior à nova data "até", não permitir
    if (filters.nascimentoDateFrom && value && value < filters.nascimentoDateFrom) {
      return;
    }
    onFiltersChange({ ...filters, nascimentoDateTo: value });
  };
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Período de Cadastro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período de Cadastro
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              placeholder="De"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.cadastroDateFrom}
              onChange={(e) => handleCadastroDateFromChange(e.target.value)}
            />
            <input
              type="date"
              placeholder="Até"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.cadastroDateTo}
              onChange={(e) => handleCadastroDateToChange(e.target.value)}
              min={filters.cadastroDateFrom || undefined}
            />
          </div>
        </div>

        {/* Status de Atividade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status de Atividade
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, statusAtivos: !filters.statusAtivos })}
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                filters.statusAtivos
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
              }`}
            >
              Ativos
            </button>
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, statusInativos: !filters.statusInativos })}
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                filters.statusInativos
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
              }`}
            >
              Inativos
            </button>
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, statusPotenciais: !filters.statusPotenciais })}
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                filters.statusPotenciais
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
              }`}
            >
              Potenciais
            </button>
          </div>
        </div>

        {/* Período de Nascimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nascimento
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              placeholder="De"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.nascimentoDateFrom}
              onChange={(e) => handleNascimentoDateFromChange(e.target.value)}
            />
            <input
              type="date"
              placeholder="Até"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.nascimentoDateTo}
              onChange={(e) => handleNascimentoDateToChange(e.target.value)}
              min={filters.nascimentoDateFrom || undefined}
            />
          </div>
        </div>

        {/* Quantidade de Pedidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade de Pedidos
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.pedidosRange}
            onChange={(e) => onFiltersChange({ ...filters, pedidosRange: e.target.value as PedidosRange })}
          >
            <option value="todos">Todos</option>
            <option value="nenhum">Nenhum pedido</option>
            <option value="1-5">1-5 pedidos</option>
            <option value="5+">5+ pedidos</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Checkbox para saldos negativos */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.apenasNegativos}
              onChange={(e) => onFiltersChange({ ...filters, apenasNegativos: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">Apenas saldos negativos</span>
          </label>
        </div>
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};