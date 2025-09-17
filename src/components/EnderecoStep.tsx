
import React, { useState, useEffect } from 'react';
import { AlertCircle, X, MapPin, Search } from 'lucide-react';
import { useCompanyAddress } from '../hooks/useCompanyAddress';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleMapsConfig } from '../hooks/useGoogleMapsConfig';
import GoogleMapRaio from './GoogleMapRaio';

export default function EnderecoStep() {
  const auth = useAuth();
  const companyId = auth?.currentCompany?.id;
  const { address, loading, saveAddress, fetchAddressByCep, error } = useCompanyAddress();
  const { apiKey } = useGoogleMapsConfig();
  const [alerta, setAlerta] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    cidade: '',
    estado: '',
    bairro: '',
    complemento: '',
    referencia: '',
    mostrarEndereco: 'false',
    informarLatLng: 'false',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    if (address) {
      console.log('Preenchendo formulário com dados do endereço:', address);
      setForm({
        cep: address.cep || '',
        logradouro: address.logradouro || '',
        numero: address.numero || '',
        cidade: address.cidade || '',
        estado: address.estado || '',
        bairro: address.bairro || '',
        complemento: address.complemento || '',
        referencia: address.referencia || '',
        mostrarEndereco: address.hide_from_customers ? 'true' : 'false',
        informarLatLng: address.manual_coordinates ? 'true' : 'false',
        latitude: address.latitude ? address.latitude.toString() : '',
        longitude: address.longitude ? address.longitude.toString() : ''
      });
      
      // Atualizar coordenadas para o mapa
      if (address.latitude && address.longitude) {
        setCoordenadas({ lat: address.latitude, lng: address.longitude });
      }
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    setForm(prev => ({ ...prev, cep }));

    // Buscar automaticamente quando CEP estiver completo
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setBuscandoCep(true);
      try {
        const addressData = await fetchAddressByCep(cleanCep);
        if (addressData) {
          setForm(prev => ({
            ...prev,
            logradouro: addressData.logradouro,
            bairro: addressData.bairro,
            cidade: addressData.cidade,
            estado: addressData.estado
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // Função para buscar coordenadas do endereço usando a API do Google Maps
  const buscarCoordenadasEndereco = async () => {
    if (!form.logradouro || !form.cidade || !form.estado) {
      alert('Preencha pelo menos logradouro, cidade e estado para buscar as coordenadas');
      return;
    }

    setBuscandoEndereco(true);
    try {
      const enderecoCompleto = `${form.logradouro}, ${form.numero}, ${form.bairro}, ${form.cidade}, ${form.estado}`;
      console.log('Buscando coordenadas para:', enderecoCompleto);

      // Verificar se temos a API key
      if (!apiKey) {
        alert('API key do Google Maps não configurada');
        return;
      }

      const encodedAddress = encodeURIComponent(enderecoCompleto + ', Brasil');
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const novasCoordenadas = { lat: location.lat, lng: location.lng };
        
        setCoordenadas(novasCoordenadas);
        setForm(prev => ({
          ...prev,
          latitude: location.lat.toString(),
          longitude: location.lng.toString()
        }));
        
        console.log('Coordenadas encontradas:', novasCoordenadas);
        console.log('Endereço formatado pelo Google:', data.results[0].formatted_address);
      } else {
        console.warn('Google Maps API status:', data.status);
        console.warn('Google Maps API error:', data.error_message);
        
        if (data.status === 'ZERO_RESULTS') {
          alert('Endereço não encontrado. Verifique se o endereço está correto.');
        } else if (data.status === 'OVER_QUERY_LIMIT') {
          alert('Limite de consultas à API excedido. Tente novamente mais tarde.');
        } else {
          alert('Não foi possível encontrar as coordenadas para este endereço. Verifique se está correto.');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      alert('Erro ao buscar coordenadas. Tente novamente.');
    } finally {
      setBuscandoEndereco(false);
    }
  };

  const handleSalvar = async () => {
    if (!companyId) {
      console.error('Company ID não encontrado');
      return;
    }

    console.log('Iniciando salvamento do endereço');
    setSalvo(true);
    
    const addressData = {
      cep: form.cep.trim(),
      logradouro: form.logradouro.trim(),
      numero: form.numero.trim(),
      complemento: form.complemento.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado.trim(),
      referencia: form.referencia.trim(),
      hide_from_customers: form.mostrarEndereco === 'true',
      manual_coordinates: form.informarLatLng === 'true',
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined
    };
    
    console.log('Dados do formulário a serem salvos:', addressData);
    
    const success = await saveAddress(addressData);
    if (success) {
      console.log('Endereço salvo com sucesso');
      setTimeout(() => setSalvo(false), 3000);
    } else {
      console.error('Erro ao salvar endereço');
      setSalvo(false);
    }
  };

  if (loading) return <div className="text-center text-slate-400 py-8">Carregando endereço...</div>;

  return (
    <div>
      <p className="text-gray-600 mb-4">Preencha o endereço do seu estabelecimento</p>

      {error && (
        <div className="flex items-center bg-red-50 rounded-lg px-4 py-3 mb-6 border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
          <span className="font-medium text-red-800">{error}</span>
        </div>
      )}

      {alerta && (
        <div className="flex items-center bg-blue-50 rounded-lg px-4 py-3 mb-6 border border-blue-200">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
          <span className="font-medium text-blue-800">Atenção! Existem campos obrigatórios nesta sessão.</span>
          <button 
            className="ml-auto text-blue-600 hover:text-blue-800 p-1" 
            onClick={() => setAlerta(false)}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* CEP */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            CEP <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="cep"
              value={form.cep}
              onChange={handleCepChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="00000-000"
              maxLength={9}
            />
            {buscandoCep && (
              <div className="absolute right-3 top-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Digite o CEP para que outras informações sejam preenchidas automaticamente</p>
        </div>

        {/* Logradouro e Número */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Logradouro (rua, avenida, etc.) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="logradouro"
              value={form.logradouro}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Cidade e Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cidade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={2}
              placeholder="Ex: SP"
              required
            />
          </div>
        </div>

        {/* Bairro e Referência */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bairro <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Referência
            </label>
            <input
              type="text"
              name="referencia"
              value={form.referencia}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Próximo ao mercado"
            />
          </div>
        </div>

        {/* Complemento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Complemento
          </label>
          <input
            type="text"
            name="complemento"
            value={form.complemento}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: apartamento, sala, andar"
          />
        </div>

        {/* Opções */}
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deseja ocultar o endereço para seus clientes? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Seu endereço aparece nas informações do seu estabelecimento no Cardápio Digital
            </p>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="mostrarEndereco"
                  value="true"
                  checked={form.mostrarEndereco === "true"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Sim</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="mostrarEndereco"
                  value="false"
                  checked={form.mostrarEndereco === "false"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Não</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deseja informar a latitude e longitude manualmente? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="informarLatLng"
                  value="true"
                  checked={form.informarLatLng === "true"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Sim</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="informarLatLng"
                  value="false"
                  checked={form.informarLatLng === "false"}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Não</span>
              </label>
            </div>
          </div>
          
          {/* Campos de latitude e longitude quando manual */}
          {form.informarLatLng === 'true' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-11.448525"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-61.447891"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={buscarCoordenadasEndereco}
                  disabled={buscandoEndereco}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {buscandoEndereco ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar Coordenadas do Endereço
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Clique para buscar automaticamente as coordenadas baseadas no endereço preenchido
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Localização no Mapa</h3>
            {!coordenadas && form.logradouro && (
              <button
                type="button"
                onClick={buscarCoordenadasEndereco}
                disabled={buscandoEndereco}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {buscandoEndereco ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-3 h-3" />
                    Localizar
                  </>
                )}
              </button>
            )}
          </div>
          
          {coordenadas ? (
            <div className="rounded-lg overflow-hidden border border-gray-300">
              <GoogleMapRaio 
                center={coordenadas}
                raio={1}
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center border border-gray-300">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  {form.logradouro ? 'Clique em "Localizar" para ver no mapa' : 'Preencha o endereço para visualizar no mapa'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {form.cidade && form.estado ? `${form.cidade}, ${form.estado}` : 'Aguardando endereço...'}
                </p>
              </div>
            </div>
          )}
          
          {coordenadas && (
            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700 border border-green-200">
              <strong>Coordenadas:</strong> {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
              <br />
              <strong>Endereço:</strong> {form.logradouro}, {form.numero} - {form.bairro}, {form.cidade}/{form.estado}
            </div>
          )}
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSalvar}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={salvo || !form.logradouro || !form.numero || !form.cidade || !form.estado || !form.bairro}
          >
            {salvo ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {salvo && (
          <div className="mt-4 text-green-600 font-semibold text-right">
            Endereço salvo com sucesso! ✓
          </div>
        )}
      </div>
    </div>
  );
}
