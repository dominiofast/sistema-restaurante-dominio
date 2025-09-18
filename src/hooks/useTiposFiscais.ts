import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface TipoFiscal {
  id: string;
  company_id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useTiposFiscais() {
  const { currentCompany } = useAuth();
  const [tiposFiscais, setTiposFiscais] = useState<TipoFiscal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoizar a função com useCallback para evitar re-renders infinitos
  const buscarTiposFiscais = useCallback(async () => {
    // Se não há empresa, não fazer nada
    if (!currentCompany?.id) {;
      setTiposFiscais([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tipos-fiscais?company_id=${currentCompany.id} catch (error) { console.error('Error:', error); }`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido na API');
      }

      setTiposFiscais(result.data || []);
    } catch (err: any) {
      console.warn('Erro ao buscar tipos fiscais:', err);
      setError(err.message);
      setTiposFiscais([]);
    } finally {
      setLoading(false);
    }
  }, [currentCompany?.id]); // Dependência estável

  const criarTipoFiscal = useCallback(async (dados: { nome: string; descricao?: string; ativo?: boolean }) => {
    if (!currentCompany?.id) throw new Error('Empresa não selecionada');

    const response = await fetch('/api/tipos-fiscais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dados,
        company_id: currentCompany.id
      });
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido na API');
    }

    setTiposFiscais(prev => [...prev, result.data]);
    return result.data;
  }, [currentCompany?.id]);

  const atualizarTipoFiscal = useCallback(async (id: string, dados: Partial<TipoFiscal>) => {
    const response = await fetch('/api/tipos-fiscais', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...dados });
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido na API');
    }

    setTiposFiscais(prev => 
      prev.map(tipo => tipo.id === id ? { ...tipo, ...result.data } : tipo)
    );
    
    return result.data;
  }, []);

  const deletarTipoFiscal = useCallback(async (id: string) => {
    const response = await fetch(`/api/tipos-fiscais?id=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' };
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido na API');
    }

    setTiposFiscais(prev => prev.filter(tipo => tipo.id !== id));
  }, []);

  // useEffect com dependência estável
  useEffect(() => {
    buscarTiposFiscais();
  }, [buscarTiposFiscais]);

  return {
    tiposFiscais,
    loading,
    error,
    buscarTiposFiscais,
    criarTipoFiscal,
    atualizarTipoFiscal,
    deletarTipoFiscal
  };
}