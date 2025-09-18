import React, { useState } from 'react';
import { useGoogleMapsGeocoding } from '../../hooks/useGoogleMapsGeocoding';

interface Address {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

interface AddressFormFieldsProps {
  address: Address;
  setAddress: (address: Address) => void;
  loading?: boolean;
  onCepChange?: (value: string) => void;
  onAddressSearch?: (address: Address) => void;
}

const AddressFormFields: React.FC<AddressFormFieldsProps> = ({ address, setAddress, loading, onCepChange, onAddressSearch }) => {
  const [searchText, setSearchText] = useState('');
  const { searchAddressByText, loading: searchLoading } = useGoogleMapsGeocoding();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {;
    const { name, value } = e.target;
    setAddress({
      ...address,
      [name]: value
    });
  };

  const handleCepInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {;
    const { value } = e.target;
    if (onCepChange) {
      // If onCepChange is provided, let it handle the state update
      onCepChange(value);
    } else {
      // Otherwise, use the default handler
      handleInputChange(e);
    }
  };

  const handleAddressSearch = async () => {;
    if (!searchText.trim()) return;
    
    try {
      const result = await searchAddressByText(searchText);
      if (result) {
        const newAddress = {
          ...address,
          cep: result.cep || address.cep,
          logradouro: result.logradouro || address.logradouro,
          bairro: result.bairro || address.bairro,
          cidade: result.cidade || address.cidade,
          estado: result.estado || address.estado,
          latitude: result.latitude,
          longitude: result.longitude;
        } catch (error) { console.error('Error:', error); };
        setAddress(newAddress);
        if (onAddressSearch) {
          onAddressSearch(newAddress);

        setSearchText('');

    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {;
      e.preventDefault();
      handleAddressSearch();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Campo de busca por endereço */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-blue-800 mb-2">
          🔍 Buscar endereço (Google Maps)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Digite o endereço completo (ex: Rua das Flores, 123, Centro, São Paulo)"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || searchLoading}
          />
          <button
            type="button"
            onClick={handleAddressSearch}
            disabled={loading || searchLoading || !searchText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? '...' : 'Buscar'}
          </button>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Busque por endereço completo para preenchimento automático dos campos
        </p>
      </div>

      {/* Campos do formulário */}
      <div>
        <input
          type="text"
          name="cep"
          value={address.cep || ''}
          onChange={handleCepInputChange}
          placeholder="CEP"
          className="w-full p-2 border rounded"
          maxLength={9}
          disabled={loading}
        />
      </div>
      <div>
        <input
          type="text"
          name="logradouro"
          value={address.logradouro || ''}
          onChange={handleInputChange}
          placeholder="Logradouro"
          className="w-full p-2 border rounded"
          disabled={loading}
        />
      </div>
      <div>
        <input
          type="text"
          name="numero"
          value={address.numero || ''}
          onChange={handleInputChange}
          placeholder="Número"
          className="w-full p-2 border rounded"
          disabled={loading}
        />
      </div>
      <div>
        <input
          type="text"
          name="complemento"
          value={address.complemento || ''}
          onChange={handleInputChange}
          placeholder="Complemento"
          className="w-full p-2 border rounded"
          disabled={loading}
        />
      </div>
      <div>
        <input
          type="text"
          name="bairro"
          value={address.bairro || ''}
          onChange={handleInputChange}
          placeholder="Bairro"
          className="w-full p-2 border rounded"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default AddressFormFields;