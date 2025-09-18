
import { useState } from 'react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_cadastro?: string;
  status?: string;
  data_nascimento?: string;
  company_id: string; // Obrigatório agora
}

export const useClienteOperations = () => {
  const [loading, setLoading] = useState(false);
  const { currentCompany } = useAuth();

  const createCliente = async (formData: Partial<Cliente>) => {
    setLoading(true);
    try {
      console.log('🔄 Iniciando cadastro de cliente:', formData);
      
      if (!currentCompany?.id) {
        console.error('❌ Nenhuma empresa selecionada');
        toast.error('Nenhuma empresa selecionada');
        return false;
      }

      if (!formData.nome?.trim()) {
        console.error('❌ Nome do cliente é obrigatório');
        toast.error('Nome do cliente é obrigatório');
        return false;
      }

      const clienteData = {
        ...formData,
        nome: formData.nome,
        company_id: currentCompany.id
      };

      console.log('📝 Dados do cliente a serem inseridos:', clienteData);

      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'clientes')
        /* .insert\( REMOVIDO */ ; //[clienteData])
        /* .select\( REMOVIDO */ ; //)
        /* .single\( REMOVIDO */ ; //);

      if (error) {
        console.error('❌ Erro na inserção:', error);
        throw error;
      }
      
      console.log('✅ Cliente cadastrado com sucesso:', data);
      toast.success('Cliente cadastrado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente: ' + (error as any)?.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCliente = async (id: number, formData: Partial<Cliente>) => {
    setLoading(true);
    try {
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'clientes')
        /* .update\( REMOVIDO */ ; //formData)
        /* .eq\( REMOVIDO */ ; //'id', id);

      if (error) throw error;
      toast.success('Cliente atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCliente = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return false;

    setLoading(true);
    try {
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'clientes')
        /* .delete\( REMOVIDO */ ; //)
        /* .eq\( REMOVIDO */ ; //'id', id);

      if (error) throw error;
      toast.success('Cliente excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createCliente,
    updateCliente,
    deleteCliente
  };
};
