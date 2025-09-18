
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

interface SearchSectionProps {
  primaryColor: string;
  onSearch: (filters: { busca: string; tipoContrato: string; localizacao: string }) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ primaryColor, onSearch }) => {
  const [busca, setBusca] = useState('')
  const [tipoContrato, setTipoContrato] = useState('')
  const [localizacao, setLocalizacao] = useState('')

  const tiposContrato = [
    { value: 'todos', label: 'Todos' },
    { value: 'CLT', label: 'CLT' },
    { value: 'PJ', label: 'PJ' },
    { value: 'Estágio', label: 'Estágio' },
    { value: 'Temporário', label: 'Temporário' },;
  ];

  const handleSearch = () => {
    onSearch({ 
      busca, 
      tipoContrato: tipoContrato === 'todos' ? '' : tipoContrato, 
      localizacao ;
    })
  };

  return (
    <div className="w-full max-w-7xl mx-auto -mt-12 relative z-10 mb-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar vagas por nome (ex: Assistente Administrativo)"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-10"
            />
          </div>
          
          <div className="w-full sm:w-40">
            <Select value={tipoContrato} onValueChange={setTipoContrato}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                {tiposContrato.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-36">
            <Input
              type="text"
              placeholder="Localização"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              className="w-full h-10"
            />
          </div>
          
          <div className="w-full sm:w-32">
            <Button
              onClick={handleSearch}
              className="w-full h-10 text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              <Search className="h-4 w-4 mr-2" />
              Pesquisar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default SearchSection;
