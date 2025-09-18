
import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyInfo {
  id?: string;
  company_id: string;
  cnpj_cpf?: string;
  inscricao_estadual?: string;
  razao_social?: string;
  nome_estabelecimento: string;
  segmento?: string;
  instagram?: string;
  contato?: string;
  telefone2?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cnae?: string;
}

export function useCompanyInfo() {
  const { currentCompany } = useAuth();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyInfo = async () => {
    if (!currentCompany?.id) return;

    try {
      setLoading(true);
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'company_info')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', currentCompany.id)
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (error) throw error;

      if (data) {
        setCompanyInfo(data);
      } else {
        // Criar registro inicial se não existir
        const newInfo: Omit<CompanyInfo, 'id'> = {
          company_id: currentCompany.id,
          nome_estabelecimento: currentCompany.name,
        };
        setCompanyInfo(newInfo);
      }
    } catch (err) {
      console.error('Erro ao buscar informações da empresa:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyInfo = async (info: Partial<CompanyInfo>) => {
    if (!currentCompany?.id) return;

    try {
      setError(null);
      
      // Garantir que nome_estabelecimento sempre tenha um valor
      const dataToSave = {
        ...info,
        company_id: currentCompany.id,
        nome_estabelecimento: info.nome_estabelecimento || currentCompany.name,
      };

      if (companyInfo?.id) {
        // Atualizar registro existente
        const { data, error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'company_info')
          /* .update\( REMOVIDO */ ; //dataToSave)
          /* .eq\( REMOVIDO */ ; //'id', companyInfo.id)
          /* .select\( REMOVIDO */ ; //)
          /* .single\( REMOVIDO */ ; //);

        if (error) throw error;
        setCompanyInfo(data);
      } else {
        // Criar novo registro
        const { data, error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'company_info')
          /* .insert\( REMOVIDO */ ; //dataToSave)
          /* .select\( REMOVIDO */ ; //)
          /* .single\( REMOVIDO */ ; //);

        if (error) throw error;
        setCompanyInfo(data);
      }

      return true;
    } catch (err) {
      console.error('Erro ao salvar informações da empresa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      return false;
    }
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, [currentCompany?.id]);

  return {
    companyInfo,
    loading,
    error,
    saveCompanyInfo,
    refetch: fetchCompanyInfo,
  };
}
