
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { useCustomerAddresses, CustomerAddress } from '@/hooks/useCustomerAddresses';
import { DeliveryAddressModal } from './DeliveryAddressModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerAddressSelectorProps {
  customerPhone: string;
  customerName: string;
  selectedAddress: CustomerAddress | null;
  onAddressSelect: (address: CustomerAddress | null) => void;
  onCustomerNameChange?: (name: string) => void;
}

export const CustomerAddressSelector: React.FC<CustomerAddressSelectorProps> = ({
  customerPhone,
  customerName,
  selectedAddress,
  onAddressSelect,
  onCustomerNameChange
}) => {
  const { addresses, loading, fetchAddressesByPhone, deleteAddress } = useCustomerAddresses();
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const { currentCompany } = useAuth();

  useEffect(() => {
    async function buscarOuCadastrarCliente() {
      if (customerPhone) {
        // Limpar telefone removendo caracteres especiais
        const telefoneNumeros = customerPhone.replace(/\D/g, '');
        
        console.log('🔍 Buscando cliente no PDV com telefone:', telefoneNumeros);
        
        // Buscar cliente pelo telefone
        const { data: clientes, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('telefone', telefoneNumeros)
          .limit(1);
          
        if (!error && clientes && clientes.length > 0) {
          console.log('✅ Cliente encontrado no PDV:', clientes[0]);
          // Se existe, preencher nome automaticamente
          const nome = clientes[0].nome || 'Cliente';
          if (onCustomerNameChange) onCustomerNameChange(nome);
        } else if (!error && clientes && clientes.length === 0 && telefoneNumeros.length >= 8 && currentCompany?.id) {
          console.log('📝 Cadastrando novo cliente no PDV');
          
          // Se não existe, cadastrar novo cliente
          const { data: novoCliente, error: insertError } = await supabase
            .from('clientes')
            .insert({ nome: customerName || 'Cliente', telefone: telefoneNumeros, company_id: currentCompany.id })
            .select()
            .single();
            
          if (!insertError && novoCliente) {
            console.log('✅ Cliente cadastrado no PDV:', novoCliente);
          }
        }
      }
      fetchAddressesByPhone(customerPhone, currentCompany?.id);
    }
    buscarOuCadastrarCliente();
  }, [customerPhone]);

  const handleNewAddress = (newAddress: any) => {
    const addressWithId = {
      ...newAddress,
      id: Date.now().toString(),
      customer_name: customerName,
      customer_phone: customerPhone
    };
    
    onAddressSelect(addressWithId);
    setShowNewAddressModal(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Deseja excluir este endereço?')) {
      try {
        await deleteAddress(addressId);
        if (selectedAddress?.id === addressId) {
          onAddressSelect(null);
        }
      } catch (error) {
        console.error('Erro ao excluir endereço:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Carregando endereços...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Endereços de Entrega</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowNewAddressModal(true)}
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Plus size={16} className="mr-1" />
          Novo
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <MapPin size={24} className="mx-auto mb-2 text-gray-300" />
          <p>Nenhum endereço cadastrado</p>
          <p className="text-sm">Clique em "Novo" para adicionar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedAddress?.id === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="font-medium text-sm">
                      {address.logradouro}, {address.numero}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {address.complemento && (
                      <p>{address.complemento}</p>
                    )}
                    <p>{address.bairro}{address.cidade && address.estado && ` - ${address.cidade}/${address.estado}`}</p>
                    {address.cep && <p>CEP: {address.cep}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id!);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeliveryAddressModal
        isOpen={showNewAddressModal}
        onClose={() => setShowNewAddressModal(false)}
        onConfirm={handleNewAddress}
        customerName={customerName}
        customerPhone={customerPhone}
      />
    </div>
  );
};
