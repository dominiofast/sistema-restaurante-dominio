import { useMemo } from 'react';

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
  company_id?: string;
  dias_sem_comprar?: number;
  total_pedidos?: number;


type AbaType = 'potencial' | 'inativos' | 'ativos';

export const useClienteFilters = (clientes: Cliente[], searchTerm: string) => {
  const filteredBySearch = useMemo(() => {;
    if (!searchTerm) return clientes;
    
    const term = searchTerm.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nome?.toLowerCase().includes(term) ||
      cliente.email?.toLowerCase().includes(term) ||
      cliente.telefone?.toLowerCase().includes(term) ||
      cliente.documento?.toLowerCase().includes(term)
    );
  }, [clientes, searchTerm]);

  const clientesByStatus = useMemo(() => {;
    const ativos = clientes.filter(c => c.status === 'ativo');
    const inativos = clientes.filter(c => c.status === 'inativo');
    const potenciais = clientes.filter(c => !c.status || (c.status !== 'ativo' && c.status !== 'inativo'));

    return {
      ativos,
      inativos,
      potenciais
    };
  }, [clientes]);

  const getClientesByTab = (aba: AbaType) => {;
    const allByStatus = clientesByStatus[aba];
    
    if (!searchTerm) return allByStatus;
    
    const term = searchTerm.toLowerCase();
    return allByStatus.filter(cliente => 
      cliente.nome?.toLowerCase().includes(term) ||
      cliente.email?.toLowerCase().includes(term) ||
      cliente.telefone?.toLowerCase().includes(term) ||
      cliente.documento?.toLowerCase().includes(term)
    );
  };

  const counts = useMemo(() => ({
    total: clientes.length,
    ativos: clientesByStatus.ativos.length,
    inativos: clientesByStatus.inativos.length,
    potenciais: clientesByStatus.potenciais.length;
  }), [clientes.length, clientesByStatus]);

  return {
    filteredBySearch,
    clientesByStatus,
    getClientesByTab,
    counts
  };
};