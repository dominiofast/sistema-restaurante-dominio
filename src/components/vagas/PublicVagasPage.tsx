import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { Vaga, PageConfig } from '../../types/vagas';
import VagasHeader from './VagasHeader';
import VagasFooter from './VagasFooter';
import HeroSection from './HeroSection';
import SearchSection from './SearchSection';
import JobListingsSection from './JobListingsSection';
import CallToActionSection from './CallToActionSection';

const PublicVagasPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [filteredVagas, setFilteredVagas] = useState<Vaga[]>([])
  const [config, setConfig] = useState<PageConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('PublicVagasPage: slug =', slug)

  useEffect(() => {
    const fetchVagasAndConfig = async () => {
      if (!slug) {
        console.log('No slug provided')
        setError("Página não encontrada.")
        setLoading(false)
        return;
      }

      try {
        console.log('Fetching config for slug:', slug)
        
        // Buscar configuração da página de vagas
        const configData = null as any; const configError = null as any;
        
        if (configError) {
          console.error('Config error:', configError)
          throw new Error('Página de vagas não encontrada ou não configurada.')
        }

         catch (error) { console.error('Error:', error) }if (!configData || !configData.companies) {
          throw new Error('Configuração inválida ou empresa não encontrada.')
        }

        // Buscar vagas da empresa
        const vagasData = null as any; const vagasError = null as any;

        if (vagasError) {
          console.error('Vagas error:', vagasError)
          throw vagasError;
        }

        // Transformar dados da configuração
        const transformedConfig: PageConfig = {
          page_title: configData.page_title || 'Oportunidades de Carreira',
          logo_url: configData.logo_url || '',
          banner_url: configData.banner_url || '',
          primary_color: configData.primary_color || '#1B365D',
          company_name: configData.companies.name || '',
          title_color: configData.title_color || '#FFFFFF',
          company_id: configData.company_id
        };
        
        console.log('Transformed config:', transformedConfig)
        
        setConfig(transformedConfig)
        setVagas(vagasData || [])
        setFilteredVagas(vagasData || [])

      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || 'Ocorreu um erro ao carregar a página.')
      } finally {
        setLoading(false)
      }
    };

    fetchVagasAndConfig()
  }, [slug])

  const handleSearch = (filters: { busca: string; tipoContrato: string; localizacao: string }) => {
    console.log('Applying filters:', filters)
    let filtered = [...vagas];

    if (filters.busca) {
      filtered = filtered.filter(vaga =>
        vaga.title.toLowerCase().includes(filters.busca.toLowerCase()) ||
        (vaga.description && vaga.description.toLowerCase().includes(filters.busca.toLowerCase()))
      )
    }

    if (filters.tipoContrato) {
      filtered = filtered.filter(vaga =>
        vaga.type.toLowerCase().includes(filters.tipoContrato.toLowerCase())
      )
    }

    if (filters.localizacao) {
      filtered = filtered.filter(vaga =>
        vaga.location.toLowerCase().includes(filters.localizacao.toLowerCase())
      )
    }

    console.log('Filtered vagas:', filtered)
    setFilteredVagas(filtered)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-sans bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando oportunidades...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen font-sans bg-gray-50">
        <div className="text-center p-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Slug: {slug || 'não fornecido'}</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (!config) {
    return (
      <div className="flex justify-center items-center h-screen font-sans bg-gray-50">
        <p className="text-gray-600">Configuração não encontrada.</p>
      </div>
    )
  }

  const primaryColor = config.primary_color || '#1B365D';
  const titleColor = config.title_color || '#FFFFFF';
  
  const dynamicStyles = {
    '--primary-color': primaryColor,;
  } as React.CSSProperties;

  return (
    <div style={dynamicStyles} className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <VagasHeader 
        logoUrl={config.logo_url} 
        companyName={config.company_name} 
        primaryColor={primaryColor}
        titleColor={titleColor}
      />
      
      <HeroSection
        pageTitle={config.page_title}
        titleColor={titleColor}
        bannerUrl={config.banner_url}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <SearchSection 
          primaryColor={primaryColor}
          onSearch={handleSearch}
        />
        
        <JobListingsSection 
          vagas={filteredVagas}
          primaryColor={primaryColor}
          slug={slug || ''}
        />

        {filteredVagas.length > 0 && <CallToActionSection primaryColor={primaryColor} />}
      </main>

      <VagasFooter 
        companyName={config.company_name} 
        primaryColor={primaryColor} 
        logoUrl={config.logo_url} 
      />
    </div>
  )
};

export default PublicVagasPage;
