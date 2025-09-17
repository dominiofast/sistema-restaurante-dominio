import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Store, Key, Globe, CheckCircle, AlertTriangle, TestTube, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IFoodGlobalConfig {
  client_id: string;
  client_secret: string;
  environment: string;
  is_active: boolean;
}

const SuperAdminIFoodGlobalConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [isConfigSet, setIsConfigSet] = useState(false);
  const [allowEdit, setAllowEdit] = useState(false);
  
  const [config, setConfig] = useState<IFoodGlobalConfig>({
    client_id: '',
    client_secret: '',
    environment: 'sandbox',
    is_active: false
  });

  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({ tested: false, success: false, message: '' });

  useEffect(() => {
    checkExistingConfig();
  }, []);

  const checkExistingConfig = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verificando configuração existente do iFood...');
      
      // Verificar se existe configuração via função edge (que acessa os secrets)
      const { data, error } = await supabase.functions.invoke('get-ifood-config');
      
      console.log('📊 Resposta do get-ifood-config:', data);
      
      if (error) {
        console.error('❌ Erro ao verificar configuração:', error);
        setAllowEdit(true); // Permitir edição se houve erro
        return;
      }
      
      if (data?.hasConfig) {
        console.log('✅ Configuração existente encontrada');
        setIsConfigSet(true);
        setAllowEdit(false); // Não permitir edição inicialmente
        setConfig(prev => ({
          ...prev,
          environment: data.environment || 'sandbox',
          is_active: data.is_active || false
        }));
      } else {
        console.log('❌ Nenhuma configuração encontrada - permitindo edição');
        setIsConfigSet(false);
        setAllowEdit(true); // Permitir edição se não há configuração
      }
    } catch (error) {
      console.error('❌ Erro ao verificar configuração:', error);
      setIsConfigSet(false);
      setAllowEdit(true); // Permitir edição se houve erro
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (allowEdit && (!config.client_id || !config.client_secret)) {
      toast.error('Client ID e Client Secret são obrigatórios');
      return;
    }

    if (allowEdit && !config.client_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      toast.error('Client ID deve ser um UUID válido');
      return;
    }

    if (allowEdit && config.client_secret.length < 35) {
      toast.error('Client Secret deve ter pelo menos 35 caracteres');
      return;
    }

    setSaving(true);
    try {
      console.log('🔄 Enviando configuração para validação...');
      
      const { data, error } = await supabase.functions.invoke('save-ifood-config', {
        body: config
      });

      console.log('📊 Resposta da função:', { data, error });

      if (error) {
        console.error('❌ Erro na invocação da função:', error);
        
        // Tentar extrair mensagem mais específica do erro
        let errorMessage = error.message;
        
        if (error.context?.body) {
          try {
            const errorBody = JSON.parse(error.context.body);
            errorMessage = errorBody.error || errorMessage;
          } catch (e) {
            console.log('Não foi possível fazer parse do erro:', e);
          }
        }
        
        throw new Error(errorMessage);
      }

      if (data?.success) {
        console.log('✅ Configuração salva com sucesso');
        setIsConfigSet(true);
        setAllowEdit(false);
        setConfig(prev => ({ ...prev, client_id: '', client_secret: '' })); // Limpar campos sensíveis
        
        toast.success('✅ Configuração iFood salva com sucesso!');
        setConnectionStatus({ tested: false, success: false, message: '' });
        
        // Recarregar a verificação de configuração
        setTimeout(() => {
          checkExistingConfig();
        }, 1000);
      } else {
        const errorMsg = data?.error || 'Erro desconhecido ao salvar configuração';
        console.error('❌ Erro retornado pela função:', errorMsg);
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!isConfigSet) {
      toast.error('Configure e salve as credenciais antes de testar');
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-ifood-connection', {
        body: { environment: config.environment }
      });

      if (error) throw error;

      setConnectionStatus({
        tested: true,
        success: data.success,
        message: data.message
      });

      if (data.success) {
        toast.success('✅ Conexão com iFood funcionando!');
      } else {
        toast.error(`❌ ${data.message}`);
      }
      
    } catch (error) {
      console.error('Erro no teste:', error);
      setConnectionStatus({
        tested: true,
        success: false,
        message: `Erro ao testar: ${error.message}`
      });
      toast.error(`❌ Erro ao testar conexão: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <Store className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuração Global iFood</h1>
            <p className="text-gray-600">Configuração centralizada das credenciais iFood para todas as lojas</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={config.is_active ? "default" : "secondary"} className="flex items-center gap-1">
            {config.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {config.is_active ? 'Sistema Ativo' : 'Sistema Inativo'}
          </Badge>
          
          {connectionStatus.tested && (
            <Badge variant={connectionStatus.success ? "default" : "destructive"} className="flex items-center gap-1">
              {connectionStatus.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {connectionStatus.success ? 'iFood Conectado' : 'iFood com Erro'}
            </Badge>
          )}

          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {config.environment === 'sandbox' ? 'Ambiente de Teste' : 'Produção'}
          </Badge>
        </div>
      </div>

      {/* Status da Conexão */}
      {connectionStatus.tested && (
        <Card className={`mb-6 border-l-4 ${connectionStatus.success ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {connectionStatus.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-medium">
                  {connectionStatus.success ? 'Conexão iFood OK' : 'Problema na Conexão iFood'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {connectionStatus.message}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração das Credenciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Credenciais iFood
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium mb-2">Client ID (UUID)</label>
            <Input
              value={config.client_id}
              onChange={(e) => setConfig({...config, client_id: e.target.value})}
              placeholder={isConfigSet && !allowEdit ? 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' : 'dd4a4bf0-77a6-4b2a-b99b-46bd541e1f0'}
              disabled={!allowEdit}
              className="bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              UUID fornecido pelo iFood no portal do desenvolvedor
            </p>
          </div>

          {/* Client Secret */}
          <div>
            <label className="block text-sm font-medium mb-2">Client Secret</label>
            <Input
              type="password"
              value={config.client_secret}
              onChange={(e) => setConfig({...config, client_secret: e.target.value})}
              placeholder={isConfigSet && !allowEdit ? '***********************************' : 'String alfanumérica de 35+ caracteres'}
              disabled={!allowEdit}
              className="bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              String alfanumérica fornecida pelo iFood (mínimo 35 caracteres)
            </p>
          </div>

          {/* Ambiente */}
          <div>
            <label className="block text-sm font-medium mb-2">Ambiente</label>
            <Select 
              value={config.environment} 
              onValueChange={(value) => setConfig({...config, environment: value})}
              disabled={!allowEdit}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                <SelectItem value="production">Produção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.is_active}
              onCheckedChange={(checked) => setConfig({...config, is_active: checked})}
              disabled={!allowEdit && !isConfigSet}
            />
            <label className="text-sm font-medium">Sistema Ativo</label>
          </div>

          
          {!isConfigSet && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Credenciais iFood não configuradas
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Configure as credenciais manualmente no painel do Supabase ou use o formulário abaixo para testá-las.
                  </p>
                  <div className="mt-3">
                    <Button 
                      onClick={() => window.open('https://supabase.com/dashboard/project/78f1b2d4-13ce-4fc8-8fc4-25d4ea8904e3/settings/functions', '_blank')}
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Configurar no Supabase
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isConfigSet && !allowEdit && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✓ Credenciais configuradas e seguras. Clique em 'Alterar Credenciais' para modificá-las.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            {!allowEdit && isConfigSet && (
              <Button 
                onClick={() => {
                  console.log('🔓 Habilitando edição de credenciais...');
                  setAllowEdit(true);
                  setConfig(prev => ({
                    ...prev,
                    client_id: '',
                    client_secret: ''
                  }));
                }} 
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900"
              >
                Alterar Credenciais
              </Button>
            )}
            
            {allowEdit && (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
                <Button 
                  onClick={() => {
                    console.log('❌ Cancelando edição...');
                    setAllowEdit(false);
                    setConfig(prev => ({
                      ...prev,
                      client_id: '',
                      client_secret: ''
                    }));
                  }} 
                  variant="outline"
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </>
            )}

            {isConfigSet && (
              <Button 
                onClick={testConnection} 
                disabled={testing} 
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {testing ? 'Testando...' : 'Testar Conexão'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Store className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Como funciona</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Configuração Global:</strong> As credenciais (Client ID e Client Secret) são armazenadas 
                  de forma segura no Supabase e usadas por todas as lojas.
                </p>
                <p>
                  <strong>Configuração por Loja:</strong> Cada loja terá apenas suas configurações específicas 
                  (Merchant ID, nome da loja, etc.) sem duplicar as credenciais.
                </p>
                <p>
                  <strong>Segurança:</strong> As credenciais nunca ficam expostas no frontend e são acessadas 
                  apenas pelas funções edge do backend.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminIFoodGlobalConfig;