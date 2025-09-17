import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Key, 
  TestTube2, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Info,
  Zap
} from 'lucide-react';
import { useStripeConfig, StripeConfigData } from '@/hooks/useStripeConfig';
import { useToast } from '@/hooks/use-toast';

interface StripeConfigProps {
  companyId: string;
}

export const StripeConfig: React.FC<StripeConfigProps> = ({ companyId }) => {
  const { config, loading, error, saveConfig, testCredentials } = useStripeConfig(companyId);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<StripeConfigData>({
    publishable_key: '',
    secret_key: '',
    pix_enabled: true,
    card_enabled: true,
    is_active: false,
    test_mode: true,
    webhook_endpoint_secret: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Atualizar formData quando config for carregado
  useEffect(() => {
    if (config) {
      setFormData({
        publishable_key: config.publishable_key || '',
        secret_key: config.secret_key || '',
        pix_enabled: config.pix_enabled !== false,
        card_enabled: config.card_enabled !== false,
        is_active: config.is_active || false,
        test_mode: config.test_mode !== false,
        webhook_endpoint_secret: config.webhook_endpoint_secret || '',
      });
    }
  }, [config]);

  const handleInputChange = (field: keyof StripeConfigData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.publishable_key || !formData.secret_key) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha as chaves para testar as credenciais',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      await testCredentials(formData.publishable_key, formData.secret_key);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações do Stripe...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar configurações: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Zap className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stripe</h2>
          <p className="text-gray-600">Configure PIX + Cartão via Stripe para aceitar pagamentos</p>
        </div>
      </div>

      {/* Instruções */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Como obter suas chaves:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Acesse o <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Dashboard Stripe <ExternalLink className="h-3 w-3" /></a></li>
              <li>Vá em "Developers" → "API keys"</li>
              <li>Copie a <strong>Publishable key</strong> e <strong>Secret key</strong></li>
              <li>Para PIX: certifique-se que sua conta tem PIX habilitado no Brasil</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>

      {/* Configurações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Chaves da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Modo Teste */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Modo Teste</Label>
              <p className="text-sm text-gray-500">
                Use chaves de teste para desenvolvimento
              </p>
            </div>
            <Switch
              checked={formData.test_mode}
              onCheckedChange={(checked) => handleInputChange('test_mode', checked)}
            />
          </div>

          <Separator />

          {/* Publishable Key */}
          <div className="space-y-2">
            <Label htmlFor="publishable_key">
              Publishable Key {formData.test_mode ? '(Teste)' : '(Produção)'}
            </Label>
            <Input
              id="publishable_key"
              type="text"
              placeholder={formData.test_mode ? 'pk_test_...' : 'pk_live_...'}
              value={formData.publishable_key}
              onChange={(e) => handleInputChange('publishable_key', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Chave pública para identificar sua conta
            </p>
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="secret_key">
              Secret Key {formData.test_mode ? '(Teste)' : '(Produção)'}
            </Label>
            <Input
              id="secret_key"
              type="password"
              placeholder={formData.test_mode ? 'sk_test_...' : 'sk_live_...'}
              value={formData.secret_key}
              onChange={(e) => handleInputChange('secret_key', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Chave secreta para autenticar nas APIs
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="webhook_secret">
              Webhook Endpoint Secret (Opcional)
            </Label>
            <Input
              id="webhook_secret"
              type="password"
              placeholder="whsec_..."
              value={formData.webhook_endpoint_secret}
              onChange={(e) => handleInputChange('webhook_endpoint_secret', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Para verificar autenticidade dos webhooks
            </p>
          </div>

          {/* Teste das Credenciais */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || !formData.publishable_key || !formData.secret_key}
              className="flex items-center gap-2"
            >
              <TestTube2 className="h-4 w-4" />
              {testing ? 'Testando...' : 'Testar Credenciais'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métodos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PIX */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">PIX</Label>
              <p className="text-sm text-gray-500">
                Pagamento instantâneo via PIX (requer aprovação Stripe)
              </p>
            </div>
            <Switch
              checked={formData.pix_enabled}
              onCheckedChange={(checked) => handleInputChange('pix_enabled', checked)}
            />
          </div>

          <Separator />

          {/* Cartão */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Cartão de Crédito/Débito</Label>
              <p className="text-sm text-gray-500">
                Pagamentos com cartão via Stripe
              </p>
            </div>
            <Switch
              checked={formData.card_enabled}
              onCheckedChange={(checked) => handleInputChange('card_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status da Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Integração Ativa</Label>
              <p className="text-sm text-gray-500">
                Ativar para começar a aceitar pagamentos
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
          </div>

          {formData.is_active && (!formData.publishable_key || !formData.secret_key) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Configure as chaves antes de ativar a integração
              </AlertDescription>
            </Alert>
          )}

          {formData.is_active && formData.publishable_key && formData.secret_key && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Integração Stripe configurada e ativa! 
                {formData.pix_enabled && ' PIX habilitado.'}
                {formData.card_enabled && ' Cartão habilitado.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};
