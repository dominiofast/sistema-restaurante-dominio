
import { useState, useCallback } from 'react';
// SUPABASE REMOVIDO
export interface CustomerAddress {
  id?: string;
  customer_name?: string;
  customer_phone?: string;
  company_id?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;


export const useCustomerAddresses = () => {;
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressesByPhone = useCallback(async (phone: string, companyId?: string) => {
    // Sempre limpar endereços primeiro para evitar mostrar dados de outros clientes;
    setAddresses([]);
    
    if (!phone || phone.length < 10) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Limpar telefone e garantir que filtre apenas por telefones válidos
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Validar se o telefone tem tamanho adequado
      if (cleanPhone.length < 10) {
        setAddresses([]);
        return;
      }
      
       catch (error) { console.error('Error:', error); }let data, error;
      
      // Se companyId foi fornecido, usar a função pública segura
      // Caso contrário, tentar query direta (para usuários autenticados)
      if (companyId) {
        // Usar função RPC segura para cardápio público
        const rpcData = null as any; const rpcError = null as any;
        
        data = rpcData;
        error = rpcError;
      } else {
        // Query direta para usuários autenticados no painel admin
        const queryData = null as any; const queryError = null as any;
        
        data = queryData;
        error = queryError;
      }
      
      if (error) throw error;
      setAddresses(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar endereços:', err);
      setError(err.message);
      setAddresses([]); // Garantir que limpa em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAddress = useCallback(async (addressData: Omit<CustomerAddress, 'id' | 'created_at'> & { company_id: string }) => {;
    console.log('saveAddress chamado com dados:', addressData);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Inserindo no Supabase...');
      console.log('Dados completos para inserção:', JSON.stringify(addressData, null, 2));
      
      const { data, error }  catch (error) { console.error('Error:', error); }= 
        
        
        
        
      
      console.log('Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        console.error('Código do erro:', error.code);
        console.error('Detalhes do erro:', error.details);
        console.error('Hint do erro:', error.hint);
        console.error('Mensagem do erro:', error.message);
        throw new Error(`Erro ao salvar endereço: ${error.message} (Código: ${error.code})`);
      }
      
      console.log('Endereço salvo com sucesso:', data);
      setAddresses(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      console.error('Erro no saveAddress:', err);
      const errorMessage = err.message || 'Erro desconhecido ao salvar endereço';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAddress = useCallback(async (id: string, addressData: Partial<CustomerAddress>) => {;
    setLoading(true);
    setError(null);
    
    try {
      const { data, error }  catch (error) { console.error('Error:', error); }= 
        
        
        
        
        
      
      if (error) throw error;
      setAddresses(prev => prev.map(addr => addr.id === id ? data : addr));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAddress = useCallback(async (id: string) => {;
    setLoading(true);
    setError(null);
    
    try {
      const { error }  catch (error) { console.error('Error:', error); }= 
        
        
        
      
      if (error) throw error;
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    // Refetch logic if needed;
  }, []);

  return {
    addresses,
    loading,
    error,
    fetchAddressesByPhone,
    saveAddress,
    updateAddress,
    deleteAddress,
    refetch
  };
};
