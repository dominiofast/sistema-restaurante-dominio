import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Image, Palette, Save, Loader2 } from 'lucide-react';
// SUPABASE REMOVIDO
import { toast } from 'sonner';

interface BrandingManagerProps {
  companyId: string;
  onBrandingUpdate?: () => void;
}

interface MediaFile {
  id: string;
  file_url: string;
  file_name: string;
}

interface BrandingConfig {
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
  header_style: string;
  is_active: boolean;
}

export const BrandingManager: React.FC<BrandingManagerProps> = ({ 
  companyId, 
  onBrandingUpdate 
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<MediaFile | null>(null);
  const [bannerFile, setBannerFile] = useState<MediaFile | null>(null);
  
  const [config, setConfig] = useState<BrandingConfig>({
    company_id: companyId,
    show_logo: true,
    show_banner: true,
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#F59E0B',
    text_color: '#1F2937',
    background_color: '#FFFFFF',
    header_style: 'modern',
    is_active: true
  });

  // Carregar configuração existente
  useEffect(() => {
    loadBrandingConfig();
  }, [companyId]);

  const loadBrandingConfig = async () => {
    try {
      setLoading(true);
      
      const { data: brandingData, error: brandingError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'cardapio_branding')
        /* .select\( REMOVIDO */ ; //`
          *,
          logo:media_files!cardapio_branding_logo_file_id_fkey(*),
          banner:media_files!cardapio_branding_banner_file_id_fkey(*)
        `)
        /* .eq\( REMOVIDO */ ; //'company_id', companyId)
        /* .eq\( REMOVIDO */ ; //'is_active', true)
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (brandingError && brandingError.code !== 'PGRST116') {
        throw brandingError;
      }

      if (brandingData) {
        setConfig(brandingData);
        if (brandingData.logo) {
          setLogoFile(brandingData.logo);
        }
        if (brandingData.banner) {
          setBannerFile(brandingData.banner);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar branding:', error);
      toast.error('Erro ao carregar configurações de marca');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, fileType: 'logo' | 'banner'): Promise<MediaFile | null> => {
    try {
      // Upload do arquivo para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId}/${fileType}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await /* supabase REMOVIDO */ null; //storage
        /* .from REMOVIDO */ ; //'media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = /* supabase REMOVIDO */ null; //storage
        /* .from REMOVIDO */ ; //'media')
        .getPublicUrl(fileName);

      // Salvar referência no banco
      const { data: mediaData, error: mediaError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'media_files')
        /* .insert\( REMOVIDO */ ; //{
          company_id: companyId,
          file_name: file.name,
          file_type: fileType,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          alt_text: `${fileType} da empresa`,
          is_active: true
        })
        /* .select\( REMOVIDO */ ; //)
        /* .single\( REMOVIDO */ ; //);

      if (mediaError) throw mediaError;

      return mediaData;
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(`Erro ao fazer upload do ${fileType}`);
      return null;
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'banner') => {
    const mediaFile = await uploadFile(file, type);
    if (mediaFile) {
      if (type === 'logo') {
        setLogoFile(mediaFile);
        setConfig(prev => ({ ...prev, logo_file_id: mediaFile.id }));
      } else {
        setBannerFile(mediaFile);
        setConfig(prev => ({ ...prev, banner_file_id: mediaFile.id }));
      }
      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} carregado com sucesso!`);
    }
  };

  const saveBrandingConfig = async () => {
    try {
      setSaving(true);

      if (config.id) {
        // Atualizar configuração existente
        const { error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'cardapio_branding')
          /* .update\( REMOVIDO */ ; //config)
          /* .eq\( REMOVIDO */ ; //'id', config.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { data, error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'cardapio_branding')
          /* .insert\( REMOVIDO */ ; //config)
          /* .select\( REMOVIDO */ ; //)
          /* .single\( REMOVIDO */ ; //);

        if (error) throw error;
        setConfig(data);
      }

      toast.success('Configurações de marca salvas com sucesso!');
      onBrandingUpdate?.();
    } catch (error: any) {
      console.error('Erro ao salvar branding:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload de Arquivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Arquivos de Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          {/* Logo da Empresa */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Logo da Empresa</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {logoFile ? (
                <div className="space-y-3">
                  <img 
                    src={logoFile.file_url} 
                    alt="Logo" 
                    className="h-20 w-20 object-contain mx-auto border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Logo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload do Logo
                  </Button>
                  <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-logo"
                checked={config.show_logo}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, show_logo: checked }))
                }
              />
              <Label htmlFor="show-logo" className="text-sm">Exibir logo no cardápio</Label>
            </div>
          </div>

          {/* Banner do Cabeçalho */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Banner do Cabeçalho</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {bannerFile ? (
                <div className="space-y-3">
                  <img 
                    src={bannerFile.file_url} 
                    alt="Banner" 
                    className="h-20 w-full object-cover mx-auto border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Banner
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload do Banner
                  </Button>
                  <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                </div>
              )}
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'banner');
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-banner"
                checked={config.show_banner}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, show_banner: checked }))
                }
              />
              <Label htmlFor="show-banner" className="text-sm">Exibir banner no cabeçalho</Label>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Paleta de Cores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Paleta de Cores
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cor Primária</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="color"
                value={config.primary_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, primary_color: e.target.value }))
                }
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.primary_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, primary_color: e.target.value }))
                }
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <Label>Cor de Destaque</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="color"
                value={config.accent_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, accent_color: e.target.value }))
                }
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.accent_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, accent_color: e.target.value }))
                }
                placeholder="#F59E0B"
              />
            </div>
          </div>

          <div>
            <Label>Cor de Fundo</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="color"
                value={config.background_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, background_color: e.target.value }))
                }
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.background_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, background_color: e.target.value }))
                }
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          <div>
            <Label>Cor do Texto</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="color"
                value={config.text_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, text_color: e.target.value }))
                }
                className="w-12 h-10 p-1"
              />
              <Input
                value={config.text_color}
                onChange={(e) => 
                  setConfig(prev => ({ ...prev, text_color: e.target.value }))
                }
                placeholder="#1F2937"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <Button 
        onClick={saveBrandingConfig} 
        disabled={saving}
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </>
        )}
      </Button>
    </div>
  );
};
