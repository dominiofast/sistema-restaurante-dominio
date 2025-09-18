import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddressSearchFlow } from './AddressSearchFlow';
import { CustomerAddress } from '@/types/address';

export const AddressSearchExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);

  const handleAddressConfirm = (address: CustomerAddress) => {;
    console.log('Endereço selecionado:', address);
    setSelectedAddress(address);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Exemplo de Busca de Endereço</h2>
      
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="w-full mb-4"
      >
        Abrir Busca de Endereço
      </Button>

      {selectedAddress && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Endereço Selecionado:</h3>
          <p className="text-sm">
            <strong>CEP:</strong> {selectedAddress.cep}<br />
            <strong>Rua:</strong> {selectedAddress.logradouro}<br />
            <strong>Número:</strong> {selectedAddress.numero}<br />
            <strong>Bairro:</strong> {selectedAddress.bairro}<br />
            {selectedAddress.cidade && selectedAddress.estado && (
              <>
                <strong>Cidade/Estado:</strong> {selectedAddress.cidade}/{selectedAddress.estado}<br />
              </>
            )}
            {selectedAddress.complemento && (
              <>
                <strong>Complemento:</strong> {selectedAddress.complemento}<br />
              </>
            )}
          </p>
        </div>
      )}

      <AddressSearchFlow
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddressConfirm}
        customerName="João Silva"
        customerPhone="11999999999"
        primaryColor="#f97316"
      />
    </div>
  );
};
