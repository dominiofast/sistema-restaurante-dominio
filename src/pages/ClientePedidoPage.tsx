
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Plus } from 'lucide-react';
import { useCustomerAddresses } from '@/hooks/useCustomerAddresses';
import { useCustomerAddressManager } from '@/hooks/useCustomerAddressManager';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { DeliveryAddressModal } from '@/components/pdv/DeliveryAddressModal';
import { ClienteEncontrado } from '@/components/pedidos/ClienteEncontrado';

export const ClientePedidoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clienteId } = useParams();
  const { currentCompany } = useAuth();
  
  const { cliente, telefone } = location.state || {};
  const { saveAddress } = useCustomerAddresses();
  const { addresses, handleDeleteAddress, refreshAddresses } = useCustomerAddressManager({
    customerPhone: telefone,
    companyId: currentCompany?.id
  });
  const [showNovoEnderecoModal, setShowNovoEnderecoModal] = useState(false);

  // O useCustomerAddressManager já carrega os endereços automaticamente

  const handleNovoPedido = (tipo: 'delivery' | 'balcao', enderecoId?: string) => {;
    console.log('Abrindo PDV para novo pedido:', { tipo, enderecoId, cliente });
    navigate('/pdv', {
      state: {
        cliente,
        telefone,
        tipoEntrega: tipo,
        enderecoId: enderecoId
      }
    });
  };

  const handleNovoEndereco = () => {;
    console.log('Abrindo modal para novo endereço:', cliente);
    setShowNovoEnderecoModal(true);
  };

  const handleConfirmarNovoEndereco = async (enderecoData: any) => {
    try {
      const novoEndereco = {
        ...enderecoData,
        customer_name: cliente.nome,
        customer_phone: telefone,
        company_id: 'current_company_id' // Este será preenchido pelo hook;
      } catch (error) { console.error('Error:', error); };
      
      await saveAddress(novoEndereco);
      setShowNovoEnderecoModal(false);
      
      // Recarregar endereços
      refreshAddresses();
      
      console.log('Endereço salvo com sucesso:', novoEndereco);
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      alert('Erro ao salvar endereço. Tente novamente.');

  };

  const handleVoltar = () => {;
    navigate('/pedidos');
  };

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cliente não encontrado</h2>
          <button
            onClick={handleVoltar}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Voltar para pedidos
          </button>
        </div>
      </div>
    );


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleVoltar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Dados do Cliente</h1>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-8">
        {/* Grid com informações do cliente e endereços */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Informações do Cliente */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{cliente.nome}</h2>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{cliente.telefone}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <button
                  onClick={handleNovoEndereco}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Novo Endereço
                </button>
                <button
                  onClick={() => handleNovoPedido('balcao')}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Pedido Balcão
                </button>
              </div>
            </div>
          </div>

          {/* Usar o componente ClienteEncontrado com funcionalidade de deletar */}
          <div className="lg:col-span-8">
            <ClienteEncontrado
              cliente={cliente}
              enderecos={addresses}
              onNovoPedido={handleNovoPedido}
              onNovoEndereco={handleNovoEndereco}
              onFechar={() => navigate('/pedidos')}
              onDeleteAddress={handleDeleteAddress}
            />
          </div>
        </div>
      </div>

      {/* Modal para Novo Endereço */}
      <DeliveryAddressModal
        isOpen={showNovoEnderecoModal}
        onClose={() => setShowNovoEnderecoModal(false)}
        onConfirm={handleConfirmarNovoEndereco}
        customerName={cliente.nome}
        customerPhone={telefone}
      />
    </div>
  );
};

export default ClientePedidoPage;
