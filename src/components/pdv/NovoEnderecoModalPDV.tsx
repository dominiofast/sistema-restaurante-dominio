
import React, { useState } from 'react';
import { CustomerAddress } from '@/hooks/useCustomerAddresses';
import { useAddressForm } from '@/hooks/useAddressForm';

interface NovoEnderecoModalPDVProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: CustomerAddress) => void;
  customerName?: string;
  customerPhone?: string;
  editingAddress?: CustomerAddress | null;
}

export const NovoEnderecoModalPDV: React.FC<NovoEnderecoModalPDVProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  customerPhone,
  editingAddress
}) => {
  const [activeTab, setActiveTab] = useState('delivery')
  const {
    address,
    setAddress,
    loading,
    taxaEntrega,
    handleCepChange,
    handleSave
  } = useAddressForm(editingAddress, isOpen, customerName, customerPhone)

  const handleSalvar = async () => {
    console.log('=== INICIANDO PROCESSO DE SALVAMENTO DE ENDEREÇO ===')
    console.log('handleSalvar do modal chamado')
    console.log('Endereço no modal:', address)
    console.log('Customer name:', customerName)
    console.log('Customer phone:', customerPhone)
    
    try {
      console.log('=== CHAMANDO handleSave ===')
      const savedAddress = await handleSave()
      console.log('=== SUCESSO: Endereço salvo ===', savedAddress)
      
      console.log('Chamando onConfirm...')
      onConfirm(savedAddress)
      
      console.log('Fechando modal...')
      onClose()
    } catch (error) {
      console.error('=== ERRO NO SALVAMENTO DE ENDEREÇO ===')
      console.error('Tipo do erro:', typeof error)
      console.error('Erro completo:', error)
      console.error('Erro message:', error instanceof Error ? error.message : String(error))
      console.error('Erro stack:', error instanceof Error ? error.stack : 'Não há stack')
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar endereço. Tente novamente.';
      alert(errorMessage)

  };

  const handleAdicionarFormaEntrega = () => {
    console.log('handleAdicionarFormaEntrega chamado')
    // Por enquanto, vamos fazer a mesma ação do salvar
    handleSalvar()
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 relative">
        {/* Header com botão fechar */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Forma de entrega</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Tabs */}
          <div className="flex mb-4">
            <button
              onClick={() => setActiveTab('delivery')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-l-md border ${
                activeTab === 'delivery' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              [ E ] Entrega (delivery)
            </button>
            <button
              onClick={() => setActiveTab('pickup')}
              className={`flex-1 py-2 px-3 text-sm font-medium border-t border-b ${
                activeTab === 'pickup' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              [ R ] Retirar no local
            </button>
            <button
              onClick={() => setActiveTab('consume')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-r-md border ${
                activeTab === 'consume' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              [ C ] Consumir no local
            </button>
          </div>

          {/* Conteúdo baseado na aba ativa */}
          {activeTab === 'delivery' && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Novo endereço</h3>
              
              {/* CEP */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input
                  type="text"
                  value={address.cep || ''}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={9}
                  disabled={loading}
                />
              </div>

              {/* Rua */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                <input
                  type="text"
                  value={address.logradouro || ''}
                  onChange={(e) => setAddress({...address, logradouro: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Número e Complemento */}
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={address.numero || ''}
                    onChange={(e) => setAddress({...address, numero: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={address.complemento || ''}
                    onChange={(e) => setAddress({...address, complemento: e.target.value})}
                    placeholder="Em frente a padaria"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Bairro e Cidade */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    value={address.bairro || ''}
                    onChange={(e) => setAddress({...address, bairro: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    value={address.cidade || ''}
                    onChange={(e) => setAddress({...address, cidade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Botões Salvar e Cancelar */}
              <div className="flex gap-3 mb-4">
                <button 
                  onClick={handleSalvar}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  [ ENTER ] Salvar
                </button>
                <button 
                  onClick={onClose}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 border border-gray-300 font-medium text-sm"
                >
                  [ ESC ] Cancelar
                </button>
              </div>

              {/* Valor da taxa de entrega */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">[ V ] Valor da taxa de entrega:</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-700">$</span>
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-700 mr-1">R$</span>
                    <span className="text-lg font-medium text-gray-700">
                      {taxaEntrega.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pickup' && (
            <div className="mb-4 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Retirar no local</h3>
              <p className="text-gray-600">Cliente irá retirar o pedido no estabelecimento</p>
            </div>
          )}

          {activeTab === 'consume' && (
            <div className="mb-4 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Consumir no local</h3>
              <p className="text-gray-600">Cliente irá consumir o pedido no estabelecimento</p>
            </div>
          )}

          {/* Botão final */}
          <button 
            onClick={handleAdicionarFormaEntrega}
            disabled={loading}
            className="w-full bg-blue-400 text-white py-3 rounded-md hover:bg-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            [ ENTER ] Adicionar forma de entrega
          </button>
        </div>
      </div>
    </div>
  )
};
