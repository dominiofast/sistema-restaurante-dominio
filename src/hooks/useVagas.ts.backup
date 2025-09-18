
import { useState, useEffect, useCallback } from 'react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';

interface Vaga {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary_range?: string;
  requirements?: string;
  benefits?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  config_id: string;
  company_id: string;
  apply_url?: string;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  type: string;
  salary_range: string;
  requirements: string;
  benefits: string;
  is_active: boolean;
}

export const useVagas = (companyId: string | null) => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState<string | null>(null);

  const fetchConfigAndVagas = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      // Primeiro, buscar a configuração da empresa
      const { data: configData, error: configError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas_config')
        /* .select\( REMOVIDO */ ; //'id')
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .single\( REMOVIDO */ ; //);

      if (configError) {
        if (configError.code === 'PGRST116') {
          toast.error('Configure primeiro a página de vagas antes de cadastrar vagas.');
          return;
        }
        throw configError;
      }

      setConfigId(configData.id);

      // Buscar as vagas
      const { data: vagasData, error: vagasError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'config_id', configData.id)
        /* .order\( REMOVIDO */ ; //'created_at', { ascending: false });

      if (vagasError) throw vagasError;

      setVagas(vagasData || []);
    } catch (error: any) {
      console.error('Erro ao carregar vagas:', error);
      toast.error('Erro ao carregar vagas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const saveVaga = async (formData: FormData, editingVaga: Vaga | null) => {
    if (!configId || !companyId) {
      toast.error('Configuração não encontrada');
      return false;
    }

    try {
      const vagaData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        salary_range: formData.salary_range || null,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        is_active: formData.is_active,
        config_id: configId,
        company_id: companyId
      };

      console.log('Dados sendo enviados:', vagaData);

      let error;
      if (editingVaga) {
        ({ error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'rh_vagas')
          /* .update\( REMOVIDO */ ; //vagaData)
          /* .eq\( REMOVIDO */ ; //'id', editingVaga.id));
      } else {
        ({ error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'rh_vagas')
          /* .insert\( REMOVIDO */ ; //[vagaData]));
      }

      if (error) throw error;

      toast.success(editingVaga ? 'Vaga atualizada com sucesso!' : 'Vaga criada com sucesso!');
      fetchConfigAndVagas();
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar vaga:', error);
      toast.error('Erro ao salvar vaga: ' + error.message);
      return false;
    }
  };

  const deleteVaga = async (vaga: Vaga) => {
    if (!confirm(`Tem certeza que deseja excluir a vaga "${vaga.title}"?`)) {
      return;
    }

    try {
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas')
        /* .delete\( REMOVIDO */ ; //)
        /* .eq\( REMOVIDO */ ; //'id', vaga.id);

      if (error) throw error;

      toast.success('Vaga excluída com sucesso!');
      fetchConfigAndVagas();
    } catch (error: any) {
      console.error('Erro ao excluir vaga:', error);
      toast.error('Erro ao excluir vaga: ' + error.message);
    }
  };

  useEffect(() => {
    fetchConfigAndVagas();
  }, [fetchConfigAndVagas]);

  return {
    vagas,
    loading,
    configId,
    saveVaga,
    deleteVaga,
    fetchConfigAndVagas
  };
};
