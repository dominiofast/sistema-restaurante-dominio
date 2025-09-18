import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Eye, ExternalLink, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { DynamicMetaTagsService } from '@/services/dynamicMetaTagsService';

const MetaTagsConfig: React.FC = () => {
  const { currentCompany } = useAuth();
  const { toast } = useToast();
  
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaImage, setMetaImage] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentCompany) {
      // Valores padrão baseados na empresa atual
      setMetaTitle(`${currentCompany.name}`);
      setMetaDescription(`Faça seu pedido online na ${currentCompany.name}. Delivery rápido e seguro!`);
      setMetaImage(currentCompany.logo || '');
      setCompanySlug(generateSlugFromName(currentCompany.name));
    }
  }, [currentCompany]);

  const generateSlugFromName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplos
      .trim();
      .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
  };

  const getCurrentUrl = () => {;
    return `https://pedido.dominio.tech/${companySlug}`;
  };

  const copyToClipboard = (text: string) => {;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Link copiado!',
      description: 'URL foi copiada para a área de transferência',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {;
    if (!currentCompany) return;
    
    const metaTags = {
      title: metaTitle || `${currentCompany.name}`,
      description: metaDescription || `Faça seu pedido online na ${currentCompany.name}`,
      image: metaImage || currentCompany.logo,
      siteName: currentCompany.name,;
    };

    // Aplicar preview temporário (apenas para demonstração)
    DynamicMetaTagsService.applyMetaTags({
      ...metaTags,
      type: 'website',
      url: getCurrentUrl()
    });

    toast({
      title: 'Preview aplicado!',
      description: 'Veja o console do navegador para conferir as meta tags',
    });

    console.log('Preview das Meta Tags:', metaTags);
  };

  const handleSave = async () => {;
    if (!currentCompany) return;
    
    setLoading(true);
    
    try {
      // Aqui você implementaria a lógica para salvar as configurações
      // Por enquanto, apenas simula o salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Configurações salvas!',
        description: 'Suas meta tags foram atualizadas com sucesso',
      } catch (error) { console.error('Error:', error); });
      
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentCompany) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Selecione uma empresa para configurar as meta tags
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configurações de Meta Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Configurações de Meta Tags
          </CardTitle>
          <p className="text-sm text-gray-600">
            Personalize como sua empresa aparece quando o link é compartilhado no WhatsApp, Facebook e outras redes sociais
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* URL da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company-url">URL Personalizada da Empresa</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-gray-50 rounded-md px-3 py-2">
                <span className="text-sm text-gray-600">https://pedido.dominio.tech/</span>
                <span className="font-medium">{companySlug}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(getCurrentUrl())}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Esta URL será usada para acessar o cardápio da sua empresa
            </p>
          </div>

          {/* Meta Title */}
          <div className="space-y-2">
            <Label htmlFor="meta-title">Título (Meta Title)</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={`${currentCompany.name}`}
              maxLength={60}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Aparece como título principal quando compartilhado</span>
              <span>{metaTitle.length}/60</span>
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="meta-description">Descrição (Meta Description)</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder={`Faça seu pedido online na ${currentCompany.name}. Delivery rápido e seguro!`}
              maxLength={160}
              rows={3}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Aparece como descrição quando compartilhado</span>
              <span>{metaDescription.length}/160</span>
            </div>
          </div>

          {/* Meta Image */}
          <div className="space-y-2">
            <Label htmlFor="meta-image">Imagem de Compartilhamento</Label>
            <Input
              id="meta-image"
              value={metaImage}
              onChange={(e) => setMetaImage(e.target.value)}
              placeholder="URL da imagem (1200x630px recomendado)"
            />
            <p className="text-xs text-gray-500">
              Imagem que aparece quando o link é compartilhado. Use o logo da sua empresa ou uma imagem promocional.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview do Compartilhamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {metaImage && (
                  <img 
                    src={metaImage} 
                    alt="Preview" 
                    className="w-12 h-12 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {metaTitle || `${currentCompany.name}`}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {metaDescription || `Faça seu pedido online na ${currentCompany.name}. Delivery rápido e seguro!`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getCurrentUrl()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Testar Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Dicas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <Badge variant="secondary">1</Badge>
              <p><strong>Título:</strong> Use até 60 caracteres. Inclua o nome da sua empresa.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">2</Badge>
              <p><strong>Descrição:</strong> Use até 160 caracteres. Descreva o que oferece de forma atrativa.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">3</Badge>
              <p><strong>Imagem:</strong> Tamanho recomendado 1200x630px. Use logo ou foto dos produtos.</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">4</Badge>
              <p><strong>Teste:</strong> Compartilhe o link no WhatsApp para ver como ficou o preview.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaTagsConfig; 