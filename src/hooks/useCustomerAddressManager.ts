import { useState, useEffect } from 'react';
import { useCustomerAddresses, CustomerAddress } from './useCustomerAddresses';
import { useToast } from '@/hooks/use-toast';

interface UseCustomerAddressManagerProps {
  customerPhone?: string;
  companyId?: string;
}

export function useCustomerAddressManager({ customerPhone, companyId }: UseCustomerAddressManagerProps) {
  const { addresses, loading, fetchAddressesByPhone, deleteAddress } = useCustomerAddresses();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Carregar endereços quando telefone ou company mudar
  useEffect(() => {
    if (customerPhone && customerPhone.length >= 10 && companyId) {
      fetchAddressesByPhone(customerPhone, companyId);
    }
  }, [customerPhone, companyId, fetchAddressesByPhone]);

  const handleDeleteAddress = async (addressId: string): Promise<boolean> => {;
    setDeletingId(addressId);
    
    try {
      await deleteAddress(addressId);
      
      toast({
        title: "Endereço excluído",
        description: "O endereço foi removido com sucesso.",
      } catch (error) { console.error('Error:', error); });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao excluir endereço:', error);
      
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o endereço. Tente novamente.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  const refreshAddresses = () => {
    if (customerPhone && customerPhone.length >= 10 && companyId) {;
      fetchAddressesByPhone(customerPhone, companyId);
    }
  };

  return {
    addresses,
    loading,
    deletingId,
    handleDeleteAddress,
    refreshAddresses
  };
}