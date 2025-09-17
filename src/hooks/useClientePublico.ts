
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClientePublico {
  id?: number;
  nome: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  company_id?: string;
}

export function useClientePublico() {
  const [cliente, setCliente] = useState<ClientePublico | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca cliente pelo telefone (removendo caracteres não numéricos)
  const buscarPorTelefone = async (telefone: string, companyId?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Limpar o telefone removendo caracteres especiais
      const telefoneNumeros = telefone.replace(/\D/g, '');
      
      console.log('🔍 Buscando cliente por telefone:', telefoneNumeros, 'na empresa:', companyId);
      
      let query = supabase
        .from('clientes')
        .select('*')
        .eq('telefone', telefoneNumeros);
      
      // Se foi fornecido companyId, filtrar por empresa
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query.maybeSingle();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
        throw error;
      }
      
      console.log('📋 Cliente encontrado:', data);
      setCliente(data || null);
      return data || null;
    } catch (err: any) {
      console.error('❌ Erro ao buscar cliente:', err);
      setError(err.message || 'Erro ao buscar cliente');
      setCliente(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cadastra cliente com nome e telefone apenas se não existir (com company_id)
  const cadastrarCliente = async (nome: string, telefone: string, companyId?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Limpar o telefone removendo caracteres especiais
      const telefoneNumeros = telefone.replace(/\D/g, '');
      
      console.log('🔍 Verificando se cliente já existe antes de cadastrar:', telefoneNumeros);
      
      // Verificar se já existe um cliente com este telefone na mesma empresa
      const clienteExistente = await buscarPorTelefone(telefoneNumeros, companyId);
      
      if (clienteExistente) {
        console.log('✅ Cliente já existe, retornando existente:', clienteExistente);
        setCliente(clienteExistente);
        return clienteExistente;
      }
      
      // Se não foi fornecido companyId, não cadastra (precisa de empresa)
      if (!companyId) {
        console.warn('⚠️ Company ID necessário para cadastrar cliente');
        return null;
      }
      
      console.log('📝 Cadastrando novo cliente:', { nome, telefone: telefoneNumeros, company_id: companyId });
      
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ nome, telefone: telefoneNumeros, company_id: companyId }])
        .select()
        .single();
        
      if (error) throw error;
      
      console.log('✅ Cliente cadastrado com sucesso:', data);
      setCliente(data);
      return data;
    } catch (err: any) {
      console.error('❌ Erro ao cadastrar cliente:', err);
      setError(err.message || 'Erro ao cadastrar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    cliente,
    loading,
    error,
    buscarPorTelefone,
    cadastrarCliente,
    setCliente
  };
}
