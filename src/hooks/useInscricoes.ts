
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DragEndEvent } from '@dnd-kit/core';

interface Inscricao {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  linkedin_url?: string;
  curriculo_url?: string;
  curriculo_nome?: string;
  carta_apresentacao?: string;
  experiencia_relevante?: string;
  pretensao_salarial?: string;
  disponibilidade_inicio?: string;
  status: string;
  created_at: string;
  arquivado?: boolean;
  rh_vagas: {
    title: string;
    location: string;
  };
}

export const useInscricoes = (companyId: string | null) => {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInscricoes = useCallback(async () => {
    if (!companyId) {
      console.log('Company ID não disponível, não buscando inscrições');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('Buscando inscrições para company_id:', companyId);

      // Primeiro, verificar o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Usuário atual:', user);
      console.log('Erro do usuário:', userError);

      // Testar busca básica primeiro
      console.log('Executando teste de busca básica...');
      const { data: testData, error: testError } = await supabase
        .from('rh_inscricoes')
        .select('*')
        .eq('company_id', companyId)
        .eq('arquivado', false) // Filtrar apenas não arquivadas
        .limit(5);

      console.log('Resultado do teste básico:', { 
        count: testData?.length || 0, 
        data: testData, 
        error: testError 
      });

      if (testError) {
        console.error('Erro no teste básico:', testError);
        throw testError;
      }

      // Agora fazer a busca completa com join
      console.log('Executando busca completa com join...');
      const { data, error } = await supabase
        .from('rh_inscricoes')
        .select(`
          *,
          rh_vagas(title, location)
        `)
        .eq('company_id', companyId)
        .eq('arquivado', false) // Filtrar apenas não arquivadas
        .order('created_at', { ascending: false });

      console.log('Resultado da busca completa:', { 
        count: data?.length || 0, 
        data: data, 
        error: error 
      });

      if (error) {
        console.error('Erro na query de inscrições:', error);
        throw error;
      }

      console.log('Inscrições encontradas:', data?.length || 0);
      setInscricoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar inscrições:', error);
      toast.error('Erro ao carregar inscrições: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchInscricoes();
  }, [fetchInscricoes]);

  const updateStatus = async (inscricaoId: string, newStatus: string) => {
    try {
      console.log('Atualizando status da inscrição:', inscricaoId, 'para:', newStatus);
      
      const { error } = await supabase
        .from('rh_inscricoes')
        .update({ status: newStatus })
        .eq('id', inscricaoId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso!');
      fetchInscricoes();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  };

  const arquivarInscricao = async (inscricaoId: string) => {
    try {
      console.log('Arquivando inscrição:', inscricaoId);
      
      const { error } = await supabase
        .from('rh_inscricoes')
        .update({ arquivado: true })
        .eq('id', inscricaoId);

      if (error) throw error;

      toast.success('Inscrição arquivada com sucesso!');
      fetchInscricoes();
    } catch (error: any) {
      console.error('Erro ao arquivar inscrição:', error);
      toast.error('Erro ao arquivar inscrição: ' + error.message);
    }
  };

  const inscricoesPorStatus = useMemo(() => {
    const statusMap: Record<string, Inscricao[]> = {
      'pendente': [],
      'em_analise': [],
      'aprovado': [],
      'rejeitado': []
    };

    inscricoes.forEach(inscricao => {
      if (statusMap[inscricao.status]) {
        statusMap[inscricao.status].push(inscricao);
      } else {
        statusMap['pendente'].push(inscricao);
      }
    });

    return statusMap;
  }, [inscricoes]);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const inscricaoId = active.id as string;
    const newStatus = over.id as string;
    
    updateStatus(inscricaoId, newStatus);
  }, [updateStatus]);

  return {
    inscricoes,
    loading,
    inscricoesPorStatus,
    updateStatus,
    arquivarInscricao,
    onDragEnd,
    fetchInscricoes
  };
};
