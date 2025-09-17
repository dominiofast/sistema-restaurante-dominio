import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    if (!currentCompany?.id) {
      setTiposFiscais([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tipos_fiscais')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('nome');

      if (error) {
        console.warn('Erro ao buscar tipos fiscais:', error);
        setError(error.message);
        setTiposFiscais([]);
        return;
      }

      setTiposFiscais(data || []);
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

    const { data, error } = await supabase
      .from('tipos_fiscais')
      .insert([{
        nome: dados.nome,
        descricao: dados.descricao,
        ativo: dados.ativo ?? true,
        company_id: currentCompany.id
      }])
      .select()
      .single();

    if (error) throw error;

    setTiposFiscais(prev => [...prev, data]);
    return data;
  }, [currentCompany?.id]);

  const atualizarTipoFiscal = useCallback(async (id: string, dados: Partial<TipoFiscal>) => {
    const { data, error } = await supabase
      .from('tipos_fiscais')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setTiposFiscais(prev => 
      prev.map(tipo => tipo.id === id ? { ...tipo, ...data } : tipo)
    );
    
    return data;
  }, []);

  const deletarTipoFiscal = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('tipos_fiscais')
      .delete()
      .eq('id', id);

    if (error) throw error;

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