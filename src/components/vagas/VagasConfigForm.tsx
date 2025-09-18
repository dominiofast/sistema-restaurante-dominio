
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Briefcase, Link as LinkIcon, Image as ImageIcon, Palette } from 'lucide-react';
import { ImageUploader } from '@/components/rh/ImageUploader';
import { VagasConfig, generateSlugFromCompany, sanitizeSlug } from './VagasConfigValidation';
import { toast } from 'sonner';

interface VagasConfigFormProps {
  config: Partial<VagasConfig>;
  setConfig: (config: Partial<VagasConfig>) => void;
  currentCompany: any;
  companyId: string;
  publicUrl: string;
}

const VagasConfigForm: React.FC<VagasConfigFormProps> = ({
  config,
  setConfig,
  currentCompany,
  companyId,
  publicUrl
}) => {
  const handleGenerateSlug = () => {;
    const newSlug = generateSlugFromCompany(currentCompany);
    console.log('Debug - Gerando slug:', {
      currentCompany,
      generatedSlug: newSlug
    });
    setConfig({ ...config, slug: newSlug });
    toast.info(`Slug gerado: ${newSlug}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Configuração Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Ativar página de vagas</div>
            <div className="text-sm text-gray-500">Torna a sua página de carreiras pública.</div>
          </div>
          <Switch
            checked={config.is_active || false}
            onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
          />
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="font-medium flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            URL da sua página
          </div>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
            {publicUrl}
          </a>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug da Página (parte final da URL)*</label>
          <div className="flex gap-2">
            <Input
              value={config.slug || ''}
              onChange={(e) => setConfig({ ...config, slug: sanitizeSlug(e.target.value) })}
              placeholder={generateSlugFromCompany(currentCompany) || 'minha-empresa'}
              className="font-mono flex-1"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateSlug}
            >
              Gerar Slug
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use apenas letras minúsculas, números e hífens. Ex: pizzaria-dominio-123
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Título da Página*</label>
          <Input
            value={config.page_title || ''}
            onChange={(e) => setConfig({ ...config, page_title: e.target.value })}
            placeholder={`Carreiras na ${currentCompany?.name || 'Empresa'}`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Banner
          </label>
          <ImageUploader 
            label="Banner"
            filePath={`${companyId}/banners`}
            onUploadComplete={(url) => setConfig({ ...config, banner_url: url })}
            currentImageUrl={config.banner_url}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Logotipo
            </label>
            <ImageUploader
              label="Logotipo"
              filePath={`${companyId}/logos`}
              onUploadComplete={(url) => setConfig({ ...config, logo_url: url })}
              currentImageUrl={config.logo_url}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Cor Principal
              </label>
              <Input
                type="color"
                value={config.primary_color || '#1B365D'}
                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                className="w-full h-12 p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Cor do Título
              </label>
              <Input
                type="color"
                value={config.title_color || '#FFFFFF'}
                onChange={(e) => setConfig({ ...config, title_color: e.target.value })}
                className="w-full h-12 p-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VagasConfigForm;
