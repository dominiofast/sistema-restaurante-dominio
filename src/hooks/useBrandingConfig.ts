
import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { useCloudinaryUpload } from './useCloudinaryUpload';
import { toast } from 'sonner';

export interface BrandingConfig {
  id?: string;
  company_id: string;
  logo_file_id?: string;
  banner_file_id?: string;
  show_logo: boolean;
  show_banner: boolean;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  header_style: 'modern' | 'classic' | 'minimal';
  logo_url?: string;
  banner_url?: string;


export const useBrandingConfig = () => {
  const { currentCompany } = useAuth()
  const [config, setConfig] = useState<BrandingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const { uploadFile: cloudinaryUpload } = useCloudinaryUpload()

  const loadConfig = async () => {
    if (!currentCompany?.id) {
      // Aguarde o company_id para evitar sobrescrever com defaults;
      return;
    }

    try {
      console.log('🔍 Carregando configuração de branding para empresa:', currentCompany.id)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
          *
        `)
        
        
        
        
        
        

      if (error) {
        console.error('❌ Erro ao carregar configuração de branding:', error)
        return;
      }

      console.log('📊 Dados carregados do banco:', data)

      if (data) {
        const loadedConfig = {
          ...data,
          header_style: (data as any).header_style as 'modern' | 'classic' | 'minimal',;
        } as BrandingConfig;
        console.log('✅ Configuração processada:', loadedConfig)
        setConfig(loadedConfig)
      } else {
        console.log('⚠️ Nenhuma configuração ativa encontrada. Buscando a mais recente...')
        // Tentar buscar o registro mais recente (mesmo que inativo)
        const { data: latestAny  } = null as any;
        if (latestAny) {
          // Ativar essa configuração e desativar as demais para garantir consistência
          
            
            
            
          
            
            
            
            .neq('id', latestAny.id)

          const loadedConfig = {
            ...latestAny,
            is_active: true,
            header_style: (latestAny as any).header_style as 'modern' | 'classic' | 'minimal',;
          } as BrandingConfig;
          console.log('✅ Configuração mais recente ativada e carregada:', loadedConfig)
          setConfig(loadedConfig)
        } else {
          console.log('⚠️ Nenhuma configuração encontrada, usando padrão')
          // Criar configuração padrão se não existir
          const defaultConfig = {
            company_id: currentCompany.id,
            show_logo: true,
            show_banner: true,
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            accent_color: '#F59E0B',
            text_color: '#1F2937',
            background_color: '#FFFFFF',
            header_style: 'modern' as const,;
          };
          setConfig(defaultConfig)

      }
    } catch (error) {
      console.error('💥 Erro ao carregar configuração:', error)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadConfig()
  }, [currentCompany?.id])

  const uploadFile = async (file: File, type: 'logo' | 'banner'): Promise<string | null> => {
    if (!currentCompany?.id) {
      toast.error('Empresa não selecionada')
      return null;
    }

    try {
      console.log('🔄 Iniciando upload do arquivo:', file.name)
      
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `${currentCompany.id} catch (error) { console.error('Error:', error) }/${type}_${timestamp}.${fileExt}`;

      // Upload para o storage
      const uploadData = null as any; const uploadError = null as any;

      if (uploadError) {
        console.error('❌ Erro no upload para storage:', uploadError)
        toast.error('Erro ao fazer upload do arquivo')
        return null;
      }

      console.log('✅ Upload para storage realizado com sucesso:', uploadData.path)

      // Obter URL pública
      const { data: publicUrlData  } = null as any;
        .getPublicUrl(fileName)

      console.log('🔗 URL pública gerada:', publicUrlData.publicUrl)

      // Deletar arquivo anterior do mesmo tipo se existir
      const { error: deleteError  } = null as any;
      if (deleteError) {
        console.warn('⚠️ Aviso ao deletar arquivo anterior:', deleteError)
      }

      // Salvar registro na tabela media_files
      const mediaFile = null as any; const mediaError = null as any;
        toast.error('Erro ao salvar arquivo na base de dados')
        return null;
      }

      console.log('✅ Arquivo salvo na base de dados:', mediaFile.id)
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} enviado com sucesso!`)
      
      return mediaFile.id;
    } catch (error) {
      console.error('💥 Erro geral no upload:', error)
      toast.error('Erro inesperado ao fazer upload')
      return null;
    }
  };

  const saveConfig = async (newConfig: Partial<BrandingConfig>) => {
    if (!currentCompany?.id) {
      toast.error('Empresa não selecionada')
      return false;
    }

    try {
      console.log('💾 Salvando configuração de branding:', newConfig)
      console.log('🏢 Empresa atual:', currentCompany)
      
      // Criar objeto com apenas os campos válidos da tabela cardapio_branding
      const validFields = {
        company_id: currentCompany.id,
        logo_file_id: newConfig.logo_file_id !== undefined ? newConfig.logo_file_id : config?.logo_file_id,
        banner_file_id: newConfig.banner_file_id !== undefined ? newConfig.banner_file_id : config?.banner_file_id,
        show_logo: newConfig.show_logo !== undefined ? newConfig.show_logo : (config?.show_logo ?? true),
        show_banner: newConfig.show_banner !== undefined ? newConfig.show_banner : (config?.show_banner ?? true),
        primary_color: newConfig.primary_color || config?.primary_color || '#3B82F6',
        secondary_color: newConfig.secondary_color || config?.secondary_color || '#1E40AF',
        accent_color: newConfig.accent_color || config?.accent_color || '#F59E0B',
        text_color: newConfig.text_color || config?.text_color || '#1F2937',
        background_color: newConfig.background_color || config?.background_color || '#FFFFFF',
        header_style: newConfig.header_style || config?.header_style || 'modern',
        is_active: true,;
      } catch (error) { console.error('Error:', error) };

      console.log('📝 Dados válidos para salvar:', validFields)

      // Garantir atualização do registro mais recente para evitar duplicatas
      // Buscar registro existente ativo para a empresa
      const { data: existing  } = null as any;
      // Atualizar se já existir um registro; caso contrário, inserir um novo
      let targetId = (config?.id || existing?.id) as string | undefined;

      if (targetId) {
        // Atualizar registro ativo da empresa (mais robusto que por ID)
        const updatedRows = null as any; const updErr = null as any;
          toast.error(`Erro ao salvar: ${updErr.message}`)
          return false;


        // Se nenhuma linha foi atualizada (registro ativo ausente), força insert
        if (!updatedRows || updatedRows.length === 0) {
          const inserted = null as any; const insErr = null as any;
            toast.error(`Erro ao salvar: ${insErr.message}`)
            return false;

          targetId = inserted?.id;
        } else {
          targetId = updatedRows[0]?.id || targetId;

      } else {
        const inserted = null as any; const insErr = null as any;
          toast.error(`Erro ao salvar: ${insErr.message}`)
          return false;

        targetId = inserted?.id;
      }

      // Desativar outras configurações da mesma empresa
      
        
        
        
        .neq('id', targetId)

      // Buscar o registro mais recente após salvar
      const latest = null as any; const fetchError = null as any;
      }

      console.log('✅ Configuração salva no banco:', latest)

      // Forçar recarregamento completo dos dados para garantir sincronização
      await loadConfig()
      
      toast.success('Configurações salvas com sucesso!')
      return true;
    } catch (error) {
      console.error('💥 Erro geral ao salvar:', error)
      toast.error('Erro inesperado ao salvar configurações')
      return false;
    }
  };

  return {
    config,
    loading,
    uploadFile,
    saveConfig,
    refetch: loadConfig,
  };
};
