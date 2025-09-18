
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import VagasConfigHeader from '@/components/vagas/VagasConfigHeader';
import VagasConfigForm from '@/components/vagas/VagasConfigForm';
import VagasConfigPreview from '@/components/vagas/VagasConfigPreview';
import { VagasConfig, validateVagasConfig, generateSlugFromCompany } from '@/components/vagas/VagasConfigValidation';

const PaginaVagasConfig: React.FC = () => {
  const { user, companyId, currentCompany, isLoading: isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Partial<VagasConfig>>({
    is_active: false,
    page_title: '',
    logo_url: '',
    banner_url: '',
    primary_color: '#1B365D',
    slug: '',
    title_color: '#FFFFFF',
    welcome_message: ''
  });
  const [error, setError] = useState<string | null>(null);

  console.log('PaginaVagasConfig: Renderizando com:', { 
    user: user?.email, 
    companyId, 
    isAuthLoading,
    currentCompany: currentCompany ? {
      id: currentCompany.id,
      name: currentCompany.name,
      slug: currentCompany.slug,
      store_code: currentCompany.store_code
    } : null
  });

  useEffect(() => {
    // Só continua se a autenticação estiver concluída
    if (isAuthLoading) {
      setLoading(true);
      return;
    }

    // Se a autenticação terminou e não há empresa selecionada (caso do Super Admin)
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
    console.log('⚠️ fetchConfig desabilitado - sistema migrado para PostgreSQL');
    return Promise.resolve([]);
  } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'rh_vagas_config')
          /* .select\( REMOVIDO */ ; //'*')
          /* .eq\( REMOVIDO */ ; //'company_id', companyId)
          /* .single\( REMOVIDO */ ; //);

        console.log('PaginaVagasConfig: Resultado da busca:', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('PaginaVagasConfig: Erro ao buscar config:', error);
          throw error;
        }

        if (data) {
          console.log('PaginaVagasConfig: Configuração encontrada:', data);
          setConfig({
            ...data,
            title_color: data.title_color || '#FFFFFF',
            welcome_message: data.welcome_message || ''
          });
        } else if (currentCompany) {
          // Nova configuração - usar o slug da empresa ou gerar um
          const slug = generateSlugFromCompany(currentCompany);
          
          console.log('PaginaVagasConfig: Criando nova configuração com slug:', slug);
          
          setConfig({
            is_active: false,
            page_title: `Carreiras na ${currentCompany.name}`,
            logo_url: '',
            banner_url: '',
            primary_color: '#1B365D',
            slug: slug,
            title_color: '#FFFFFF',
            welcome_message: ''
          });
        }
      } catch (error: any) {
        console.error('PaginaVagasConfig: Erro no fetchConfig:', error);
        setError(error.message || 'Erro ao carregar configuração');
        toast.error('Erro ao carregar configuração da página de vagas.');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchConfig();
    }
  }, [companyId, isAuthLoading, currentCompany]);

  // Efeito adicional para garantir que temos um slug quando currentCompany é carregado
  useEffect(() => {
    if (currentCompany && !config.slug && !loading) {
      const generatedSlug = generateSlugFromCompany(currentCompany);
      console.log('Atualizando slug automaticamente:', generatedSlug);
      setConfig(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [currentCompany, loading]);

  const handleSave = async () => {
    if (!companyId) {
      toast.error('Erro: ID da empresa não encontrado');
      return;
    }
    
    if (!currentCompany) {
      toast.error('Erro: Empresa não encontrada');
      return;
    }

    // Validação
    const validationError = validateVagasConfig(config);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    console.log('PaginaVagasConfig: Salvando configuração:', config);
    setSaving(true);
    
    try {
      // Garantir que o slug seja válido
      const slugToSave = config.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || generateSlugFromCompany(currentCompany);
      
      // Preparar dados para salvar
      const dataToSave = {
        company_id: companyId,
        is_active: config.is_active || false,
        page_title: config.page_title?.trim() || `Carreiras na ${currentCompany.name}`,
        logo_url: config.logo_url || '',
        banner_url: config.banner_url || '',
        primary_color: config.primary_color || '#1B365D',
        slug: slugToSave,
        title_color: config.title_color || '#FFFFFF',
        welcome_message: config.welcome_message || ''
      };

      console.log('Dados a serem salvos:', dataToSave);

      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'rh_vagas_config')
        /* .upsert\( REMOVIDO */ ; //dataToSave, { 
          onConflict: 'company_id',
          ignoreDuplicates: false 
        })
        /* .select\( REMOVIDO */ ; //)
        /* .single\( REMOVIDO */ ; //);

      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error(`Erro ao salvar configuração: ${error.message}`);
        return;
      }

      console.log('PaginaVagasConfig: Configuração salva com sucesso:', data);
      toast.success('Configuração salva com sucesso!');
      
      // Atualizar o estado local com os dados salvos
      if (data) {
        setConfig({
          ...data,
          title_color: data.title_color || '#FFFFFF',
          welcome_message: data.welcome_message || ''
        });
      }

    } catch (error: any) {
      console.error('PaginaVagasConfig: Erro no handleSave:', error);
      toast.error(`Erro ao salvar configuração: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Usar o slug da configuração, da empresa atual ou gerar um novo
  const displaySlug = config.slug || generateSlugFromCompany(currentCompany);
  const publicUrl = displaySlug ? `https://vagas.dominio.tech/${displaySlug}` : 'https://vagas.dominio.tech/';

  console.log('PaginaVagasConfig: Estado atual:', { 
    isAuthLoading, 
    loading, 
    error, 
    userRole: user?.role, 
    companyId,
    configExists: !!Object.keys(config).length,
    currentCompanySlug: currentCompany?.slug,
    currentCompanyName: currentCompany?.name,
    currentCompanyStoreCode: currentCompany?.store_code,
    configSlug: config.slug,
    displaySlug,
    publicUrl
  });

  if (isAuthLoading) {
    console.log('PaginaVagasConfig: Renderizando loading auth...');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
        Carregando...
      </div>
    );
  }

  if (user?.role === 'super_admin' && !companyId) {
    console.log('PaginaVagasConfig: Super admin sem empresa selecionada');
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Selecione uma Empresa</AlertTitle>
          <AlertDescription>
            Como Super Admin, você precisa selecionar uma empresa no menu superior para configurar a página de vagas correspondente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    console.log('PaginaVagasConfig: Renderizando erro:', error);
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    console.log('PaginaVagasConfig: Renderizando loading...');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
        Carregando configuração...
      </div>
    );
  }

  console.log('PaginaVagasConfig: Renderizando página completa');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <VagasConfigHeader publicUrl={publicUrl} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna de Configuração */}
        <div className="lg:col-span-2 space-y-8">
          <VagasConfigForm
            config={config}
            setConfig={setConfig}
            currentCompany={currentCompany}
            companyId={companyId!}
            publicUrl={publicUrl}
          />
        </div>

        {/* Coluna de Preview */}
        <div>
          <VagasConfigPreview config={config} />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : <><Save className="mr-2 h-4 w-4" />Salvar Configuração</>}
        </Button>
      </div>
    </div>
  );
};

export default PaginaVagasConfig;
