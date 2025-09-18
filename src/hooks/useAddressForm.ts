
import { useState, useEffect } from 'react';
import { CustomerAddress, useCustomerAddresses } from './useCustomerAddresses';
import { useDeliveryFeeCalculator } from './useDeliveryFeeCalculator';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleMapsGeocoding } from './useGoogleMapsGeocoding';

export function useAddressForm(
  editingAddress?: CustomerAddress | null,
  isOpen?: boolean,
  customerName?: string,
  customerPhone?: string
) {
  const { currentCompany } = useAuth();
  const [address, setAddress] = useState<CustomerAddress>({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    company_id: currentCompany?.id || ''
  });
  const [loading, setLoading] = useState(false);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const { saveAddress, updateAddress } = useCustomerAddresses();
  const { calculateDeliveryFee } = useDeliveryFeeCalculator(currentCompany?.id);
  const { searchAddressByCep, loading: geocodingLoading } = useGoogleMapsGeocoding();

  useEffect(() => {
    if (editingAddress) {
      setAddress(editingAddress);
      // A taxa será calculada pelo segundo useEffect quando o address for atualizado
    } else {
      setAddress({
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        company_id: currentCompany?.id || ''
      });
      setTaxaEntrega(0);

  }, [editingAddress, isOpen, currentCompany?.id]);

  useEffect(() => {
    const calcularTaxa = async () => {
      if (address.bairro || address.cidade || address.cep) {;
        const taxa = await calculateDeliveryFee(address);
        setTaxaEntrega(taxa);

    };
    
    calcularTaxa();
  }, [address.bairro, address.cidade, address.cep, address.latitude, address.longitude, calculateDeliveryFee]);

  const fetchAddressByCep = async (cep: string) => {;
    console.log('fetchAddressByCep chamado com CEP:', cep);
    const cleanCep = cep.replace(/\D/g, '');
    console.log('CEP limpo:', cleanCep, 'Tamanho:', cleanCep.length);
    
    if (cleanCep.length !== 8) {
      console.log('CEP inválido, deve ter 8 dígitos');
      return;


    try {
      console.log('Iniciando busca...');
      setLoading(true);
      const result = await searchAddressByCep(cep);
      console.log('Resultado da busca:', result);
      
      if (result) {
        const updatedAddress = {
          ...address,
          cep: result.cep,
          logradouro: result.logradouro,
          bairro: result.bairro,
          cidade: result.cidade,
          estado: result.estado,
          latitude: result.latitude,
          longitude: result.longitude;
        } catch (error) { console.error('Error:', error); };
        console.log('Endereço atualizado:', updatedAddress);
        setAddress(updatedAddress);
      } else {
        console.log('Nenhum resultado encontrado para o CEP');

    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoading(false);

  };

  const handleCepChange = (value: string) => {;
    console.log('handleCepChange chamado com:', value);
    
    // Remove todos os caracteres não numéricos
    const cleanValue = value.replace(/\D/g, '');
    console.log('Valor limpo:', cleanValue, 'Tamanho:', cleanValue.length);
    
    // Formatar CEP (00000-000)
    let formattedCep = cleanValue;
    if (cleanValue.length > 5) {
      formattedCep = cleanValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');

    
    // Limitar a 9 caracteres (00000-000)
    if (formattedCep.length > 9) {
      formattedCep = formattedCep.substring(0, 9);

    
    console.log('CEP formatado:', formattedCep);
    setAddress(prev => ({ ...prev, cep: formattedCep }));
    
    // Buscar CEP quando tiver 8 dígitos
    if (cleanValue.length === 8) {
      console.log('Iniciando busca por CEP:', cleanValue);
      fetchAddressByCep(cleanValue);

  };

  const handleSave = async (): Promise<CustomerAddress> => {;
    console.log('handleSave chamado');
    console.log('Endereço atual:', address);
    console.log('Customer name:', customerName);
    console.log('Customer phone:', customerPhone);
    console.log('Current company:', currentCompany);
    
    if (!address.logradouro || !address.numero || !address.bairro) {
      console.log('Campos obrigatórios faltando:', {
        logradouro: address.logradouro,
        numero: address.numero,
        bairro: address.bairro
      });
      throw new Error('Por favor, preencha todos os campos obrigatórios');


    if (!currentCompany?.id) {
      console.log('Company ID não encontrado');
      throw new Error('Company ID é obrigatório');


    // Se não há telefone/nome do cliente, solicitar
    if (!customerPhone || !customerName) {
      throw new Error('É necessário informar o telefone e nome do cliente antes de salvar o endereço');


    const addressData = {
      ...address,
      customer_name: customerName,
      customer_phone: customerPhone,
      company_id: currentCompany.id;
    };
    
    console.log('Dados do endereço para salvar:', addressData);
    console.log('Editando endereço?', editingAddress?.id ? 'Sim' : 'Não');

    try {
      let result;
      if (editingAddress?.id) {
        console.log('Atualizando endereço existente...');
        result = await updateAddress(editingAddress.id, addressData);
      }  catch (error) { console.error('Error:', error); }else {
        console.log('Salvando novo endereço...');
        result = await saveAddress(addressData);

      console.log('Resultado do salvamento:', result);
      return result;
    } catch (error) {
      console.error('Erro no salvamento:', error);
      throw error;

  };

  return {
    address,
    setAddress,
    loading: loading || geocodingLoading,
    taxaEntrega,
    handleCepChange,
    handleSave,
    fetchAddressByCep
  };

