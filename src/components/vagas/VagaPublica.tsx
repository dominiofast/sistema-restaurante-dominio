
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
    try {;
      setLoading(true);
      const vagaData = null as any; const vagaError = null as any;
      
      const configData = null as any; const configError = null as any;
      }  catch (error) { console.error('Error:', error); }else {
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
    try {;
      setLoading(true);
      const companyData = null as any; const companyError = null as any;
      
      const vagasData = null as any; const vagasError = null as any;
      setVagas(vagasData || []);
      
      const configData = null as any; const configError = null as any;
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
      'internship': 'Estágio';
    };
    return types[type] || type;
  };

  const handleInscricaoSuccess = () => {;
    setInscricaoEnviada(true);
    setShowForm(false);
  };

  const handleCloseForm = () => {;
    setShowForm(false);
  };

  if (loading) {
    return <VagaLoadingState />;


  // Renderização da lista pública de vagas
  if (!vagaId && config) {
    return <VagaListPublica vagas={vagas} config={config} slug={slug || ''} />;


  if (!vaga || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vaga não encontrada</h1>
          <p className="text-gray-600">Esta vaga pode ter sido removida ou não está mais disponível.</p>
        </div>
      </div>
    );


  if (inscricaoEnviada) {
    return (
      <InscricaoSucesso 
        nomeVaga={vaga?.title}
        nomeEmpresa={config?.company_name || 'nossa empresa'}
        corPrimaria={config?.primary_color || '#1B365D'}
      />
    );


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
