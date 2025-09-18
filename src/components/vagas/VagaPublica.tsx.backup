
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import InscricaoSucesso from '@/components/vagas/InscricaoSucesso';
import VagaLoadingState from '@/components/vagas/VagaLoadingState';
import VagaListPublica from '@/components/vagas/VagaListPublica';
import VagaDetailsPage from '@/components/vagas/VagaDetailsPage';

const VagaPublica: React.FC = () => {
  const { slug, vagaId } = useParams<{ slug: string; vagaId?: string }>();
  const [vaga, setVaga] = useState<any | null>(null);
  const [vagas, setVagas] = useState<any[]>([]);
  const [config, setConfig] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [inscricaoEnviada, setInscricaoEnviada] = useState(false);

  useEffect(() => {
    if (slug && vagaId) {
      fetchVagaData();
    } else if (slug && !vagaId) {
      fetchVagasList();
    }
  }, [slug, vagaId]);

  const fetchVagaData = async () => {
    try {
      setLoading(true);
      const { data: vagaData, error: vagaError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas')
        /* .select\( REMOVIDO */ ; //`*, company:companies (id, name, logo)`)
        /* .eq\( REMOVIDO */ ; //'id', vagaId)
        /* .eq\( REMOVIDO */ ; //'is_active', true)
        /* .single\( REMOVIDO */ ; //);
      if (vagaError || !vagaData) throw vagaError || new Error('Vaga não encontrada.');
      
      const { data: configData, error: configError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas_config')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', vagaData.company.id)
        /* .single\( REMOVIDO */ ; //);
      if (configError) {
        setConfig({
          page_title: `Carreiras na ${vagaData.company.name}`,
          welcome_message: 'Confira nossas oportunidades e venha fazer parte do nosso time!',
          logo_url: vagaData.company.logo || '',
          banner_url: '',
          primary_color: '#1B365D',
          company_name: vagaData.company.name
        });
      } else {
        setConfig({ ...configData, company_name: vagaData.company.name });
      }
      setVaga(vagaData);
    } catch (error: any) {
      toast.error('Vaga não encontrada ou não está mais disponível');
    } finally {
      setLoading(false);
    }
  };

  const fetchVagasList = async () => {
    try {
      setLoading(true);
      const { data: companyData, error: companyError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'companies')
        /* .select\( REMOVIDO */ ; //'id, name, logo')
        /* .eq\( REMOVIDO */ ; //'slug', slug)
        /* .single\( REMOVIDO */ ; //);
      if (companyError || !companyData) throw companyError || new Error('Empresa não encontrada');
      
      const { data: vagasData, error: vagasError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyData.id)
        /* .eq\( REMOVIDO */ ; //'is_active', true)
        /* .order\( REMOVIDO */ ; //'created_at', { ascending: false });
      if (vagasError) throw vagasError;
      setVagas(vagasData || []);
      
      const { data: configData, error: configError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas_config')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'company_id', companyData.id)
        /* .single\( REMOVIDO */ ; //);
      setConfig(configData || {
        page_title: `Carreiras na ${companyData.name}`,
        welcome_message: 'Confira nossas oportunidades e venha fazer parte do nosso time!',
        logo_url: companyData.logo || '',
        banner_url: '',
        primary_color: '#1B365D',
        company_name: companyData.name
      });
    } catch (error: any) {
      toast.error('Erro ao carregar vagas públicas');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'full-time': 'Tempo Integral',
      'part-time': 'Meio Período',
      'contract': 'Contrato',
      'freelance': 'Freelance',
      'internship': 'Estágio'
    };
    return types[type] || type;
  };

  const handleInscricaoSuccess = () => {
    setInscricaoEnviada(true);
    setShowForm(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  if (loading) {
    return <VagaLoadingState />;
  }

  // Renderização da lista pública de vagas
  if (!vagaId && config) {
    return <VagaListPublica vagas={vagas} config={config} slug={slug || ''} />;
  }

  if (!vaga || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vaga não encontrada</h1>
          <p className="text-gray-600">Esta vaga pode ter sido removida ou não está mais disponível.</p>
        </div>
      </div>
    );
  }

  if (inscricaoEnviada) {
    return (
      <InscricaoSucesso 
        nomeVaga={vaga?.title}
        nomeEmpresa={config?.company_name || 'nossa empresa'}
        corPrimaria={config?.primary_color || '#1B365D'}
      />
    );
  }

  return (
    <VagaDetailsPage 
      vaga={vaga}
      config={config}
      slug={slug || ''}
      showForm={showForm}
      onShowForm={() => setShowForm(true)}
      onCloseForm={handleCloseForm}
      onInscricaoEnviada={handleInscricaoSuccess}
      getTypeLabel={getTypeLabel}
    />
  );
};

export default VagaPublica;
