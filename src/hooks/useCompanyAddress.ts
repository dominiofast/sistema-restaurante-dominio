
import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyAddress {
  id: string;
  company_id: string;
  cep?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  latitude?: number;
  longitude?: number;
  hide_from_customers?: boolean;
  manual_coordinates?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  cep?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  latitude?: number;
  longitude?: number;
  hide_from_customers?: boolean;
  manual_coordinates?: boolean;
}

export function useCompanyAddress() {
  const { currentCompany } = useAuth();
  const [address, setAddress] = useState<CompanyAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Carregar endereço
  const loadAddress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentCompany?.id) {
        console.log('Company ID não encontrado');
        setError('Empresa não encontrada');
        return;
      }

      console.log('Carregando endereço para company_id:', currentCompany.id);

      const { data, error: addressError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'company_addresses')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (addressError) {
        console.error('Erro ao carregar endereço:', addressError);
        throw addressError;
      }

      console.log('Endereço carregado:', data);
      setAddress(data);
    } catch (err: any) {
      console.error('Erro ao carregar endereço:', err);
      setError('Erro ao carregar endereço: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Salvar endereço
  const saveAddress = async (formData: AddressFormData) => {
    try {
      setSaving(true);
      setError(null);
      
      if (!currentCompany?.id) {
        throw new Error('Empresa não encontrada');
      }

      console.log('Salvando endereço:', formData);
      console.log('Company ID:', currentCompany.id);

      const addressData = {
        company_id: currentCompany.id,
        cep: formData.cep || null,
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento || null,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        referencia: formData.referencia || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        hide_from_customers: formData.hide_from_customers || false,
        manual_coordinates: formData.manual_coordinates || false
      };

      console.log('Dados a serem salvos:', addressData);

      if (address?.id) {
        // Atualizar endereço existente
        console.log('Atualizando endereço existente, ID:', address.id);
        const { data, error: updateError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'company_addresses')
          /* .update\( REMOVIDO */ ; //addressData)
          /* .eq\( REMOVIDO */ ; //'id', address.id)
          /* .select\( REMOVIDO */ ; //)
          /* .single\( REMOVIDO */ ; //);

        if (updateError) {
          console.error('Erro ao atualizar endereço:', updateError);
          throw updateError;
        }
        
        console.log('Endereço atualizado com sucesso:', data);
        setAddress(data);
      } else {
        // Criar novo endereço
        console.log('Criando novo endereço');
        const { data, error: insertError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'company_addresses')
          /* .insert\( REMOVIDO */ ; //addressData)
          /* .select\( REMOVIDO */ ; //)
          /* .single\( REMOVIDO */ ; //);

        if (insertError) {
          console.error('Erro ao criar endereço:', insertError);
          throw insertError;
        }
        
        console.log('Endereço criado com sucesso:', data);
        setAddress(data);
      }

      return true;
    } catch (err: any) {
      console.error('Erro ao salvar endereço:', err);
      setError('Erro ao salvar endereço: ' + err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Buscar CEP na API ViaCEP
  const fetchAddressByCep = async (cep: string) => {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) {
        return null;
      }

      console.log('Buscando CEP:', cleanCep);
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        console.log('CEP não encontrado');
        return null;
      }

      console.log('Dados do CEP:', data);
      return {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      };
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      return null;
    }
  };

  useEffect(() => {
    if (currentCompany?.id) {
      loadAddress();
    }
  }, [currentCompany?.id]);

  return {
    address,
    loading,
    error,
    saving,
    saveAddress,
    fetchAddressByCep,
    reload: loadAddress
  };
}
