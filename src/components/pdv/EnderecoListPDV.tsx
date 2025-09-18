
import React, { useState, useEffect } from 'react';
import { useCustomerAddresses, CustomerAddress } from '@/hooks/useCustomerAddresses';
import { useAuth } from '@/contexts/AuthContext';
import { NovoEnderecoModalPDV } from './NovoEnderecoModalPDV';

interface EnderecoListPDVProps {
  customerPhone?: string;
  customerName?: string;
  onAddressSelect?: (address: CustomerAddress) => void;
  selectedAddress?: CustomerAddress | null;
}

export const EnderecoListPDV: React.FC<EnderecoListPDVProps> = ({
  customerPhone,
  customerName,
  onAddressSelect,
  selectedAddress
}) => {
  const { currentCompany } = useAuth()
  const { addresses, loading, fetchAddressesByPhone, deleteAddress } = useCustomerAddresses()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)

  useEffect(() => {
    if (customerPhone) {
      fetchAddressesByPhone(customerPhone, currentCompany?.id)
    }
  }, [customerPhone, currentCompany?.id])

  const handleEditAddress = (address: CustomerAddress) => {
    setEditingAddress(address)
    setModalOpen(true)
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Deseja excluir este endereço?')) {
      try {
        await deleteAddress(addressId)
        if (selectedAddress?.id === addressId) {
          onAddressSelect?.(null)
        }
       } catch (error) {
        console.error('Erro ao excluir endereço:', error)
      }
    }
  };

  const handleNewAddress = () => {
    setEditingAddress(null)
    setModalOpen(true)
  };

  const handleConfirmAddress = (address: CustomerAddress) => {
    console.log('handleConfirmAddress chamado com:', address)
    console.log('Selecionando endereço...')
    onAddressSelect?.(address)
    
    console.log('Fechando modal...')
    setModalOpen(false)
    setEditingAddress(null)
    
    console.log('Atualizando lista de endereços...')
    if (customerPhone) {
      fetchAddressesByPhone(customerPhone, currentCompany?.id)
    }
    console.log('handleConfirmAddress concluído')
  };

  if (loading) {
    return (
      <div className="mb-4 text-center text-gray-500">
        Carregando endereços...
      </div>
    )


  return (
    <>
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <button 
            className="border rounded px-3 py-1 text-blue-700 font-semibold hover:bg-blue-50"
            onClick={handleNewAddress}
          >
            [ N ] Novo
          </button>
          <button 
            className="border rounded px-3 py-1 text-blue-700 font-semibold hover:bg-blue-50"
            disabled={!selectedAddress}
            onClick={() => selectedAddress && handleEditAddress(selectedAddress)}
          >
            [ Q ] Editar
          </button>
          <button 
            className="border rounded px-3 py-1 text-red-600 font-semibold hover:bg-red-50"
            disabled={!selectedAddress}
            onClick={() => selectedAddress?.id && handleDeleteAddress(selectedAddress.id)}
          >
            [ W ] Excluir
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          {addresses.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Nenhum endereço cadastrado</p>
              <p className="text-sm">Clique em "Novo" para adicionar</p>
            </div>
          ) : (
            addresses.map(endereco => (
              <button
                key={endereco.id}
                className={`border rounded px-3 py-2 text-left transition-colors ${
                  selectedAddress?.id === endereco.id
                    ? 'bg-blue-100 border-blue-600 font-bold' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onAddressSelect?.(endereco)}
              >
                <div className="font-medium">
                  {endereco.logradouro}, {endereco.numero}
                </div>
                <div className="text-sm text-gray-600">
                  {endereco.complemento && `${endereco.complemento} - `}
                  {endereco.bairro}
                  {endereco.cidade && endereco.estado && `, ${endereco.cidade}/${endereco.estado}`}
                  {endereco.cep && ` - ${endereco.cep}`}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <NovoEnderecoModalPDV
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingAddress(null)
        }}
        onConfirm={handleConfirmAddress}
        customerName={customerName}
        customerPhone={customerPhone}
        editingAddress={editingAddress}
      />
    </>
  )
};
