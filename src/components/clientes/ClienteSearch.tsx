
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ClienteSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
  totalRecords: number;
}

export const ClienteSearch: React.FC<ClienteSearchProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  totalRecords
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  };
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
          <Input
            placeholder="Pesquise por cliente ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 placeholder:text-gray-500"
          />
        </div>
        <Button 
          onClick={onSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Pesquisar
        </Button>
      </div>
      <div className="text-gray-700 mb-2">Total de registros {totalRecords}</div>
    </>
  )
};
