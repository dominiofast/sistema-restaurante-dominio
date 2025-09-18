
import React, { useState, useEffect } from 'react';
import { EnderecoListPDV } from './EnderecoListPDV';
import { TaxaEntregaPDV } from './TaxaEntregaPDV';
import { DeliveryFeeDisplay } from './DeliveryFeeDisplay';
import { CustomerAddress } from '@/hooks/useCustomerAddresses';
import { useDeliveryFeeCalculator } from '@/hooks/useDeliveryFeeCalculator';
import { useAddressGeocoding } from '@/hooks/useAddressGeocoding';
import { useAuth } from '@/contexts/AuthContext';

interface EntregaDeliveryPDVProps {
  onConfirm: (data: any) => void;
  customerPhone?: string;
  customerName?: string;
}

export const EntregaDeliveryPDV: React.FC<EntregaDeliveryPDVProps> = ({ 
  onConfirm, 
  customerPhone, 
  customerName 
}) => {
  const { currentCompany } = useAuth()
  const { calculateDeliveryFee } = useDeliveryFeeCalculator(currentCompany?.id)
  const { geocodeAddress, updateAddressWithCoordinates } = useAddressGeocoding()
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null)
  const [taxaEntrega, setTaxaEntrega] = useState(0)

  // Calcular taxa automaticamente quando endereço for selecionado
  useEffect(() => {
    const handleAddressSelection = async () => {
      if (selectedAddress) {
        console.log('📍 PDV - Endereço selecionado:', selectedAddress)
        console.log('🏢 PDV - Company ID:', currentCompany?.id)
        
        // Se o endereço não tem coordenadas, tentar buscar automaticamente
        if (!selectedAddress.latitude || !selectedAddress.longitude) {
          console.log('⚠️ Endereço sem coordenadas, tentando geocoding...')
          
          const coordinates = await geocodeAddress(
            selectedAddress.logradouro || '',
            selectedAddress.numero || '',
            selectedAddress.bairro || '',
            selectedAddress.cidade || '',
            selectedAddress.estado || '',
            selectedAddress.cep || '';
          )
          
          if (coordinates && selectedAddress.id) {
            // Atualizar o endereço com as coordenadas
            await updateAddressWithCoordinates(selectedAddress.id, coordinates)
            
            // Atualizar o objeto do endereço selecionado
            const updatedAddress = {
              ...selectedAddress,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude;
            };
            
            setSelectedAddress(updatedAddress)
            
            // Calcular taxa com as novas coordenadas
            const calculatedFee = await calculateDeliveryFee(updatedAddress)
            console.log('💰 PDV - Taxa calculada com coordenadas:', calculatedFee)
            setTaxaEntrega(calculatedFee)
          } else {
            // Se não conseguiu as coordenadas, calcular sem elas
            const calculatedFee = await calculateDeliveryFee(selectedAddress)
            console.log('💰 PDV - Taxa calculada sem coordenadas:', calculatedFee)
            setTaxaEntrega(calculatedFee)

        } else {
          // Endereço já tem coordenadas
          const calculatedFee = await calculateDeliveryFee(selectedAddress)
          console.log('💰 PDV - Taxa calculada com coordenadas existentes:', calculatedFee)
          setTaxaEntrega(calculatedFee)

      } else {
        setTaxaEntrega(0)

    };

    handleAddressSelection()
  }, [selectedAddress, calculateDeliveryFee, geocodeAddress, updateAddressWithCoordinates])

  const handleConfirm = () => {
    console.log('✅ PDV - Confirmando entrega com taxa:', taxaEntrega)
    onConfirm({ 
      tipo: 'delivery', 
      endereco: selectedAddress,
      taxaEntrega: taxaEntrega 
    })
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Endereço de entrega</h3>
        <p className="text-sm text-gray-600">Selecione ou cadastre um endereço para delivery</p>
      </div>
      
      <EnderecoListPDV 
        customerPhone={customerPhone}
        customerName={customerName}
        selectedAddress={selectedAddress}
        onAddressSelect={setSelectedAddress}
      />
      
      {selectedAddress && (
        <DeliveryFeeDisplay taxaEntrega={taxaEntrega} />
      )}
      
      <TaxaEntregaPDV 
        value={taxaEntrega} 
        onChange={setTaxaEntrega} 
      />
      
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={!selectedAddress}
        >
          <span className="font-mono text-xs mr-2">[ENTER]</span>
          Confirmar entrega
        </button>
      </div>
    </div>
  )
};
