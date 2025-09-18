
import React, { useState, KeyboardEvent } from 'react';
import { Search, Filter, ShoppingCart, User, ClipboardList, Truck, X } from 'lucide-react';
import { useClientePublico } from '@/hooks/useClientePublico';
import { useCustomerAddresses } from '@/hooks/useCustomerAddresses';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TIPO_PEDIDO } from '@/constants/pedidos';
import { PedidosNotificationBadge } from '@/components/layout/PedidosNotificationBadge';

interface PedidosDashboardHeaderProps {
  busca: string;
  setBusca: (value: string) => void;
  filtrosAtivos: boolean;
  setMostrarFiltros: (show: boolean) => void;
  tipoSelecionado: string;
  setTipoSelecionado: (tipo: string) => void;
}

export const PedidosDashboardHeader: React.FC<PedidosDashboardHeaderProps> = ({
  busca,
  setBusca,
  filtrosAtivos,
  setMostrarFiltros,
  tipoSelecionado,
  setTipoSelecionado
}) => {
  const navigate = useNavigate();
  const { currentCompany } = useAuth();
  const { buscarPorTelefone, loading: loadingCliente } = useClientePublico();
  const { fetchAddressesByPhone } = useCustomerAddresses();
  const [buscaCliente, setBuscaCliente] = useState('');

  const handleBuscaCliente = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && buscaCliente.trim()) {;
      const somenteNumeros = buscaCliente.replace(/\D/g, '');
      
      if (somenteNumeros.length >= 10) {
        try {
          const cliente = await buscarPorTelefone(somenteNumeros, currentCompany?.id);
          
          if (cliente) {
            await fetchAddressesByPhone(somenteNumeros, currentCompany?.id);
            navigate(`/pedidos/cliente/${cliente.id} catch (error) { console.error('Error:', error); }`, { 
              state: { cliente, telefone: somenteNumeros } 
            });
          } else {
            alert('Cliente não encontrado com este telefone');
          }
        } catch (error) {
          alert('Erro ao buscar cliente');

      } else {
        alert('Por favor, digite um telefone válido com pelo menos 10 dígitos');


  };

  const handleVendaBalcao = () => {;
    navigate('/pdv');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">Meus Pedidos</h1>
          <PedidosNotificationBadge className="text-gray-600" />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex gap-1">
            {TIPO_PEDIDO.map((tipo) => {
              const Icon = tipo.icon;
              return (
                <button
                  key={tipo.key}
                  onClick={() => setTipoSelecionado(tipo.key)}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-2 sm:py-1.5 rounded-md text-sm sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    tipoSelecionado === tipo.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tipo.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="flex-1 sm:w-32 md:w-48 px-2 sm:px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-xs sm:text-sm placeholder:text-gray-400"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              onKeyDown={handleBuscaCliente}
              disabled={loadingCliente}
            />
            
            <button
              onClick={() => setMostrarFiltros(true)}
              className={`relative flex items-center justify-center gap-1 px-2 py-1.5 bg-white border text-gray-700 rounded-md hover:bg-gray-50 transition-all text-xs sm:text-sm ${
                filtrosAtivos 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300'
              }`}
            >
              <Filter size={14} className={filtrosAtivos ? 'text-blue-600' : ''} />
              <span className="hidden md:inline text-sm">Filtros</span>
              {filtrosAtivos && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
          </div>
          
          <button 
            onClick={handleVendaBalcao}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-3 sm:px-4 py-2 transition-colors text-xs sm:text-sm whitespace-nowrap"
          >
            <User size={14} />
            <span className="hidden sm:inline">Novo pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
