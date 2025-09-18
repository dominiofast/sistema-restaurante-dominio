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
  Banknote
} from 'lucide-react';
import { useAsaasConfig, AsaasConfigData } from '@/hooks/useAsaasConfig';
import { useToast } from '@/hooks/use-toast';
import { AsaasMonitoring } from './AsaasMonitoring';

interface AsaasConfigProps {
  companyId: string;


export const AsaasConfig: React.FC<AsaasConfigProps> = ({ companyId }) => {
  const { config, loading, error, saveConfig, testCredentials } = useAsaasConfig(companyId);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<AsaasConfigData>({
    api_key: '',
    pix_enabled: true,
    card_enabled: true,
    is_active: false,
    sandbox_mode: true,
    webhook_token: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Atualizar formData quando config for carregado
  useEffect(() => {
    if (config) {
      setFormData({
        api_key: config.api_key || '',
        pix_enabled: config.pix_enabled !== false,
        card_enabled: config.card_enabled !== false,
        is_active: config.is_active || false,
        sandbox_mode: config.sandbox_mode !== false,
        webhook_token: config.webhook_token || '',
      });
    }
  }, [config]);

  const handleInputChange = (field: keyof AsaasConfigData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value;
    }));
  };

  const handleSave = async () => {;
    setSaving(true);
    try {
      await saveConfig(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.api_key) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha a API Key para testar',
        variant: 'destructive',;
      });
      return;
    }

    setTesting(true);
    try {
      await testCredentials(formData.api_key, formData.sandbox_mode);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Carregando configurações do Asaas...</span>
      </div>
    );


  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar configurações: {error}
        </AlertDescription>
      </Alert>
    );


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Banknote className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asaas</h2>
          <p className="text-gray-600">Configure PIX + Cartão via Asaas (API brasileira confiável)</p>
        </div>
      </div>

      {/* Instruções */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Como obter sua API Key:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Acesse o <a href="https://www.asaas.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">painel do Asaas <ExternalLink className="h-3 w-3" /></a></li>
              <li>Vá em "Integrações" → "API"</li>
              <li>Copie sua <strong>API Key</strong></li>
              <li>Use API Key de <strong>Sandbox</strong> para testes</li>
              <li>Use API Key de <strong>Produção</strong> para vendas reais</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>

      {/* Configurações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credenciais da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Modo Sandbox */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Modo Sandbox (Teste)</Label>
              <p className="text-sm text-gray-500">
                Use API Key de sandbox para desenvolvimento
              </p>
            </div>
            <Switch
              checked={formData.sandbox_mode}
              onCheckedChange={(checked) => handleInputChange('sandbox_mode', checked)}
            />
          </div>

          <Separator />

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api_key">
              API Key {formData.sandbox_mode ? '(Sandbox)' : '(Produção)'}
            </Label>
            <Input
              id="api_key"
              type="password"
              placeholder={formData.sandbox_mode ? '$aact_YTU5YjFiNTQtNjQ2NC00...' : '$aact_...'}
              value={formData.api_key}
              onChange={(e) => handleInputChange('api_key', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Chave para autenticar nas APIs do Asaas
            </p>
          </div>

          {/* Webhook Token */}
          <div className="space-y-2">
            <Label htmlFor="webhook_token">
              Webhook Token (Opcional)
            </Label>
            <Input
              id="webhook_token"
              type="password"
              placeholder="Token para validar webhooks"
              value={formData.webhook_token}
              onChange={(e) => handleInputChange('webhook_token', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Token para validar autenticidade dos webhooks
            </p>
          </div>

          {/* Teste das Credenciais */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || !formData.api_key}
              className="flex items-center gap-2"
            >
              <TestTube2 className="h-4 w-4" />
              {testing ? 'Testando...' : 'Testar API Key'}
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
                Pagamento instantâneo via PIX
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
                Pagamentos com cartão via Asaas
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

          {formData.is_active && !formData.api_key && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Configure a API Key antes de ativar a integração
              </AlertDescription>
            </Alert>
          )}

          {formData.is_active && formData.api_key && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Integração Asaas configurada e ativa! 
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
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Monitoramento */}
      {config?.is_active && (
        <AsaasMonitoring companyId={companyId} />
      )}
    </div>
  );
};
