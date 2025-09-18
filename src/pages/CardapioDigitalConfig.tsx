
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Save, 
  Palette, 
  Image, 
  Monitor,
  Smartphone,
  RefreshCw,
  Check,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBrandingConfigCloudinary, BrandingConfig } from '@/hooks/useBrandingConfigCloudinary';
import { toast } from 'sonner';

const CardapioDigitalConfig: React.FC = () => {
  const { currentCompany } = useAuth();
  const { config: brandingConfig, loading, uploadFile, saveConfig } = useBrandingConfigCloudinary();
  
  const [config, setConfig] = useState<BrandingConfig>({
    company_id: currentCompany?.id || '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#F59E0B',
    text_color: '#1F2937',
    background_color: '#FFFFFF',
    header_style: 'modern',
    show_banner: true,
    show_logo: true,
  });
  
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar com dados carregados do banco
  useEffect(() => {
    if (brandingConfig) {
      setConfig(brandingConfig);
    }
  }, [brandingConfig]);

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    try {
      const fileId = await uploadFile(file, type);
      if (fileId) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setConfig(prev => ({
            ...prev,
            [`${type}_url`]: result,
            [`${type}_file_id`]: fileId,
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveConfig(config);
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setConfig(prev => ({
      ...prev,
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF',
      accent_color: '#F59E0B',
      text_color: '#1F2937',
      background_color: '#FFFFFF',
      header_style: 'modern',
      show_banner: true,
      show_logo: true,
    }));
  };

  const previewUrl = `https://pedido.dominio.tech/${currentCompany?.slug || currentCompany?.id}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Cardápio Digital</h1>
          <p className="text-gray-600">Personalize a aparência do seu cardápio público</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(previewUrl, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Cardápio
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upload de Imagens */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="h-5 w-5" />
              Imagens da Marca
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo da Empresa
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  {config.logo_url ? (
                    <div className="space-y-2">
                      <img src={config.logo_url} alt="Logo" className="h-20 mx-auto object-contain" />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Alterar Logo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Fazer Upload do Logo
                      </button>
                      <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('logo', file);
                  }}
                />
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.show_logo}
                      onChange={(e) => setConfig(prev => ({ ...prev, show_logo: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Exibir logo no cardápio</span>
                  </label>
                </div>
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner do Cabeçalho
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  {config.banner_url ? (
                    <div className="space-y-2">
                      <img src={config.banner_url} alt="Banner" className="h-20 w-full mx-auto object-cover rounded" />
                      <button
                        onClick={() => bannerInputRef.current?.click()}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Alterar Banner
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <button
                        onClick={() => bannerInputRef.current?.click()}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Fazer Upload do Banner
                      </button>
                      <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('banner', file);
                  }}
                />
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.show_banner}
                      onChange={(e) => setConfig(prev => ({ ...prev, show_banner: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Exibir banner no cabeçalho</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Cores da Marca */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Cores da Marca
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Primária
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.accent_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={config.accent_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Texto
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.text_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, text_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={config.text_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, text_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Fundo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.background_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, background_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={config.background_color}
                    onChange={(e) => setConfig(prev => ({ ...prev, background_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Restaurar Cores Padrão
              </button>
            </div>
          </div>

          {/* Estilo do Cabeçalho */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Estilo do Cabeçalho
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['modern', 'classic', 'minimal'] as const).map((style) => (
                <label key={style} className="cursor-pointer">
                  <input
                    type="radio"
                    name="headerStyle"
                    value={style}
                    checked={config.header_style === style}
                    onChange={(e) => setConfig(prev => ({ ...prev, header_style: e.target.value as any }))}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg transition-colors ${
                    config.header_style === style 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-sm font-medium text-gray-900 capitalize mb-1">
                      {style === 'modern' ? 'Moderno' : style === 'classic' ? 'Clássico' : 'Minimalista'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {style === 'modern' && 'Design atual com gradientes'}
                      {style === 'classic' && 'Estilo tradicional elegante'}
                      {style === 'minimal' && 'Layout limpo e simples'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Preview Frame */}
            <div className={`border border-gray-300 rounded-lg overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
            }`}>
              <div 
                className="p-4 min-h-[400px]"
                style={{ 
                  backgroundColor: config.background_color,
                  color: config.text_color 
                }}
              >
                {/* Header Preview */}
                <div 
                  className="rounded-lg p-4 mb-4"
                  style={{ 
                    backgroundColor: config.primary_color,
                    backgroundImage: config.show_banner && config.banner_url ? `url(${config.banner_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {config.show_logo && config.logo_url && (
                      <img src={config.logo_url} alt="Logo" className="h-8 w-8 object-contain" />
                    )}
                    <div>
                      <h1 className="text-white font-bold text-lg">
                        {currentCompany?.name || 'Sua Empresa'}
                      </h1>
                      <p className="text-white/80 text-sm">Cardápio Digital</p>
                    </div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-3">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: config.primary_color + '20' }}
                  >
                    <h3 className="font-semibold" style={{ color: config.primary_color }}>
                      Categoria Exemplo
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <h4 className="font-medium">Produto Exemplo</h4>
                        <p className="text-sm opacity-70">Descrição do produto</p>
                      </div>
                      <span 
                        className="font-bold"
                        style={{ color: config.accent_color }}
                      >
                        R$ 25,90
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardapioDigitalConfig;
