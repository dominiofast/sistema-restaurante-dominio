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


export const useBrandingConfigCloudinary = () => {
  const { currentCompany } = useAuth()
  const [config, setConfig] = useState<BrandingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const { uploadFile: cloudinaryUpload, uploading } = useCloudinaryUpload()

  const loadConfig = async () => {
    if (!currentCompany?.id) {
      return;
    }

    try {
      console.log('🔍 Carregando configuração de branding para empresa:', currentCompany.id)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= 
        
        
          *
        `)
        
        
        
        
        
        

      if (error) {
        console.error('❌ Erro ao carregar configuração:', error)
        toast.error('Erro ao carregar configuração de branding')
        return;
      }

      if (data) {
        console.log('✅ Configuração carregada:', data)
        setConfig(data)
      } else {
        // Configuração padrão
        const defaultConfig: BrandingConfig = {
          company_id: currentCompany.id,
          show_logo: true,
          show_banner: false,
          primary_color: '#3B82F6',
          secondary_color: '#1E40AF',
          accent_color: '#F59E0B',
          text_color: '#1F2937',
          background_color: '#FFFFFF',
          header_style: 'modern'
        };
        setConfig(defaultConfig)
      }
    } catch (error) {
      console.error('💥 Erro ao carregar configuração:', error)
      toast.error('Erro ao carregar configuração de branding')
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
      console.log('🔄 Iniciando upload do arquivo via Cloudinary:', file.name)
      
      // Upload para Cloudinary
      const url = await cloudinaryUpload(file, `cardapio/branding/${currentCompany.id} catch (error) { console.error('Error:', error) }/${type}`)
      
      if (url) {
        console.log('✅ Upload concluído:', url)
        return url;
      } else {
        throw new Error('Falha no upload para Cloudinary')
      }

    } catch (error) {
      console.error('💥 Erro no upload:', error)
      toast.error('Erro ao fazer upload do arquivo')
      return null;
    }
  };

  const saveConfig = async (newConfig: BrandingConfig) => {
    if (!currentCompany?.id) {
      toast.error('Empresa não selecionada')
      return false;
    }

    try {
      console.log('💾 Salvando configuração de branding:', newConfig)

      const configData = {
        ...newConfig,
        company_id: currentCompany.id,
        updated_at: new Date().toISOString()
      } catch (error) { console.error('Error:', error) };

      // Verificar se já existe uma configuração
      const { data: existingConfig  } = null as any;
      let result;
      if (existingConfig) {
        // Atualizar configuração existente
        result = 
          
          
          
          
          
      } else {
        // Criar nova configuração
        result = 
          
          
            ...configData,
            created_at: new Date().toISOString()
          })
          
          
      }

      if (result.error) {
        console.error('❌ Erro ao salvar configuração:', result.error)
        toast.error('Erro ao salvar configuração de branding')
        return false;
      }

      console.log('✅ Configuração salva:', result.data)
      setConfig(result.data)
      toast.success('Configuração salva com sucesso!')
      return true;

    } catch (error) {
      console.error('💥 Erro ao salvar configuração:', error)
      toast.error('Erro ao salvar configuração de branding')
      return false;
    }
  };

  return {
    config,
    loading: loading || uploading,
    uploadFile,
    saveConfig,
    setConfig
  };
};
